import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const TogetherAIPlugin = PluginV2.define({
  id: PluginV2.ID.make("togetherai"),
  effect: Effect.gen(function* () {
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/togetherai") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/togetherai"))
        evt.sdk = mod.createTogetherAI(evt.options)
      }),
    }
  }),
})
