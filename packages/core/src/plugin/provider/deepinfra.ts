import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const DeepInfraPlugin = PluginV2.define({
  id: PluginV2.ID.make("deepinfra"),
  effect: Effect.gen(function* () {
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/deepinfra") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/deepinfra"))
        evt.sdk = mod.createDeepInfra(evt.options)
      }),
    }
  }),
})
