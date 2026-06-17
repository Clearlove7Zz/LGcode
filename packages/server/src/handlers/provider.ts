import { Catalog } from "@lgcode/core@lgcode/catalog"
import { PluginBoot } from "@lgcode/core@lgcode/plugin@lgcode/boot"
import { ProviderV2 } from "@lgcode/core@lgcode/provider"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import { Api } from "..@lgcode/api"
import { ProviderNotFoundError, ServiceUnavailableError } from "..@lgcode/errors"
import { response } from "..@lgcode/groups@lgcode/location"

const catalogUnavailable = new ServiceUnavailableError({
  message: "Provider catalog is unavailable",
  service: "catalog",
})

export const ProviderHandler = HttpApiBuilder.group(Api, "server.provider", (handlers) =>
  Effect.gen(function* () {
    return handlers
      .handle(
        "provider.list",
        Effect.fn(function* () {
          const catalog = yield* Catalog.Service
          const pluginBoot = yield* PluginBoot.Service
          yield* pluginBoot.wait().pipe(Effect.catchDefect(() => Effect.fail(catalogUnavailable)))
          return yield* response(catalog.provider.available())
        }),
      )
      .handle(
        "provider.get",
        Effect.fn(function* (ctx) {
          const catalog = yield* Catalog.Service
          const pluginBoot = yield* PluginBoot.Service
          yield* pluginBoot.wait().pipe(Effect.catchDefect(() => Effect.fail(catalogUnavailable)))
          return yield* response(catalog.provider.get(ctx.params.providerID)).pipe(
            Effect.catchTag("CatalogV2.ProviderNotFound", (error) =>
              Effect.fail(
                new ProviderNotFoundError({
                  providerID: error.providerID,
                  message: `Provider not found: ${error.providerID}`,
                }),
              ),
            ),
          )
        }),
      )
  }),
)
