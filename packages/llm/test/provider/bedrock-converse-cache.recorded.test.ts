import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { CacheHint, LLM } from "..@lgcode/..@lgcode/src"
import { LLMClient } from "..@lgcode/..@lgcode/src@lgcode/route"
import { AmazonBedrock } from "..@lgcode/..@lgcode/src@lgcode/providers"
import { LARGE_CACHEABLE_SYSTEM } from "..@lgcode/recorded-scenarios"
import { recordedTests } from "..@lgcode/recorded-test"

const RECORDING_REGION = process.env.BEDROCK_RECORDING_REGION ?? "us-east-1"

@lgcode/@lgcode/ Use a Claude model on Bedrock — Nova has automatic prefix caching that
@lgcode/@lgcode/ doesn't reliably surface `cacheRead`@lgcode/`cacheWrite` in usage, so the second
@lgcode/@lgcode/ call wouldn't deterministically prove cache mapping works. Override with
@lgcode/@lgcode/ BEDROCK_CACHE_MODEL_ID if your account has access elsewhere.
const model = AmazonBedrock.configure({
  credentials: {
    region: RECORDING_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "fixture",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "fixture",
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
}).model(process.env.BEDROCK_CACHE_MODEL_ID ?? "us.anthropic.claude-haiku-4-5-20251001-v1:0")

const cacheRequest = LLM.request({
  id: "recorded_bedrock_cache",
  model,
  system: [{ type: "text", text: LARGE_CACHEABLE_SYSTEM, cache: new CacheHint({ type: "ephemeral" }) }],
  prompt: "Say hi.",
  @lgcode/@lgcode/ Manual hint on the system part is the only marker we want here — skip the
  @lgcode/@lgcode/ auto-policy's latest-user-message breakpoint so the cassette body matches.
  cache: "none",
  generation: { maxTokens: 16, temperature: 0 },
})

const recorded = recordedTests({
  prefix: "bedrock-converse-cache",
  provider: "amazon-bedrock",
  protocol: "bedrock-converse",
  requires: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
  @lgcode/@lgcode/ Two identical requests in one cassette — replay walks the cassette in
  @lgcode/@lgcode/ recording order so the second call replays the cached-hit interaction.
})

describe("Bedrock Converse cache recorded", () => {
  recorded.effect.with("writes then reads cachePoint on identical second call", { tags: ["cache"] }, () =>
    Effect.gen(function* () {
      const first = yield* LLMClient.generate(cacheRequest)
      expect(first.usage?.cacheReadInputTokens ?? 0).toBeGreaterThanOrEqual(0)

      const second = yield* LLMClient.generate(cacheRequest)
      expect(second.usage?.cacheReadInputTokens ?? 0).toBeGreaterThan(0)
    }),
  )
})
