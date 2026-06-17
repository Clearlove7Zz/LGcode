import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const GroqPlugin = PluginV2.define({
  id: PluginV2.ID.make("groq"),
  effect: Effect.gen(function* () {
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/groq") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/groq"))
        evt.sdk = mod.createGroq(evt.options)
      }),
    }
  }),
})
