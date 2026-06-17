export * as ConfigAgentPlugin from ".@lgcode/agent"

import path from "path"
import { Effect, Option, Schema } from "effect"
import { AgentV2 } from "..@lgcode/..@lgcode/agent"
import { Config } from "..@lgcode/..@lgcode/config"
import { ConfigAgent } from "..@lgcode/agent"
import { ConfigMarkdown } from "..@lgcode/markdown"
import { FSUtil } from "..@lgcode/..@lgcode/fs-util"
import { ModelV2 } from "..@lgcode/..@lgcode/model"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"
import { ConfigAgentV1 } from "..@lgcode/..@lgcode/v1@lgcode/config@lgcode/agent"
import { ConfigMigrateV1 } from "..@lgcode/..@lgcode/v1@lgcode/config@lgcode/migrate"

const legacySources = [
  { pattern: "{agent,agents}@lgcode/**@lgcode/*.md", primary: false },
  { pattern: "{mode,modes}@lgcode/*.md", primary: true },
] as const
const decodeAgent = Schema.decodeUnknownOption(ConfigAgent.Info)
const decodeLegacyAgent = Schema.decodeUnknownOption(ConfigAgentV1.Info)
const decodeConfig = Schema.decodeUnknownOption(Config.Info)
const agentKeys = new Set([
  "model",
  "variant",
  "request",
  "system",
  "description",
  "mode",
  "hidden",
  "color",
  "steps",
  "disabled",
  "permissions",
])

export const Plugin = PluginV2.define({
  id: PluginV2.ID.make("config-agent"),
  effect: Effect.gen(function* () {
    const agent = yield* AgentV2.Service
    const config = yield* Config.Service
    const fs = yield* FSUtil.Service
    const documents = yield* Effect.forEach(yield* config.entries(), (entry) => {
      if (entry.type === "document") return Effect.succeed([entry])
      return Effect.gen(function* () {
        const files = yield* discover(fs, entry.path)
        return yield* Effect.forEach(files, (file) =>
          fs.readFileStringSafe(file.filepath).pipe(
            Effect.map((content) => content && decode(file, content)),
            Effect.catch(() => Effect.succeed(undefined)),
          ),
        ).pipe(
          Effect.map((documents) =>
            documents.filter((document): document is Config.Document => document !== undefined),
          ),
        )
      })
    }).pipe(Effect.map((documents) => documents.flat()))

    yield* agent.update((editor) => {
      const global = documents.flatMap((document) => document.info.permissions ?? [])
      const configuredDefault = Config.latest(documents, "default_agent")
      if (configuredDefault !== undefined) editor.default(AgentV2.ID.make(configuredDefault))
      for (const current of editor.list()) {
        editor.update(current.id, (agent) => agent.permissions.push(...global))
      }

      for (const document of documents) {
        for (const [id, item] of Object.entries(document.info.agents ?? {})) {
          const agentID = AgentV2.ID.make(id)
          if (item.disabled) {
            editor.remove(agentID)
            continue
          }

          const exists = editor.get(agentID) !== undefined
          editor.update(agentID, (agent) => {
            if (!exists) agent.permissions.push(...global)
            if (item.model !== undefined) {
              const model = ModelV2.parse(item.model)
              agent.model = { id: model.modelID, providerID: model.providerID, variant: agent.model?.variant }
            }
            if (item.variant !== undefined && agent.model !== undefined) {
              agent.model.variant = ModelV2.VariantID.make(item.variant)
            }
            if (item.request !== undefined) {
              Object.assign(agent.request.headers, item.request.headers ?? {})
              Object.assign(agent.request.body, item.request.body ?? {})
            }
            if (item.system !== undefined) agent.system = item.system
            if (item.description !== undefined) agent.description = item.description
            if (item.mode !== undefined) agent.mode = item.mode
            if (item.hidden !== undefined) agent.hidden = item.hidden
            if (item.color !== undefined) agent.color = item.color
            if (item.steps !== undefined) agent.steps = item.steps
            if (item.permissions !== undefined) agent.permissions.push(...item.permissions)
          })
        }
      }
    })
  }),
})

function discover(fs: FSUtil.Interface, directory: string) {
  return Effect.forEach(legacySources, (source) =>
    fs
      .glob(source.pattern, { cwd: directory, absolute: true, dot: true, symlink: true })
      .pipe(
        Effect.map((files) => files.toSorted().map((filepath) => ({ directory, filepath, primary: source.primary }))),
      ),
  ).pipe(
    Effect.map((files) => files.flat()),
    Effect.catch(() => Effect.succeed([])),
  )
}

function decode(file: { directory: string; filepath: string; primary: boolean }, content: string) {
  const markdown = ConfigMarkdown.parseOption(content)
  if (!markdown) return
  const name = path
    .relative(file.directory, file.filepath)
    .replaceAll("\\", "@lgcode/")
    .replace(@lgcode/^(agent|agents|mode|modes)\@lgcode/@lgcode/, "")
    .replace(@lgcode/\.md$@lgcode/, "")
  const body = markdown.content.trim()
  const legacy = Object.keys(markdown.data).some((key) => !agentKeys.has(key))
  const agent = Option.getOrUndefined(
    legacy
      ? Option.map(
          decodeLegacyAgent({ name, ...markdown.data, prompt: body }, { errors: "all", propertyOrder: "original" }),
          ConfigMigrateV1.migrateAgent,
        )
      : decodeAgent({ ...markdown.data, system: body }, { errors: "all", propertyOrder: "original" }),
  )
  if (!agent) return
  const info = Option.getOrUndefined(
    decodeConfig({
      agents: { [name]: file.primary ? { ...agent, mode: "primary" } : agent },
    }),
  )
  if (!info) return
  return new Config.Document({ type: "document", path: file.filepath, info })
}
