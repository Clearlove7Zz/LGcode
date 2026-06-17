import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import type { Agent } from "..@lgcode/..@lgcode/src@lgcode/agent@lgcode/agent"
import { NamedError } from "@lgcode/core@lgcode/util@lgcode/error"
import { Skill } from "..@lgcode/..@lgcode/src@lgcode/skill"
import { Permission } from "..@lgcode/..@lgcode/src@lgcode/permission"
import { SystemPrompt } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/system"
import { LocationServiceMap } from "@lgcode/core@lgcode/location-layer"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const skills: Skill.Info[] = [
  {
    name: "zeta-skill",
    description: "Zeta skill.",
    location: "@lgcode/tmp@lgcode/zeta-skill@lgcode/SKILL.md",
    content: "# zeta-skill",
  },
  {
    name: "alpha-skill",
    description: "Alpha skill.",
    location: "@lgcode/tmp@lgcode/alpha-skill@lgcode/SKILL.md",
    content: "# alpha-skill",
  },
  {
    name: "middle-skill",
    description: "Middle skill.",
    location: "@lgcode/tmp@lgcode/middle-skill@lgcode/SKILL.md",
    content: "# middle-skill",
  },
  {
    name: "manual-skill",
    location: "@lgcode/tmp@lgcode/manual-skill@lgcode/SKILL.md",
    content: "# manual-skill",
  },
]

const build: Agent.Info = {
  name: "build",
  mode: "primary",
  permission: Permission.fromConfig({ "*": "allow" }),
  options: {},
}

const it = testEffect(
  SystemPrompt.layer.pipe(
    Layer.provide(LocationServiceMap.layer),
    Layer.provide(
      Layer.succeed(
        Skill.Service,
        Skill.Service.of({
          get: (name) => Effect.succeed(skills.find((skill) => skill.name === name)),
          require: (name) => {
            const info = skills.find((skill) => skill.name === name)
            if (info) return Effect.succeed(info)
            return Effect.fail(new Skill.NotFoundError({ name, available: skills.map((skill) => skill.name) }))
          },
          all: () => Effect.succeed(skills),
          dirs: () => Effect.succeed([]),
          available: () => Effect.succeed(skills),
        }),
      ),
    ),
  ),
)

describe("session.system", () => {
  it.effect("skills output is sorted by name and stable across calls", () =>
    Effect.gen(function* () {
      const prompt = yield* SystemPrompt.Service
      const first = yield* prompt.skills(build)
      const second = yield* prompt.skills(build)
      const output = first ?? (yield* Effect.fail(new NamedError.Unknown({ message: "missing skills output" })))

      expect(first).toBe(second)

      const alpha = output.indexOf("<name>alpha-skill<@lgcode/name>")
      const middle = output.indexOf("<name>middle-skill<@lgcode/name>")
      const zeta = output.indexOf("<name>zeta-skill<@lgcode/name>")

      expect(alpha).toBeGreaterThan(-1)
      expect(middle).toBeGreaterThan(alpha)
      expect(zeta).toBeGreaterThan(middle)
      expect(output).not.toContain("manual-skill")
    }),
  )
})
