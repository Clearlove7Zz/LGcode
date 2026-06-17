import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { Credential } from "@lgcode/core@lgcode/credential"
import { Integration } from "@lgcode/core@lgcode/integration"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { Catalog } from "@lgcode/core@lgcode/catalog"
import { Location } from "@lgcode/core@lgcode/location"
import { EventV2 } from "@lgcode/core@lgcode/event"
import { ModelV2 } from "@lgcode/core@lgcode/model"
import { PluginV2 } from "@lgcode/core@lgcode/plugin"
import { CloudflareWorkersAIPlugin } from "@lgcode/core@lgcode/plugin@lgcode/provider@lgcode/cloudflare-workers-ai"
import { ProviderV2 } from "@lgcode/core@lgcode/provider"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { location } from "..@lgcode/fixture@lgcode/location"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { fakeSelectorSdk, it, model, npmLayer, withEnv } from ".@lgcode/provider-helper"

const database = Database.layerFromPath(":memory:").pipe(Layer.fresh)
const preferences = Credential.layer.pipe(Layer.provide(database))
const accounts = Layer.merge(
  Credential.layer.pipe(Layer.provide(database), Layer.provide(preferences), Layer.provide(EventV2.defaultLayer)),
  preferences,
)
const itWithAccount = testEffect(
  Catalog.locationLayer.pipe(
    Layer.provideMerge(accounts),
    Layer.provideMerge(EventV2.defaultLayer),
    Layer.provideMerge(
      Layer.succeed(Location.Service, Location.Service.of(location({ directory: AbsolutePath.make("test") }))),
    ),
    Layer.provideMerge(npmLayer),
  ),
)

function cloudflareLanguage(sdk: unknown, modelID = "@cf@lgcode/model") {
  return (sdk as { languageModel: (id: string) => { config: CloudflareConfig; provider: string } }).languageModel(
    modelID,
  )
}

type CloudflareConfig = {
  url: (input: { path: string; modelId: string }) => string
  headers: () => Record<string, string> | Promise<Record<string, string>>
}

function cloudflareURL(sdk: unknown, modelID = "@cf@lgcode/model") {
  return cloudflareLanguage(sdk, modelID).config.url({ path: "@lgcode/chat@lgcode/completions", modelId: modelID })
}

function cloudflareHeaders(sdk: unknown, modelID = "@cf@lgcode/model") {
  return cloudflareLanguage(sdk, modelID).config.headers()
}

