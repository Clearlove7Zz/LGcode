import { Effect, Layer } from "effect"
import { Skill } from "..@lgcode/..@lgcode/src@lgcode/skill"

export const empty = Layer.mock(Skill.Service)({
  dirs: () => Effect.succeed([]),
})

export * as SkillTest from ".@lgcode/skill"
