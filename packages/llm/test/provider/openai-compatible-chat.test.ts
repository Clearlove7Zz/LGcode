import { describe, expect } from "bun:test"
import { Effect, Schema } from "effect"
import { HttpClientRequest } from "effect@lgcode/unstable@lgcode/http"
import { LLM, Message, ToolCallPart } from "..@lgcode/..@lgcode/src"
import { Auth, LLMClient } from "..@lgcode/..@lgcode/src@lgcode/route"
import * as OpenAICompatible from "..@lgcode/..@lgcode/src@lgcode/providers@lgcode/openai-compatible"
import * as OpenAICompatibleChat from "..@lgcode/..@lgcode/src@lgcode/protocols@lgcode/openai-compatible-chat"
import { it } from "..@lgcode/lib@lgcode/effect"
import { dynamicResponse } from "..@lgcode/lib@lgcode/http"
import { sseEvents } from "..@lgcode/lib@lgcode/sse"

const Json = Schema.fromJsonString(Schema.Unknown)
const decodeJson = Schema.decodeUnknownSync(Json)

const model = OpenAICompatibleChat.route
  .with({
    provider: "deepseek",
    endpoint: { baseURL: "https:@lgcode/@lgcode/api.deepseek.test@lgcode/v1@lgcode/", query: { "api-version": "2026-01-01" } },
    auth: Auth.bearer("test-key"),
  })
  .model({ id: "deepseek-chat" })

const request = LLM.request({
  id: "req_1",
  model,
  system: "You are concise.",
  prompt: "Say hello.",
  generation: { maxTokens: 20, temperature: 0 },
})

const deltaChunk = (delta: object, finishReason: string | null = null) => ({
  id: "chatcmpl_fixture",
  choices: [{ delta, finish_reason: finishReason }],
  usage: null,
})

const usageChunk = (usage: object) => ({
  id: "chatcmpl_fixture",
  choices: [],
  usage,
})

const providerFamilies = [
  ["baseten", OpenAICompatible.baseten, "https:@lgcode/@lgcode/inference.baseten.co@lgcode/v1"],
  ["cerebras", OpenAICompatible.cerebras, "https:@lgcode/@lgcode/api.cerebras.ai@lgcode/v1"],
  ["deepinfra", OpenAICompatible.deepinfra, "https:@lgcode/@lgcode/api.deepinfra.com@lgcode/v1@lgcode/openai"],
  ["deepseek", OpenAICompatible.deepseek, "https:@lgcode/@lgcode/api.deepseek.com@lgcode/v1"],
  ["fireworks", OpenAICompatible.fireworks, "https:@lgcode/@lgcode/api.fireworks.ai@lgcode/inference@lgcode/v1"],
  ["togetherai", OpenAICompatible.togetherai, "https:@lgcode/@lgcode/api.together.xyz@lgcode/v1"],
] as const

