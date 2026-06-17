export * as ConfigCommandPlugin from ".@lgcode/command"

import path from "path"
import { Effect, Option, Schema } from "effect"
import { CommandV2 } from "..@lgcode/..@lgcode/command"
import { Config } from "..@lgcode/..@lgcode/config"
import { FSUtil } from "..@lgcode/..@lgcode/fs-util"
import { ModelV2 } from "..@lgcode/..@lgcode/model"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"
import { ConfigCommand } from "..@lgcode/command"
import { ConfigMarkdown } from "..@lgcode/markdown"

const decodeCommand = Schema.decodeUnknownOption(ConfigCommand.Info)

export const Plugin = PluginV2.define({
  id: PluginV2.ID.make("config-command"),
  effect: Effect.gen(function* () {
    const command = yield* CommandV2.Service
    const config = yield* Config.Service
    const fs = yield* FSUtil.Service
    const transform = yield* command.transform()
    const documents = yield* Effect.forEach(yield* config.entries(), (entry) => {
      if (entry.type === "document") return Effect.succeed([{ commands: entry.info.commands }])
      return loadDirectory(fs, entry.path).pipe(
        Effect.map((commands) => [
          { commands: Object.fromEntries(commands.map((command) => [command.name, command.info])) },
        ]),
      )
    }).pipe(Effect.map((documents) => documents.flat()))

    yield* transform((editor) => {
      for (const document of documents) {
        for (const [name, command] of Object.entries(document.commands ?? {})) {
          editor.update(name, (item) => {
            item.template = command.template
            if (command.description !== undefined) item.description = command.description
            if (command.agent !== undefined) item.agent = command.agent
            if (command.model !== undefined) {
              const model = ModelV2.parse(command.model)
              item.model = { id: model.modelID, providerID: model.providerID, variant: item.model?.variant }
            }
            if (command.variant !== undefined && item.model !== undefined) {
              item.model.variant = ModelV2.VariantID.make(command.variant)
            }
            if (command.subtask !== undefined) item.subtask = command.subtask
          })
        }
      }
    })
  }),
})

function loadDirectory(fs: FSUtil.Interface, directory: string) {
  return Effect.gen(function* () {
    const files = yield* fs
      .glob("{command,commands}@lgcode/**@lgcode/*.md", { cwd: directory, absolute: true, dot: true, symlink: true })
      .pipe(Effect.catch(() => Effect.succeed([] as string[])))
    return yield* Effect.forEach(files.toSorted(), (filepath) =>
      fs.readFileStringSafe(filepath).pipe(
        Effect.map((content) => (content === undefined ? undefined : decode(directory, filepath, content))),
        Effect.catch(() => Effect.succeed(undefined)),
      ),
    ).pipe(
      Effect.map((commands) =>
        commands.filter((command): command is { name: string; info: ConfigCommand.Info } => command !== undefined),
      ),
    )
  })
}

function decode(directory: string, filepath: string, content: string) {
  const markdown = ConfigMarkdown.parseOption(content)
  if (!markdown) return
  const info = Option.getOrUndefined(decodeCommand({ ...markdown.data, template: markdown.content.trim() }))
  if (!info) return
  return {
    name: path
      .relative(directory, filepath)
      .replaceAll("\\", "@lgcode/")
      .replace(@lgcode/^(command|commands)\@lgcode/@lgcode/, "")
      .replace(@lgcode/\.md$@lgcode/, ""),
    info,
  }
}
