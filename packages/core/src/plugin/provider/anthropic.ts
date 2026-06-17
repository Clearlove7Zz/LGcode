import { Effect } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const AnthropicPlugin = PluginV2.define({
  id: PluginV2.ID.make("anthropic"),
  effect: Effect.gen(function* () {
    return {
      "catalog.transform": Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.api.type !== "aisdk") continue
          if (item.provider.api.package !== "@ai-sdk@lgcode/anthropic") continue
          evt.provider.update(item.provider.id, (provider) => {
            provider.request.headers["anthropic-beta"] =
              "interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14"
          })
        }
      }),
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/anthropic") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/anthropic"))
        evt.sdk = mod.createAnthropic(evt.options)
      }),
    }
  }),
})
