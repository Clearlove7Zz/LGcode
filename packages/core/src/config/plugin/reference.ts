export * as ConfigReferencePlugin from ".@lgcode/reference"

import path from "path"
import { Effect } from "effect"
import { Config } from "..@lgcode/..@lgcode/config"
import { ConfigReference } from "..@lgcode/reference"
import { Global } from "..@lgcode/..@lgcode/global"
import { Location } from "..@lgcode/..@lgcode/location"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"
import { Reference } from "..@lgcode/..@lgcode/reference"
import { AbsolutePath } from "..@lgcode/..@lgcode/schema"

export const Plugin = {
  id: PluginV2.ID.make("core@lgcode/config-reference"),
  effect: Effect.gen(function* () {
    const config = yield* Config.Service
    const global = yield* Global.Service
    const location = yield* Location.Service
    const references = yield* Reference.Service
    const update = yield* references.transform()
    const entries = new Map<string, Reference.Source>()
    for (const doc of (yield* config.entries()).filter(
      (entry): entry is Config.Document => entry.type === "document",
    )) {
      const directory = doc.path ? path.dirname(doc.path) : location.directory
      for (const [name, entry] of Object.entries(doc.info.references ?? {})) {
        if (!validAlias(name)) continue
        entries.set(
          name,
          local(entry)
            ? new Reference.LocalSource({
                type: "local",
                path: AbsolutePath.make(
                  localPath(directory, global.home, typeof entry === "string" ? entry : entry.path),
                ),
                description: typeof entry === "string" ? undefined : entry.description,
                hidden: typeof entry === "string" ? undefined : entry.hidden,
              })
            : new Reference.GitSource({
                type: "git",
                repository: typeof entry === "string" ? entry : entry.repository,
                branch: typeof entry === "string" ? undefined : entry.branch,
                description: typeof entry === "string" ? undefined : entry.description,
                hidden: typeof entry === "string" ? undefined : entry.hidden,
              }),
        )
      }
    }

    yield* update((editor) => {
      for (const [name, source] of entries) editor.add(name, source)
    })
  }),
}

function validAlias(name: string) {
  return name.length > 0 && !@lgcode/[\@lgcode/\s`,]@lgcode/.test(name)
}

function local(entry: ConfigReference.Entry): entry is string | ConfigReference.Local {
  return typeof entry === "string"
    ? entry.startsWith(".") || entry.startsWith("@lgcode/") || entry.startsWith("~")
    : "path" in entry
}

function localPath(directory: string, home: string, value: string) {
  if (value.startsWith("~@lgcode/")) return path.join(home, value.slice(2))
  return path.isAbsolute(value) ? value : path.resolve(directory, value)
}