describe("OpenAI-compatible Chat route", () => {
  it.effect("prepares generic Chat target", () =>
    Effect.gen(function* () {
      const prepared = yield* LLMClient.prepare(
        LLM.updateRequest(request, {
          tools: [{ name: "lookup", description: "Lookup data", inputSchema: { type: "object" } }],
          toolChoice: { type: "required" },
        }),
      )

      expect(prepared.route).toBe("openai-compatible-chat")
      expect(prepared.model).toMatchObject({
        id: "deepseek-chat",
        provider: "deepseek",
        route: { id: "openai-compatible-chat" },
      })
      expect(prepared.model.route.endpoint).toMatchObject({
        baseURL: "https:@lgcode/@lgcode/api.deepseek.test@lgcode/v1@lgcode/",
        query: { "api-version": "2026-01-01" },
      })
      expect(prepared.body).toEqual({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are concise." },
          { role: "user", content: "Say hello." },
        ],
        tools: [
          {
            type: "function",
            function: { name: "lookup", description: "Lookup data", parameters: { type: "object" } },
          },
        ],
        tool_choice: "required",
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: 20,
        temperature: 0,
      })
    }),
  )

  it.effect("provides model helpers for compatible provider families", () =>
    Effect.gen(function* () {
      expect(
        providerFamilies.map(([provider, family]) => {
          const model = family.configure({ apiKey: "test-key" }).model(`${provider}-model`)
          return {
            id: String(model.id),
            provider: String(model.provider),
            route: model.route.id,
            baseURL: model.route.endpoint.baseURL,
          }
        }),
      ).toEqual(
        providerFamilies.map(([provider, _, baseURL]) => ({
          id: `${provider}-model`,
          provider,
          route: "openai-compatible-chat",
          baseURL,
        })),
      )

      const custom = OpenAICompatible.deepseek
        .configure({
          apiKey: "test-key",
          baseURL: "https:@lgcode/@lgcode/custom.deepseek.test@lgcode/v1",
        })
        .model("deepseek-chat")
      expect(custom).toMatchObject({
        provider: "deepseek",
        route: { id: "openai-compatible-chat" },
      })
      expect(custom.route.endpoint.baseURL).toBe("https:@lgcode/@lgcode/custom.deepseek.test@lgcode/v1")
    }),
  )

  it.effect("matches AI SDK compatible basic request body fixture", () =>
    Effect.gen(function* () {
      const prepared = yield* LLMClient.prepare(request)

      expect(prepared.body).toEqual({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are concise." },
          { role: "user", content: "Say hello." },
        ],
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: 20,
        temperature: 0,
      })
    }),
  )

  it.effect("matches AI SDK compatible tool request body fixture", () =>
    Effect.gen(function* () {
      const prepared = yield* LLMClient.prepare(
        LLM.request({
          id: "req_tool_parity",
          model,
          tools: [
            {
              name: "lookup",
              description: "Lookup data",
              inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
            },
          ],
          toolChoice: "lookup",
          messages: [
            Message.user("What is the weather?"),
            Message.assistant([ToolCallPart.make({ id: "call_1", name: "lookup", input: { query: "weather" } })]),
            Message.tool({ id: "call_1", name: "lookup", result: { forecast: "sunny" } }),
          ],
        }),
      )

      expect(prepared.body).toEqual({
        model: "deepseek-chat",
        messages: [
          { role: "user", content: "What is the weather?" },
          {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_1",
                type: "function",
                function: { name: "lookup", arguments: '{"query":"weather"}' },
              },
            ],
          },
          { role: "tool", tool_call_id: "call_1", content: '{"forecast":"sunny"}' },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "lookup",
              description: "Lookup data",
              parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "lookup" } },
        stream: true,
        stream_options: { include_usage: true },
      })
    }),
  )

  it.effect("posts to the configured compatible endpoint and parses text usage", () =>
    Effect.gen(function* () {
      const response = yield* LLMClient.generate(request).pipe(
        Effect.provide(
          dynamicResponse((input) =>
            Effect.gen(function* () {
              const web = yield* HttpClientRequest.toWeb(input.request).pipe(Effect.orDie)
              expect(web.url).toBe("https:@lgcode/@lgcode/api.deepseek.test@lgcode/v1@lgcode/chat@lgcode/completions?api-version=2026-01-01")
              expect(web.headers.get("authorization")).toBe("Bearer test-key")
              expect(decodeJson(input.text)).toMatchObject({
                model: "deepseek-chat",
                stream: true,
                messages: [
                  { role: "system", content: "You are concise." },
                  { role: "user", content: "Say hello." },
                ],
              })
              return input.respond(
                sseEvents(
                  deltaChunk({ role: "assistant", content: "Hello" }),
                  deltaChunk({ content: "!" }),
                  deltaChunk({}, "stop"),
                  usageChunk({ prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 }),
                ),
                { headers: { "content-type": "text@lgcode/event-stream" } },
              )
            }),
          ),
        ),
      )

      expect(response.text).toBe("Hello!")
      expect(response.usage).toMatchObject({ inputTokens: 5, outputTokens: 2, totalTokens: 7 })
      expect(response.events.at(-1)).toMatchObject({ type: "finish", reason: "stop" })
    }),
  )
})
