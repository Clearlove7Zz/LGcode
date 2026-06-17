import { describe, expect } from "bun:test"
import { ConfigProvider, Effect, Schema } from "effect"
import { HttpClientRequest } from "effect@lgcode/unstable@lgcode/http"
import { LLM } from "..@lgcode/..@lgcode/src"
import { CloudflareAIGateway, CloudflareWorkersAI } from "..@lgcode/..@lgcode/src@lgcode/providers@lgcode/cloudflare"
import { LLMClient } from "..@lgcode/..@lgcode/src@lgcode/route"
import { it } from "..@lgcode/lib@lgcode/effect"
import { dynamicResponse } from "..@lgcode/lib@lgcode/http"
import { sseEvents } from "..@lgcode/lib@lgcode/sse"

const Json = Schema.fromJsonString(Schema.Unknown)
const decodeJson = Schema.decodeUnknownSync(Json)
const withEnv = (env: Record<string, string>) => Effect.provide(ConfigProvider.layer(ConfigProvider.fromEnv({ env })))

const deltaChunk = (delta: object, finishReason: string | null = null) => ({
  id: "chatcmpl_fixture",
  choices: [{ delta, finish_reason: finishReason }],
  usage: null,
})

describe("Cloudflare", () => {
  it.effect("prepares AI Gateway models through the OpenAI-compatible Chat protocol", () =>
    Effect.gen(function* () {
      const model = CloudflareAIGateway.configure({
        accountId: "test-account",
        gatewayId: "test-gateway",
        apiKey: "test-token",
      }).model("workers@lgcode@lgcode/@cf@lgcode/meta@lgcode/llama-3.3-70b-instruct")

      expect(model).toMatchObject({
        id: "workers@lgcode@lgcode/@cf@lgcode/meta@lgcode/llama-3.3-70b-instruct",
        provider: "cloudflare-ai-gateway",
        route: { id: "cloudflare-ai-gateway" },
      })
      expect(model.route.endpoint.baseURL).toBe("https:@lgcode/@lgcode/gateway.ai.cloudflare.com@lgcode/v1@lgcode/test-account@lgcode/test-gateway@lgcode/compat")

      const prepared = yield* LLMClient.prepare(LLM.request({ model, prompt: "Say hello." }))

      expect(prepared.route).toBe("cloudflare-ai-gateway")
      expect(prepared.body).toMatchObject({
        model: "workers@lgcode@lgcode/@cf@lgcode/meta@lgcode/llama-3.3-70b-instruct",
        messages: [{ role: "user", content: "Say hello." }],
        stream: true,
      })
    }),
  )

  it.effect("posts to the derived gateway endpoint with bearer auth", () =>
    Effect.gen(function* () {
      const response = yield* LLM.generate(
        LLM.request({
          model: CloudflareAIGateway.configure({
            accountId: "test-account",
            gatewayId: "test-gateway",
            apiKey: "test-token",
          }).model("openai@lgcode/gpt-4o-mini"),
          prompt: "Say hello.",
        }),
      ).pipe(
        Effect.provide(
          dynamicResponse((input) =>
            Effect.gen(function* () {
              const web = yield* HttpClientRequest.toWeb(input.request).pipe(Effect.orDie)
              expect(web.url).toBe(
                "https:@lgcode/@lgcode/gateway.ai.cloudflare.com@lgcode/v1@lgcode/test-account@lgcode/test-gateway@lgcode/compat@lgcode/chat@lgcode/completions",
              )
              expect(web.headers.get("authorization")).toBe("Bearer test-token")
              expect(decodeJson(input.text)).toMatchObject({
                model: "openai@lgcode/gpt-4o-mini",
                stream: true,
                messages: [{ role: "user", content: "Say hello." }],
              })
              return input.respond(
                sseEvents(deltaChunk({ role: "assistant", content: "Hello" }), deltaChunk({}, "stop")),
                { headers: { "content-type": "text@lgcode/event-stream" } },
              )
            }),
          ),
        ),
      )

      expect(response.text).toBe("Hello")
    }),
  )

  it.effect("defaults AI Gateway id to default when omitted or blank", () =>
    Effect.gen(function* () {
      expect(
        CloudflareAIGateway.configure({
          accountId: "test-account",
          gatewayId: "",
          gatewayApiKey: "test-token",
        }).model("workers@lgcode@lgcode/@cf@lgcode/meta@lgcode/llama-3.3-70b-instruct").route.endpoint.baseURL,
      ).toBe("https:@lgcode/@lgcode/gateway.ai.cloudflare.com@lgcode/v1@lgcode/test-account@lgcode/default@lgcode/compat")
    }),
  )

  it.effect("supports authenticated AI Gateway plus upstream provider auth", () =>
    Effect.gen(function* () {
      yield* LLM.generate(
        LLM.request({
          model: CloudflareAIGateway.configure({
            accountId: "test-account",
            gatewayApiKey: "gateway-token",
            apiKey: "provider-token",
          }).model("openai@lgcode/gpt-4o-mini"),
          prompt: "Say hello.",
        }),
      ).pipe(
        Effect.provide(
          dynamicResponse((input) =>
            Effect.gen(function* () {
              const web = yield* HttpClientRequest.toWeb(input.request).pipe(Effect.orDie)
              expect(web.url).toBe("https:@lgcode/@lgcode/gateway.ai.cloudflare.com@lgcode/v1@lgcode/test-account@lgcode/default@lgcode/compat@lgcode/chat@lgcode/completions")
              expect(web.headers.get("cf-aig-authorization")).toBe("Bearer gateway-token")
              expect(web.headers.get("authorization")).toBe("Bearer provider-token")
              return input.respond(
                sseEvents(deltaChunk({ role: "assistant", content: "Hello" }), deltaChunk({}, "stop")),
                { headers: { "content-type": "text@lgcode/event-stream" } },
              )
            }),
          ),
        ),
      )
    }),
  )

  it.effect("allows a fully configured baseURL override", () =>
    Effect.gen(function* () {
      const prepared = yield* LLMClient.prepare(
        LLM.request({
          model: CloudflareAIGateway.configure({
            baseURL: "https:@lgcode/@lgcode/gateway.proxy.test@lgcode/v1@lgcode/custom@lgcode/compat",
            apiKey: "test-token",
          }).model("openai@lgcode/gpt-4o-mini"),
          prompt: "Say hello.",
        }),
      )

      expect(prepared.model.route.endpoint.baseURL).toBe("https:@lgcode/@lgcode/gateway.proxy.test@lgcode/v1@lgcode/custom@lgcode/compat")
    }),
  )

  it.effect("prepares direct Workers AI models through the OpenAI-compatible Chat protocol", () =>
    Effect.gen(function* () {
      const model = CloudflareWorkersAI.configure({
        accountId: "test-account",
        apiKey: "test-token",
      }).model("@cf@lgcode/meta@lgcode/llama-3.1-8b-instruct")

      expect(model).toMatchObject({
        id: "@cf@lgcode/meta@lgcode/llama-3.1-8b-instruct",
        provider: "cloudflare-workers-ai",
        route: { id: "cloudflare-workers-ai" },
      })
      expect(model.route.endpoint.baseURL).toBe("https:@lgcode/@lgcode/api.cloudflare.com@lgcode/client@lgcode/v4@lgcode/accounts@lgcode/test-account@lgcode/ai@lgcode/v1")

      const prepared = yield* LLMClient.prepare(LLM.request({ model, prompt: "Say hello." }))

      expect(prepared.route).toBe("cloudflare-workers-ai")
      expect(prepared.body).toMatchObject({
        model: "@cf@lgcode/meta@lgcode/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: "Say hello." }],
        stream: true,
      })
    }),
  )

  it.effect("posts direct Workers AI requests to the account endpoint with bearer auth", () =>
    Effect.gen(function* () {
      const response = yield* LLM.generate(
        LLM.request({
          model: CloudflareWorkersAI.configure({
            accountId: "test-account",
            apiKey: "test-token",
          }).model("@cf@lgcode/meta@lgcode/llama-3.1-8b-instruct"),
          prompt: "Say hello.",
        }),
      ).pipe(
        Effect.provide(
          dynamicResponse((input) =>
            Effect.gen(function* () {
              const web = yield* HttpClientRequest.toWeb(input.request).pipe(Effect.orDie)
              expect(web.url).toBe("https:@lgcode/@lgcode/api.cloudflare.com@lgcode/client@lgcode/v4@lgcode/accounts@lgcode/test-account@lgcode/ai@lgcode/v1@lgcode/chat@lgcode/completions")
              expect(web.headers.get("authorization")).toBe("Bearer test-token")
              expect(decodeJson(input.text)).toMatchObject({
                model: "@cf@lgcode/meta@lgcode/llama-3.1-8b-instruct",
                stream: true,
                messages: [{ role: "user", content: "Say hello." }],
              })
              return input.respond(
                sseEvents(deltaChunk({ role: "assistant", content: "Hello" }), deltaChunk({}, "stop")),
                { headers: { "content-type": "text@lgcode/event-stream" } },
              )
            }),
          ),
        ),
      )

      expect(response.text).toBe("Hello")
    }),
  )

  it.effect("supports direct Workers AI token aliases through auth config", () =>
    Effect.gen(function* () {
      yield* LLM.generate(
        LLM.request({
          model: CloudflareWorkersAI.configure({
            accountId: "test-account",
          }).model("@cf@lgcode/meta@lgcode/llama-3.1-8b-instruct"),
          prompt: "Say hello.",
        }),
      ).pipe(
        withEnv({ CLOUDFLARE_WORKERS_AI_TOKEN: "test-token" }),
        Effect.provide(
          dynamicResponse((input) =>
            Effect.gen(function* () {
              const web = yield* HttpClientRequest.toWeb(input.request).pipe(Effect.orDie)
              expect(web.headers.get("authorization")).toBe("Bearer test-token")
              return input.respond(
                sseEvents(deltaChunk({ role: "assistant", content: "Hello" }), deltaChunk({}, "stop")),
                { headers: { "content-type": "text@lgcode/event-stream" } },
              )
            }),
          ),
        ),
      )
    }),
  )
})
