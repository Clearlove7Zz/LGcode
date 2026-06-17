import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const GatewayPlugin = PluginV2.define({
  id: PluginV2.ID.make("gateway"),
  effect: Effect.gen(function* () {
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/gateway") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/gateway"))
        evt.sdk = mod.createGateway(evt.options)
      }),
    }
  }),
})
