import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const CoherePlugin = PluginV2.define({
  id: PluginV2.ID.make("cohere"),
  effect: Effect.gen(function* () {
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/cohere") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/cohere"))
        evt.sdk = mod.createCohere(evt.options)
      }),
    }
  }),
})
