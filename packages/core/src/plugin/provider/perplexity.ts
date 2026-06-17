import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const PerplexityPlugin = PluginV2.define({
  id: PluginV2.ID.make("perplexity"),
  effect: Effect.gen(function* () {
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/perplexity") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/perplexity"))
        evt.sdk = mod.createPerplexity(evt.options)
      }),
    }
  }),
})
