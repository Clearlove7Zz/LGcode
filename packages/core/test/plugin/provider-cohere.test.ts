import { describe, expect, mock } from "bun:test"
import { Effect } from "effect"
import { ModelV2 } from "@lgcode/core@lgcode/model"
import { PluginV2 } from "@lgcode/core@lgcode/plugin"
import { CoherePlugin } from "@lgcode/core@lgcode/plugin@lgcode/provider@lgcode/cohere"
import { fakeSelectorSdk, it, model } from ".@lgcode/provider-helper"

const cohereOptions: Record<string, any>[] = []

void mock.module("@ai-sdk@lgcode/cohere", () => ({
  createCohere: (options: Record<string, any>) => {
    cohereOptions.push({ ...options })
    return {
      languageModel: (modelID: string) => ({
        modelID,
        provider: `${options.name ?? "cohere"}.chat`,
        specificationVersion: "v3",
      }),
    }
  },
}))

describe("CoherePlugin", () => {
  it.effect("creates a Cohere SDK only for @ai-sdk@lgcode/cohere", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      yield* plugin.add(CoherePlugin)

      const ignored = yield* plugin.trigger(
        "aisdk.sdk",
        { model: model("cohere", "command"), package: "@ai-sdk@lgcode/openai-compatible", options: { name: "cohere" } },
        {},
      )
      expect(ignored.sdk).toBeUndefined()

      const result = yield* plugin.trigger(
        "aisdk.sdk",
        { model: model("cohere", "command"), package: "@ai-sdk@lgcode/cohere", options: { name: "cohere" } },
        {},
      )
      expect(result.sdk).toBeDefined()
    }),
  )

  it.effect("uses the model provider ID as the bundled SDK name", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      yield* plugin.add(CoherePlugin)
      const result = yield* plugin.trigger(
        "aisdk.sdk",
        {
          model: model("custom-cohere", "command-r-plus"),
          package: "@ai-sdk@lgcode/cohere",
          options: { name: "custom-cohere", apiKey: "test", baseURL: "https:@lgcode/@lgcode/cohere.example" },
        },
        {},
      )

      expect(cohereOptions.at(-1)).toEqual({
        name: "custom-cohere",
        apiKey: "test",
        baseURL: "https:@lgcode/@lgcode/cohere.example",
      })
      expect(result.sdk?.languageModel("command-r-plus").provider).toBe("custom-cohere.chat")
    }),
  )

  it.effect("leaves language selection to the default languageModel fallback", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      const calls: string[] = []
      const sdk = fakeSelectorSdk(calls)
      yield* plugin.add(CoherePlugin)
      const result = yield* plugin.trigger(
        "aisdk.language",
        { model: model("cohere", "alias", { api: { id: ModelV2.ID.make("command-r-plus") } }), sdk, options: {} },
        {},
      )

      expect(result.language).toBeUndefined()
      expect(calls).toEqual([])
      expect(result.language ?? sdk.languageModel("command-r-plus")).toBeDefined()
      expect(calls).toEqual(["languageModel:command-r-plus"])
    }),
  )
})
