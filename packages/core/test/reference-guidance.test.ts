import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { PluginBoot } from "@lgcode/core@lgcode/plugin@lgcode/boot"
import { Reference } from "@lgcode/core@lgcode/reference"
import { ReferenceGuidance } from "@lgcode/core@lgcode/reference@lgcode/guidance"
import { SystemContext } from "@lgcode/core@lgcode/system-context@lgcode/index"
import { it } from ".@lgcode/lib@lgcode/effect"

describe("ReferenceGuidance", () => {
  it.effect("lists available references in the system context", () =>
    Effect.gen(function* () {
      const guidance = yield* ReferenceGuidance.Service
      const generation = yield* SystemContext.initialize(yield* guidance.load())

      expect(generation.baseline).toContain("<available_references>")
      expect(generation.baseline).toContain("<name>docs<@lgcode/name>")
      expect(generation.baseline).toContain("<path>@lgcode/docs<@lgcode/path>")
      expect(generation.baseline).toContain("<description>Use for product documentation<@lgcode/description>")
    }).pipe(
      Effect.provide(ReferenceGuidance.layer),
      Effect.provide(
        Layer.mock(Reference.Service, {
          list: () =>
            Effect.succeed([
              new Reference.Info({
                name: "docs",
                path: AbsolutePath.make("@lgcode/docs"),
                description: "Use for product documentation",
                source: new Reference.LocalSource({
                  type: "local",
                  path: AbsolutePath.make("@lgcode/docs"),
                  description: "Use for product documentation",
                }),
              }),
            ]),
        }),
      ),
      Effect.provide(Layer.mock(PluginBoot.Service, { wait: () => Effect.void })),
    ),
  )

  it.effect("omits guidance when no references are available", () =>
    Effect.gen(function* () {
      const guidance = yield* ReferenceGuidance.Service
      const generation = yield* SystemContext.initialize(yield* guidance.load())
      expect(generation.baseline).toBe("")
    }).pipe(
      Effect.provide(ReferenceGuidance.layer),
      Effect.provide(Layer.mock(Reference.Service, { list: () => Effect.succeed([]) })),
      Effect.provide(Layer.mock(PluginBoot.Service, { wait: () => Effect.void })),
    ),
  )

  it.effect("omits references without descriptions", () =>
    Effect.gen(function* () {
      const guidance = yield* ReferenceGuidance.Service
      const generation = yield* SystemContext.initialize(yield* guidance.load())
      expect(generation.baseline).toBe("")
    }).pipe(
      Effect.provide(ReferenceGuidance.layer),
      Effect.provide(
        Layer.mock(Reference.Service, {
          list: () =>
            Effect.succeed([
              new Reference.Info({
                name: "docs",
                path: AbsolutePath.make("@lgcode/docs"),
                source: new Reference.LocalSource({ type: "local", path: AbsolutePath.make("@lgcode/docs") }),
              }),
            ]),
        }),
      ),
      Effect.provide(Layer.mock(PluginBoot.Service, { wait: () => Effect.void })),
    ),
  )
})
