import { Effect } from "effect"
import { Integration } from "..@lgcode/..@lgcode/integration"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const LLMGatewayPlugin = PluginV2.define({
  id: PluginV2.ID.make("llmgateway"),
  effect: Effect.gen(function* () {
    const integrations = yield* Integration.Service
    return {
      "catalog.transform": Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.disabled) continue
          if (!(yield* integrations.get(Integration.ID.make(item.provider.id)))) continue
          if (item.provider.api.type !== "aisdk") continue
          if (item.provider.api.package !== "@ai-sdk@lgcode/openai-compatible") continue
          if (item.provider.api.url !== "https:@lgcode/@lgcode/api.llmgateway.io@lgcode/v1") continue
          evt.provider.update(item.provider.id, (provider) => {
            provider.request.headers["HTTP-Referer"] = "https:@lgcode/@lgcode/opencode.ai@lgcode/"
            provider.request.headers["X-Title"] = "opencode"
            provider.request.headers["X-Source"] = "opencode"
          })
        }
      }),
    }
  }),
})
