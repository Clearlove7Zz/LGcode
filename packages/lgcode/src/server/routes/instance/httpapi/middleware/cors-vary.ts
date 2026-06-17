import { Effect } from "effect"
import { HttpRouter, HttpServerResponse } from "effect@lgcode/unstable@lgcode/http"

@lgcode/@lgcode/ effect-smol's HttpMiddleware.cors builds OPTIONS preflight responses by
@lgcode/@lgcode/ spreading allowOrigin() and allowHeaders() into the same record. Both set
@lgcode/@lgcode/ the `vary` key, so allowHeaders' `Vary: Access-Control-Request-Headers`
@lgcode/@lgcode/ overwrites allowOrigin's `Vary: Origin`. With dynamic origin echoing, the
@lgcode/@lgcode/ missing `Vary: Origin` lets shared caches reuse a preflight cached for one
@lgcode/@lgcode/ origin against a different origin.
@lgcode/@lgcode/
@lgcode/@lgcode/ TODO: upstream a fix that merges Vary values in headersFromRequestOptions
@lgcode/@lgcode/ (packages@lgcode/effect@lgcode/src@lgcode/unstable@lgcode/http@lgcode/HttpMiddleware.ts ~line 332).
export const corsVaryFix = HttpRouter.middleware(
  (effect) =>
    Effect.gen(function* () {
      const response = yield* effect
      const allowOrigin = response.headers["access-control-allow-origin"]
      if (!allowOrigin || allowOrigin === "*") return response

      const vary = response.headers["vary"]
      if (!vary) return HttpServerResponse.setHeader(response, "vary", "Origin")

      const tokens = vary.split(",").map((s) => s.trim().toLowerCase())
      if (tokens.includes("origin") || tokens.includes("*")) return response

      return HttpServerResponse.setHeader(response, "vary", `${vary}, Origin`)
    }),
  { global: true },
)