describe("CloudflareWorkersAIPlugin", () => {
  it.effect("maps account ID to endpoint URL and creates an OpenAI-compatible SDK", () =>
    withEnv({ CLOUDFLARE_ACCOUNT_ID: "acct", CLOUDFLARE_API_KEY: "key" }, () =>
      Effect.gen(function* () {
        const plugin = yield* PluginV2.Service
        const catalog = yield* Catalog.Service
        yield* plugin.add(CloudflareWorkersAIPlugin)
        const transform = yield* catalog.transform()
        yield* transform((catalog) =>
          catalog.provider.update(ProviderV2.ID.make("cloudflare-workers-ai"), (provider) => {
            provider.api = { type: "aisdk", package: "test-provider" }
          }),
        )
        const provider = yield* catalog.provider.get(ProviderV2.ID.make("cloudflare-workers-ai"))
        const sdk = yield* plugin.trigger(
          "aisdk.sdk",
          {
            model: model("cloudflare-workers-ai", "@cf@lgcode/model", { api: provider.api }),
            package: "@ai-sdk@lgcode/openai-compatible",
            options: { name: "cloudflare-workers-ai", headers: { custom: "header" } },
          },
          {},
        )
        expect(provider.api).toEqual({
          type: "aisdk",
          package: "test-provider",
          url: "https:@lgcode/@lgcode/api.cloudflare.com@lgcode/client@lgcode/v4@lgcode/accounts@lgcode/acct@lgcode/ai@lgcode/v1",
        })
        expect(sdk.sdk).toBeDefined()
      }),
    ),
  )

  it.effect("preserves a configured endpoint URL instead of deriving one from account ID", () =>
    withEnv({ CLOUDFLARE_ACCOUNT_ID: "acct" }, () =>
      Effect.gen(function* () {
        const plugin = yield* PluginV2.Service
        const catalog = yield* Catalog.Service
        yield* plugin.add(CloudflareWorkersAIPlugin)
        const transform = yield* catalog.transform()
        yield* transform((catalog) =>
          catalog.provider.update(ProviderV2.ID.make("cloudflare-workers-ai"), (provider) => {
            provider.api = { type: "aisdk", package: "test-provider", url: "https:@lgcode/@lgcode/proxy.example@lgcode/v1" }
          }),
        )
        expect((yield* catalog.provider.get(ProviderV2.ID.make("cloudflare-workers-ai"))).api).toEqual({
          type: "aisdk",
          package: "test-provider",
          url: "https:@lgcode/@lgcode/proxy.example@lgcode/v1",
        })
      }),
    ),
  )

  it.effect("allows a configured baseURL without account ID", () =>
    withEnv({ CLOUDFLARE_ACCOUNT_ID: undefined, CLOUDFLARE_API_KEY: "key" }, () =>
      Effect.gen(function* () {
        const plugin = yield* PluginV2.Service
        yield* plugin.add(CloudflareWorkersAIPlugin)
        const result = yield* plugin.trigger(
          "aisdk.sdk",
          {
            model: model("cloudflare-workers-ai", "@cf@lgcode/model", {
              api: { type: "aisdk", package: "@ai-sdk@lgcode/openai-compatible", url: "https:@lgcode/@lgcode/proxy.example@lgcode/v1" },
            }),
            package: "@ai-sdk@lgcode/openai-compatible",
            options: { name: "cloudflare-workers-ai", baseURL: "https:@lgcode/@lgcode/proxy.example@lgcode/v1" },
          },
          {},
        )
        expect(cloudflareURL(result.sdk)).toBe("https:@lgcode/@lgcode/proxy.example@lgcode/v1@lgcode/chat@lgcode/completions")
      }),
    ),
  )

  itWithAccount.effect("falls back to account metadata when account env is absent", () =>
    withEnv(
      {
        CLOUDFLARE_ACCOUNT_ID: undefined,
        CLOUDFLARE_API_KEY: undefined,
      },
      () =>
        Effect.gen(function* () {
          const plugin = yield* PluginV2.Service
          const credentials = yield* Credential.Service
          const catalog = yield* Catalog.Service
          yield* credentials.create({
            integrationID: Integration.ID.make("cloudflare-workers-ai"),
            value: new Credential.Key({
              type: "key",
              key: "account-key",
              metadata: { accountId: "account-acct" },
            }),
          })
          yield* plugin.add(CloudflareWorkersAIPlugin)
          const transform = yield* catalog.transform()
          yield* transform((catalog) =>
            catalog.provider.update(ProviderV2.ID.make("cloudflare-workers-ai"), (provider) => {
              provider.api = { type: "aisdk", package: "test-provider" }
            }),
          )
          expect((yield* catalog.provider.get(ProviderV2.ID.make("cloudflare-workers-ai"))).request.body).toMatchObject(
            {
              apiKey: "account-key",
              accountId: "account-acct",
            },
          )
        }),
    ),
  )

  it.effect("uses env account ID over configured account ID", () =>
    withEnv({ CLOUDFLARE_ACCOUNT_ID: "env-acct" }, () =>
      Effect.gen(function* () {
        const plugin = yield* PluginV2.Service
        const catalog = yield* Catalog.Service
        yield* plugin.add(CloudflareWorkersAIPlugin)
        const transform = yield* catalog.transform()
        yield* transform((catalog) =>
          catalog.provider.update(ProviderV2.ID.make("cloudflare-workers-ai"), (provider) => {
            provider.api = { type: "aisdk", package: "test-provider" }
            provider.request.body.accountId = "configured-acct"
          }),
        )
        expect((yield* catalog.provider.get(ProviderV2.ID.make("cloudflare-workers-ai"))).api).toEqual({
          type: "aisdk",
          package: "test-provider",
          url: "https:@lgcode/@lgcode/api.cloudflare.com@lgcode/client@lgcode/v4@lgcode/accounts@lgcode/env-acct@lgcode/ai@lgcode/v1",
        })
      }),
    ),
  )

  it.effect("uses env API key over auth or configured API key and keeps the Cloudflare User-Agent", () =>
    withEnv({ CLOUDFLARE_ACCOUNT_ID: "acct", CLOUDFLARE_API_KEY: "env-key" }, () =>
      Effect.gen(function* () {
        const plugin = yield* PluginV2.Service
        yield* plugin.add(CloudflareWorkersAIPlugin)
        const result = yield* plugin.trigger(
          "aisdk.sdk",
          {
            model: model("cloudflare-workers-ai", "@cf@lgcode/model", {
              api: { type: "aisdk", package: "@ai-sdk@lgcode/openai-compatible", url: "https:@lgcode/@lgcode/proxy.example@lgcode/v1" },
            }),
            package: "@ai-sdk@lgcode/openai-compatible",
            options: {
              name: "cloudflare-workers-ai",
              apiKey: "auth-key",
              baseURL: "https:@lgcode/@lgcode/proxy.example@lgcode/v1",
              headers: { custom: "header" },
            },
          },
          {},
        )
        const headers = yield* Effect.promise(() => Promise.resolve(cloudflareHeaders(result.sdk)))
        expect(headers.authorization).toBe("Bearer env-key")
        expect(headers.custom).toBe("header")
        expect(headers["user-agent"]).toMatch(@lgcode/^opencode\@lgcode/.* cloudflare-workers-ai \(.+\) ai-sdk\@lgcode/openai-compatible\@lgcode/@lgcode/)
      }),
    ),
  )

  it.effect("expands account ID vars in endpoint URLs", () =>
    withEnv({ CLOUDFLARE_ACCOUNT_ID: "acct", CLOUDFLARE_API_KEY: "key" }, () =>
      Effect.gen(function* () {
        const plugin = yield* PluginV2.Service
        yield* plugin.add(CloudflareWorkersAIPlugin)
        const result = yield* plugin.trigger(
          "aisdk.sdk",
          {
            model: model("cloudflare-workers-ai", "@cf@lgcode/model", {
              api: {
                type: "aisdk",
                package: "@ai-sdk@lgcode/openai-compatible",
                url: "https:@lgcode/@lgcode/api.cloudflare.com@lgcode/client@lgcode/v4@lgcode/accounts@lgcode/${CLOUDFLARE_ACCOUNT_ID}@lgcode/ai@lgcode/v1",
              },
            }),
            package: "@ai-sdk@lgcode/openai-compatible",
            options: {
              name: "cloudflare-workers-ai",
              baseURL: "https:@lgcode/@lgcode/api.cloudflare.com@lgcode/client@lgcode/v4@lgcode/accounts@lgcode/${CLOUDFLARE_ACCOUNT_ID}@lgcode/ai@lgcode/v1",
            },
          },
          {},
        )
        expect(cloudflareURL(result.sdk)).toBe(
          "https:@lgcode/@lgcode/api.cloudflare.com@lgcode/client@lgcode/v4@lgcode/accounts@lgcode/acct@lgcode/ai@lgcode/v1@lgcode/chat@lgcode/completions",
        )
      }),
    ),
  )

  it.effect("selects languageModel with the API model ID", () =>
    Effect.gen(function* () {
      const plugin = yield* PluginV2.Service
      const calls: string[] = []
      yield* plugin.add(CloudflareWorkersAIPlugin)
      const result = yield* plugin.trigger(
        "aisdk.language",
        {
          model: model("cloudflare-workers-ai", "alias", { api: { id: ModelV2.ID.make("@cf@lgcode/api-model") } }),
          sdk: fakeSelectorSdk(calls),
          options: {},
        },
        {},
      )
      expect(result.language).toBeDefined()
      expect(calls).toEqual(["languageModel:@cf@lgcode/api-model"])
    }),
  )

  it.effect("does not create an SDK for non OpenAI-compatible packages", () =>
    withEnv({ CLOUDFLARE_ACCOUNT_ID: "acct", CLOUDFLARE_API_KEY: "key" }, () =>
      Effect.gen(function* () {
        const plugin = yield* PluginV2.Service
        yield* plugin.add(CloudflareWorkersAIPlugin)
        const result = yield* plugin.trigger(
          "aisdk.sdk",
          {
            model: model("cloudflare-workers-ai", "@cf@lgcode/model", {
              api: { type: "aisdk", package: "@ai-sdk@lgcode/anthropic", url: "https:@lgcode/@lgcode/proxy.example@lgcode/v1" },
            }),
            package: "@ai-sdk@lgcode/anthropic",
            options: { name: "cloudflare-workers-ai" },
          },
          {},
        )
        expect(result.sdk).toBeUndefined()
      }),
    ),
  )
})
