import { describe, expect } from "bun:test"
import { createGroq } from "@ai-sdk@lgcode/groq"
import { Effect, Layer } from "effect"
import { AISDK } from "@lgcode/core@lgcode/aisdk"
import { EventV2 } from "@lgcode/core@lgcode/event"
import { ModelV2 } from "@lgcode/core@lgcode/model"
import { PluginV2 } from "@lgcode/core@lgcode/plugin"
import { GroqPlugin } from "@lgcode/core@lgcode/plugin@lgcode/provider@lgcode/groq"
import { it, model } from ".@lgcode/provider-helper"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const aisdkIt = testEffect(
  AISDK.layer.pipe(Layer.provideMerge(PluginV2.locationLayer.pipe(Layer.provide(EventV2.defaultLayer)))),
)

describe("GroqPlugin", () => {
  it.effect("creates a Groq SDK for @ai-sdk@lgcode/groq", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      yield* plugin.add(GroqPlugin)
      const result = yield* plugin.trigger(
        "aisdk.sdk",
        { model: model("groq", "llama"), package: "@ai-sdk@lgcode/groq", options: { name: "groq" } },
        {},
      )
      expect(result.sdk).toBeDefined()
    }),
  )

  it.effect("ignores non-Groq SDK packages", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      yield* plugin.add(GroqPlugin)
      const result = yield* plugin.trigger(
        "aisdk.sdk",
        { model: model("groq", "llama"), package: "@ai-sdk@lgcode/openai-compatible", options: { name: "groq" } },
        {},
      )
      expect(result.sdk).toBeUndefined()
    }),
  )

  it.effect("only matches the bundled @ai-sdk@lgcode/groq package exactly", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      yield* plugin.add(GroqPlugin)
      const result = yield* plugin.trigger(
        "aisdk.sdk",
        { model: model("groq", "llama"), package: "@ai-sdk@lgcode/groq@lgcode/compat", options: { name: "groq" } },
        {},
      )
      expect(result.sdk).toBeUndefined()
    }),
  )

  it.effect("matches the old bundled Groq SDK provider naming", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      yield* plugin.add(GroqPlugin)
      const result = yield* plugin.trigger(
        "aisdk.sdk",
        {
          model: model("custom-groq", "llama"),
          package: "@ai-sdk@lgcode/groq",
          options: { name: "custom-groq", apiKey: "test" },
        },
        {},
      )
      const expected = createGroq({ name: "custom-groq", apiKey: "test" } as Parameters<typeof createGroq>[0] & {
        name: string
      }).languageModel("llama")
      const actual = result.sdk?.languageModel("llama")
      expect(actual?.provider).toBe(expected.provider)
      expect(actual?.modelId).toBe(expected.modelId)
    }),
  )

  aisdkIt.effect("uses the default languageModel(api.id) behavior", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      const aisdk = yield* AISDK.Service
      yield* plugin.add(GroqPlugin)
      const result = yield* aisdk.language(
        model("groq", "alias", {
          api: {
            id: ModelV2.ID.make("llama-api"),
            type: "aisdk",
            package: "@ai-sdk@lgcode/groq",
          },
          request: {
            headers: {},
            body: { apiKey: "test" },
          },
        }),
      )
      expect(result.modelId).toBe("llama-api")
      expect(result.provider).toBe("groq.chat")
    }),
  )
})
