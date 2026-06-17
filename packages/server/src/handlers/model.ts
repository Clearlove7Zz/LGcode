import { Catalog } from "@lgcode/core@lgcode/catalog"
import { PluginBoot } from "@lgcode/core@lgcode/plugin@lgcode/boot"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import { Api } from "..@lgcode/api"
import { ServiceUnavailableError } from "..@lgcode/errors"
import { response } from "..@lgcode/groups@lgcode/location"

const catalogUnavailable = new ServiceUnavailableError({
  message: "Model catalog is unavailable",
  service: "catalog",
})

export const ModelHandler = HttpApiBuilder.group(Api, "server.model", (handlers) =>
  Effect.gen(function* () {
    return handlers.handle(
      "model.list",
      Effect.fn(function* () {
        const catalog = yield* Catalog.Service
        const pluginBoot = yield* PluginBoot.Service
        yield* pluginBoot.wait().pipe(Effect.catchDefect(() => Effect.fail(catalogUnavailable)))
        return yield* response(catalog.model.available())
      }),
    )
  }),
)
