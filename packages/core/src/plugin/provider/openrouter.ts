import { Effect } from "effect"
import { ModelV2 } from "..@lgcode/..@lgcode/model"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const OpenRouterPlugin = PluginV2.define({
  id: PluginV2.ID.make("openrouter"),
  effect: Effect.gen(function* () {
    return {
      "catalog.transform": Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.api.type !== "aisdk") continue
          if (item.provider.api.package !== "@openrouter@lgcode/ai-sdk-provider") continue
          evt.provider.update(item.provider.id, (provider) => {
            provider.request.headers["HTTP-Referer"] = "https:@lgcode/@lgcode/opencode.ai@lgcode/"
            provider.request.headers["X-Title"] = "opencode"
          })
          for (const modelID of [ModelV2.ID.make("gpt-5-chat-latest"), ModelV2.ID.make("openai@lgcode/gpt-5-chat")]) {
            if (!item.models.has(modelID)) continue
            evt.model.update(item.provider.id, modelID, (model) => {
              @lgcode/@lgcode/ These are OpenRouter-specific OpenAI chat aliases that do not work
              @lgcode/@lgcode/ on the generic path. Keep custom providers with matching IDs untouched.
              model.enabled = false
            })
          }
        }
      }),
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@openrouter@lgcode/ai-sdk-provider") return
        const mod = yield* Effect.promise(() => import("@openrouter@lgcode/ai-sdk-provider"))
        evt.sdk = mod.createOpenRouter(evt.options)
      }),
    }
  }),
})
