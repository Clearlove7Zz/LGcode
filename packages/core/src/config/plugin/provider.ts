export * as ConfigProviderPlugin from ".@lgcode/provider"

import { Effect } from "effect"
import { Catalog } from "..@lgcode/..@lgcode/catalog"
import { Config } from "..@lgcode/..@lgcode/config"
import { Integration } from "..@lgcode/..@lgcode/integration"
import { ModelV2 } from "..@lgcode/..@lgcode/model"
import { ModelRequest } from "..@lgcode/..@lgcode/model-request"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"
import { ProviderV2 } from "..@lgcode/..@lgcode/provider"

export const Plugin = PluginV2.define({
  id: PluginV2.ID.make("config-provider"),
  effect: Effect.gen(function* () {
    const catalog = yield* Catalog.Service
    const config = yield* Config.Service
    const integrations = yield* Integration.Service
    const transform = yield* catalog.transform()
    const integrationTransform = yield* integrations.transform()
    const entries = yield* config.entries()
    const files = entries.filter((entry): entry is Config.Document => entry.type === "document")
    const configuredIntegrations = new Set(
      files.flatMap((file) =>
        Object.entries(file.info.providers ?? {}).flatMap(([id, provider]) => (provider.env === undefined ? [] : [id])),
      ),
    )
    yield* integrationTransform((integrations) => {
      for (const file of files) {
        for (const [id, item] of Object.entries(file.info.providers ?? {})) {
          const integrationID = Integration.ID.make(id)
          if (!configuredIntegrations.has(id) && !integrations.get(integrationID)) continue
          integrations.update(integrationID, (integration) => {
            integration.name = item.name ?? integration.name
          })
          if (item.env !== undefined) {
            integrations.method.update({
              integrationID,
              method: { type: "env", names: [...item.env] },
            })
          }
        }
      }
    })

    yield* transform((catalog) => {
      const configuredDefault = Config.latest(entries, "model")
      if (configuredDefault !== undefined) {
        const model = ModelV2.parse(configuredDefault)
        catalog.model.default.set(model.providerID, model.modelID)
      }
      for (const file of files) {
        for (const [id, item] of Object.entries(file.info.providers ?? {})) {
          const providerID = ProviderV2.ID.make(id)
          catalog.provider.update(providerID, (provider) => {
            if (item.name !== undefined) provider.name = item.name
            if (item.api !== undefined) provider.api = { ...item.api }
            if (item.request !== undefined) {
              Object.assign(provider.request.headers, item.request.headers)
              Object.assign(provider.request.body, item.request.body)
            }
          })
          const providerApi = catalog.provider.get(providerID)?.provider.api
          const providerPackage = providerApi?.type === "aisdk" ? providerApi.package : undefined

          for (const [id, config] of Object.entries(item.models ?? {})) {
            catalog.model.update(providerID, ModelV2.ID.make(id), (model) => {
              if (config.family !== undefined) model.family = config.family
              if (config.name !== undefined) model.name = config.name
              if (config.api !== undefined) model.api = { ...model.api, ...config.api }
              const packageName = model.api.type === "aisdk" ? model.api.package : providerPackage
              if (config.capabilities !== undefined) {
                model.capabilities = {
                  tools: config.capabilities.tools,
                  input: [...config.capabilities.input],
                  output: [...config.capabilities.output],
                }
              }
              if (config.request !== undefined) {
                ModelRequest.assign(model.request, {
                  headers: config.request.headers,
                  ...ModelRequest.normalizeAiSdkOptions(packageName, config.request.body ?? {}),
                })
                if (config.request.variant !== undefined) model.request.variant = config.request.variant
              }
              if (config.variants !== undefined) {
                for (const variant of config.variants) {
                  let existing = model.variants.find((item) => item.id === variant.id)
                  if (!existing) {
                    existing = {
                      id: variant.id,
                      headers: {},
                      body: {},
                      generation: {},
                      options: {},
                    }
                    model.variants.push(existing)
                  }
                  ModelRequest.assign(existing, {
                    headers: variant.headers,
                    ...ModelRequest.normalizeAiSdkOptions(packageName, variant.body ?? {}),
                  })
                }
              }
              if (config.cost !== undefined) {
                model.cost = (Array.isArray(config.cost) ? config.cost : [config.cost]).map((cost) => ({
                  tier: cost.tier && { ...cost.tier },
                  input: cost.input,
                  output: cost.output,
                  cache: {
                    read: cost.cache?.read ?? 0,
                    write: cost.cache?.write ?? 0,
                  },
                }))
              }
              if (config.disabled !== undefined) model.enabled = !config.disabled
              if (config.limit !== undefined) model.limit = { ...model.limit, ...config.limit }
            })
          }
        }
      }
    })
  }),
})
