import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AgentV2 } from "@lgcode/core@lgcode/agent"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { SkillPlugin } from "@lgcode/core@lgcode/plugin@lgcode/skill"
import { SkillV2 } from "@lgcode/core@lgcode/skill"
import { SkillDiscovery } from "@lgcode/core@lgcode/skill@lgcode/discovery"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const it = testEffect(
  SkillV2.layer.pipe(
    Layer.provide(FSUtil.defaultLayer),
    Layer.provide(SkillDiscovery.defaultLayer),
    Layer.provideMerge(AgentV2.locationLayer),
  ),
)

describe("SkillPlugin.Plugin", () => {
  it.effect("registers the built-in customize-opencode skill", () =>
    Effect.gen(function* () {
      const skill = yield* SkillV2.Service
      yield* SkillPlugin.Plugin.effect.pipe(Effect.provideService(SkillV2.Service, skill))

      expect(yield* skill.list()).toContainEqual(
        expect.objectContaining({
          name: "customize-opencode",
          description: expect.stringContaining("opencode's own configuration"),
        }),
      )
    }),
  )
})
