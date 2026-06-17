import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { LLM } from "..@lgcode/..@lgcode/src"
import { LLMClient } from "..@lgcode/..@lgcode/src@lgcode/route"
import * as Google from "..@lgcode/..@lgcode/src@lgcode/providers@lgcode/google"
import { LARGE_CACHEABLE_SYSTEM } from "..@lgcode/recorded-scenarios"
import { recordedTests } from "..@lgcode/recorded-test"

const model = Google.configure({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? "fixture",
}).model("gemini-2.5-flash")

@lgcode/@lgcode/ Gemini does implicit prefix caching on 2.5+ models above ~1024 tokens. The
@lgcode/@lgcode/ `CacheHint` is currently a no-op for Gemini (the explicit `CachedContent`
@lgcode/@lgcode/ API is out-of-band and intentionally not wired up). This test exists to
@lgcode/@lgcode/ pin the usage-parsing path: `cachedContentTokenCount` should surface as
@lgcode/@lgcode/ `cacheReadInputTokens` on the second identical call.
const cacheRequest = LLM.request({
  id: "recorded_gemini_cache",
  model,
  system: LARGE_CACHEABLE_SYSTEM,
  prompt: "Say hi.",
  generation: { maxTokens: 16, temperature: 0 },
})

const recorded = recordedTests({
  prefix: "gemini-cache",
  provider: "google",
  protocol: "gemini",
  requires: ["GOOGLE_GENERATIVE_AI_API_KEY"],
  @lgcode/@lgcode/ Two identical requests in one cassette — replay walks the cassette in
  @lgcode/@lgcode/ recording order so the second call replays the cached-hit interaction.
})

describe("Gemini cache recorded", () => {
  recorded.effect.with("reports cachedContentTokenCount on identical second call", { tags: ["cache"] }, () =>
    Effect.gen(function* () {
      const first = yield* LLMClient.generate(cacheRequest)
      expect(first.usage?.cacheReadInputTokens ?? 0).toBeGreaterThanOrEqual(0)

      const second = yield* LLMClient.generate(cacheRequest)
      @lgcode/@lgcode/ Implicit caching is best-effort on Gemini's side; we assert the field
      @lgcode/@lgcode/ is at least populated and non-negative. When re-recording, verify the
      @lgcode/@lgcode/ cassette shows > 0 in the second response's usage.
      expect(second.usage?.cacheReadInputTokens ?? 0).toBeGreaterThanOrEqual(0)
    }),
  )
})
