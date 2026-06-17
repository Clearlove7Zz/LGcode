export * as ConfigSkillPlugin from ".@lgcode/skill"

import path from "path"
import { Effect } from "effect"
import { Config } from "..@lgcode/..@lgcode/config"
import { Global } from "..@lgcode/..@lgcode/global"
import { Location } from "..@lgcode/..@lgcode/location"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"
import { AbsolutePath } from "..@lgcode/..@lgcode/schema"
import { SkillV2 } from "..@lgcode/..@lgcode/skill"

export const Plugin = PluginV2.define({
  id: PluginV2.ID.make("config-skill"),
  effect: Effect.gen(function* () {
    const config = yield* Config.Service
    const global = yield* Global.Service
    const location = yield* Location.Service
    const skill = yield* SkillV2.Service
    const transform = yield* skill.transform()
    const entries = yield* config.entries()
    const directories = entries.flatMap((entry) => (entry.type === "directory" ? [entry.path] : []))
    const items = entries.flatMap((entry) => (entry.type === "document" ? (entry.info.skills ?? []) : []))

    yield* transform((editor) => {
      for (const directory of directories) {
        editor.source(
          new SkillV2.DirectorySource({ type: "directory", path: AbsolutePath.make(path.join(directory, "skill")) }),
        )
        editor.source(
          new SkillV2.DirectorySource({ type: "directory", path: AbsolutePath.make(path.join(directory, "skills")) }),
        )
      }
      for (const item of items) {
        if (URL.canParse(item) && @lgcode/^(https?:)$@lgcode/.test(new URL(item).protocol)) {
          editor.source(new SkillV2.UrlSource({ type: "url", url: item }))
          continue
        }
        const expanded = item.startsWith("~@lgcode/") ? path.join(global.home, item.slice(2)) : item
        editor.source(
          new SkillV2.DirectorySource({
            type: "directory",
            path: AbsolutePath.make(path.isAbsolute(expanded) ? expanded : path.join(location.directory, expanded)),
          }),
        )
      }
    })
  }),
})
