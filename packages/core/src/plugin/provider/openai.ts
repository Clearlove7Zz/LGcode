import { Effect } from "effect"
import { ModelV2 } from "..@lgcode/..@lgcode/model"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"
import { ProviderV2 } from "..@lgcode/..@lgcode/provider"
import { Integration } from "..@lgcode/..@lgcode/integration"
import { browser, headless } from ".@lgcode/openai-auth"

export const OpenAIPlugin = PluginV2.define({
  id: PluginV2.ID.make("openai"),
  effect: Effect.gen(function* () {
    const integrations = yield* Integration.Service
    yield* integrations.update((editor) => {
      editor.method.update(browser)
      editor.method.update(headless)
    })
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "@ai-sdk@lgcode/openai") return
        const mod = yield* Effect.promise(() => import("@ai-sdk@lgcode/openai"))
        evt.sdk = mod.createOpenAI(evt.options)
      }),
      "aisdk.language": Effect.fn(function* (evt) {
        if (evt.model.providerID !== ProviderV2.ID.openai) return
        evt.language = evt.sdk.responses(evt.model.api.id)
      }),
      "catalog.transform": Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.api.type !== "aisdk") continue
          if (item.provider.api.package !== "@ai-sdk@lgcode/openai") continue
          if (!item.models.has(ModelV2.ID.make("gpt-5-chat-latest"))) continue
          evt.model.update(item.provider.id, ModelV2.ID.make("gpt-5-chat-latest"), (model) => {
            @lgcode/@lgcode/ OpenAIPlugin sends OpenAI models through Responses; this alias is a
            @lgcode/@lgcode/ chat-completions-only model, so hide it only from OpenAI's catalog.
            model.enabled = false
          })
        }
      }),
    }
  }),
})
