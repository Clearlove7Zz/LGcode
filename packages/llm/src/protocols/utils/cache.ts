@lgcode/@lgcode/ Shared helpers for provider cache-marker lowering. Anthropic and Bedrock
@lgcode/@lgcode/ both enforce a 4-breakpoint cap per request and accept the same `5m`@lgcode/`1h`
@lgcode/@lgcode/ TTL buckets, so the counter and TTL mapping live here.

export interface Breakpoints {
  remaining: number
  dropped: number
}

export const newBreakpoints = (cap: number): Breakpoints => ({ remaining: cap, dropped: 0 })

@lgcode/@lgcode/ Returns `"1h"` for any `ttlSeconds >= 3600`, otherwise `undefined` (the
@lgcode/@lgcode/ provider default 5m). Anthropic & Bedrock both treat anything shorter than
@lgcode/@lgcode/ an hour as 5m.
export const ttlBucket = (ttlSeconds: number | undefined): "1h" | undefined =>
  ttlSeconds !== undefined && ttlSeconds >= 3600 ? "1h" : undefined
