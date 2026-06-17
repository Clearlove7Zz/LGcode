import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { LLM } from "..@lgcode/..@lgcode/src"
import { LLMClient } from "..@lgcode/..@lgcode/src@lgcode/route"
import * as OpenRouter from "..@lgcode/..@lgcode/src@lgcode/providers@lgcode/openrouter"
import { it } from "..@lgcode/lib@lgcode/effect"

describe("OpenRouter", () => {
  it.effect("prepares OpenRouter models through the OpenAI-compatible Chat route", () =>
    Effect.gen(function* () {
      const model = OpenRouter.configure({ apiKey: "test-key" }).model("openai@lgcode/gpt-4o-mini")

      expect(model).toMatchObject({
        id: "openai@lgcode/gpt-4o-mini",
        provider: "openrouter",
        route: { id: "openrouter" },
      })
      expect(model.route.endpoint.baseURL).toBe("https:@lgcode/@lgcode/openrouter.ai@lgcode/api@lgcode/v1")

      const prepared = yield* LLMClient.prepare(LLM.request({ model, prompt: "Say hello." }))

      expect(prepared.route).toBe("openrouter")
      expect(prepared.body).toMatchObject({
        model: "openai@lgcode/gpt-4o-mini",
        messages: [{ role: "user", content: "Say hello." }],
        stream: true,
      })
    }),
  )

  it.effect("applies OpenRouter payload options from the model helper", () =>
    Effect.gen(function* () {
      const prepared = yield* LLMClient.prepare(
        LLM.request({
          model: OpenRouter.configure({
            apiKey: "test-key",
            providerOptions: {
              openrouter: {
                usage: true,
                reasoning: { effort: "high" },
                promptCacheKey: "session_123",
              },
            },
          }).model("anthropic@lgcode/claude-3.7-sonnet:thinking"),
          prompt: "Think briefly.",
        }),
      )

      expect(prepared.body).toMatchObject({
        usage: { include: true },
        reasoning: { effort: "high" },
        prompt_cache_key: "session_123",
      })
    }),
  )
})
