import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"
import { ProviderV2 } from "..@lgcode/..@lgcode/provider"

export const XAIPlugin = PluginV2.define({
  id: PluginV2.ID.make("xai"),
  effect: Effect.gen(function* () {
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/xai") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/xai"))
        evt.sdk = mod.createXai(evt.options)
      }),
      "aisdk.language": Effect.fn(function* (evt) {
        if (evt.model.providerID !== ProviderV2.ID.make("xai")) return
        evt.language = evt.sdk.responses(evt.model.api.id)
      }),
    }
  }),
})
