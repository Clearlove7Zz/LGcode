import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const ZenmuxPlugin = PluginV2.define({
  id: PluginV2.ID.make("zenmux"),
  effect: Effect.gen(function* () {
    return {
      "catalog.transform": Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.api.type !== "aisdk") continue
          if (item.provider.api.package !== "@ai-sdk@lgcode/openai-compatible") continue
          if (item.provider.api.url !== "https:@lgcode/@lgcode/zenmux.ai@lgcode/api@lgcode/v1") continue
          evt.provider.update(item.provider.id, (provider) => {
            provider.request.headers["HTTP-Referer"] ??= "https:@lgcode/@lgcode/opencode.ai@lgcode/"
            provider.request.headers["X-Title"] ??= "opencode"
          })
        }
      }),
    }
  }),
})
