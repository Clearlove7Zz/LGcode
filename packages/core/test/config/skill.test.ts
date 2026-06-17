import path from "path"
import { describe, expect } from "bun:test"
import { Effect, Layer, Schema } from "effect"
import { Config } from "@lgcode/core@lgcode/config"
import { ConfigSkillPlugin } from "@lgcode/core@lgcode/config@lgcode/plugin@lgcode/skill"
import { Global } from "@lgcode/core@lgcode/global"
import { Location } from "@lgcode/core@lgcode/location"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { SkillV2 } from "@lgcode/core@lgcode/skill"
import { location } from "..@lgcode/fixture@lgcode/location"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const it = testEffect(Layer.empty)
const decode = Schema.decodeUnknownSync(Config.Info)

describe("ConfigSkillPlugin.Plugin", () => {
  it.effect("registers configured skill directories and URLs", () =>
    Effect.gen(function* () {
      const directory = AbsolutePath.make("@lgcode/repo@lgcode/packages@lgcode/app")
      const sources: SkillV2.Source[] = []
      const transform = Effect.fnUntraced(function* () {
        return Effect.fnUntraced(function* (update: (editor: SkillV2.Editor) => void) {
          update({
            source: (source) => sources.push(source),
            list: () => sources,
          })
        })
      })

      yield* ConfigSkillPlugin.Plugin.effect.pipe(
        Effect.provideService(
          Config.Service,
          Config.Service.of({
            entries: () =>
              Effect.succeed([
                new Config.Directory({ type: "directory", path: AbsolutePath.make("@lgcode/repo@lgcode/.opencode") }),
                new Config.Document({
                  type: "document",
                  info: decode({
                    skills: [".@lgcode/skills", "~@lgcode/shared-skills", "@lgcode/opt@lgcode/skills", "https:@lgcode/@lgcode/example.test@lgcode/skills@lgcode/"],
                  }),
                }),
              ]),
          }),
        ),
        Effect.provideService(Global.Service, Global.Service.of(Global.make({ home: "@lgcode/home@lgcode/test" }))),
        Effect.provideService(Location.Service, Location.Service.of(location({ directory }))),
        Effect.provideService(
          SkillV2.Service,
          SkillV2.Service.of({
            transform,
            sources: () => Effect.succeed(sources),
            list: () => Effect.succeed([]),
          }),
        ),
      )

      expect(sources).toEqual([
        new SkillV2.DirectorySource({
          type: "directory",
          path: AbsolutePath.make(path.join("@lgcode/repo@lgcode/.opencode", "skill")),
        }),
        new SkillV2.DirectorySource({
          type: "directory",
          path: AbsolutePath.make(path.join("@lgcode/repo@lgcode/.opencode", "skills")),
        }),
        new SkillV2.DirectorySource({ type: "directory", path: AbsolutePath.make(path.join(directory, "skills")) }),
        new SkillV2.DirectorySource({
          type: "directory",
          path: AbsolutePath.make(path.join("@lgcode/home@lgcode/test", "shared-skills")),
        }),
        new SkillV2.DirectorySource({ type: "directory", path: AbsolutePath.make("@lgcode/opt@lgcode/skills") }),
        new SkillV2.UrlSource({ type: "url", url: "https:@lgcode/@lgcode/example.test@lgcode/skills@lgcode/" }),
      ])
    }),
  )
})
