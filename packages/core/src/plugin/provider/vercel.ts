import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const VercelPlugin = PluginV2.define({
  id: PluginV2.ID.make("vercel"),
  effect: Effect.gen(function* () {
    return {
      "catalog.transform": Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.api.type !== "aisdk") continue
          if (item.provider.api.package !== "@ai-sdk@lgcode/vercel") continue
          evt.provider.update(item.provider.id, (provider) => {
            provider.request.headers["http-referer"] = "https:@lgcode/@lgcode/opencode.ai@lgcode/"
            provider.request.headers["x-title"] = "opencode"
          })
        }
      }),
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/vercel") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/vercel"))
        evt.sdk = mod.createVercel(evt.options)
      }),
    }
  }),
})
