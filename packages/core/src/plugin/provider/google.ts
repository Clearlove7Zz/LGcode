import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const GooglePlugin = PluginV2.define({
  id: PluginV2.ID.make("google"),
  effect: Effect.gen(function* () {
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/google") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/google"))
        evt.sdk = mod.createGoogleGenerativeAI(evt.options)
      }),
    }
  }),
})
