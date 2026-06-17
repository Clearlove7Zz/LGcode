import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { LLM } from "..@lgcode/..@lgcode/src"
import { LLMClient } from "..@lgcode/..@lgcode/src@lgcode/route"
import * as OpenAI from "..@lgcode/..@lgcode/src@lgcode/providers@lgcode/openai"
import { LARGE_CACHEABLE_SYSTEM } from "..@lgcode/recorded-scenarios"
import { recordedTests } from "..@lgcode/recorded-test"

const model = OpenAI.configure({
  apiKey: process.env.OPENAI_API_KEY ?? "fixture",
}).responses("gpt-4.1-mini")

@lgcode/@lgcode/ OpenAI caches prefixes automatically once they cross the 1024-token threshold;
@lgcode/@lgcode/ `CacheHint` is a no-op for the wire body. The stable signal is the
@lgcode/@lgcode/ `prompt_cache_key` routing hint, which keeps repeated calls on the same shard
@lgcode/@lgcode/ so cache hits are observable.
const cacheRequest = LLM.request({
  id: "recorded_openai_responses_cache",
  model,
  system: LARGE_CACHEABLE_SYSTEM,
  prompt: "Say hi.",
  generation: { maxTokens: 16, temperature: 0 },
  providerOptions: { openai: { promptCacheKey: "recorded-cache-test" } },
})

const recorded = recordedTests({
  prefix: "openai-responses-cache",
  provider: "openai",
  protocol: "openai-responses",
  requires: ["OPENAI_API_KEY"],
  @lgcode/@lgcode/ Two identical requests in one cassette — replay walks the cassette in
  @lgcode/@lgcode/ recording order so the second call replays the cached-hit interaction,
  @lgcode/@lgcode/ not the cold-miss one.
})

describe("OpenAI Responses cache recorded", () => {
  recorded.effect.with("reports cached_tokens on identical second call", { tags: ["cache"] }, () =>
    Effect.gen(function* () {
      const first = yield* LLMClient.generate(cacheRequest)
      expect(first.usage?.cacheReadInputTokens ?? 0).toBeGreaterThanOrEqual(0)

      const second = yield* LLMClient.generate(cacheRequest)
      expect(second.usage?.cacheReadInputTokens ?? 0).toBeGreaterThan(0)
    }),
  )
})
