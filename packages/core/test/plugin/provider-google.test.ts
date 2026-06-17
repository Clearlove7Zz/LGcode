import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AISDK } from "@lgcode/core@lgcode/aisdk"
import { EventV2 } from "@lgcode/core@lgcode/event"
import { ModelV2 } from "@lgcode/core@lgcode/model"
import { PluginV2 } from "@lgcode/core@lgcode/plugin"
import { GooglePlugin } from "@lgcode/core@lgcode/plugin@lgcode/provider@lgcode/google"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { it, model } from ".@lgcode/provider-helper"

const itWithAISDK = testEffect(
  AISDK.layer.pipe(Layer.provideMerge(PluginV2.locationLayer.pipe(Layer.provide(EventV2.defaultLayer)))),
)

describe("GooglePlugin", () => {
  it.effect("creates a Google Generative AI SDK for @ai-sdk@lgcode/google using the provider ID as SDK name", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      yield* plugin.add(GooglePlugin)
      const result = yield* plugin.trigger(
        "aisdk.sdk",
        {
          model: model("custom-google", "gemini"),
          package: "@ai-sdk@lgcode/google",
          options: { name: "custom-google", apiKey: "test" },
        },
        {},
      )
      expect(result.sdk).toBeDefined()
      expect(result.sdk?.languageModel("gemini").provider).toBe("custom-google")
    }),
  )

  it.effect("ignores non-Google SDK packages", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      yield* plugin.add(GooglePlugin)
      const result = yield* plugin.trigger(
        "aisdk.sdk",
        { model: model("google", "gemini"), package: "@ai-sdk@lgcode/google-vertex", options: { name: "google" } },
        {},
      )
      expect(result.sdk).toBeUndefined()
    }),
  )

  itWithAISDK.effect("uses default languageModel loading with provider ID parity", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      const aisdk = yield* AISDK.Service
      yield* plugin.add(GooglePlugin)
      const language = yield* aisdk.language(
        model("custom-google", "alias", {
          api: {
            id: ModelV2.ID.make("gemini-api"),
            type: "aisdk",
            package: "@ai-sdk@lgcode/google",
          },
          request: {
            headers: {},
            body: { apiKey: "test" },
          },
        }),
      )
      expect(language.modelId).toBe("gemini-api")
      expect(language.provider).toBe("custom-google")
    }),
  )
})
