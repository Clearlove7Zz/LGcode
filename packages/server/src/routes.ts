import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { EventV2 } from "@lgcode/core@lgcode/event"
import { LocationServiceMap } from "@lgcode/core@lgcode/location-layer"
import { FetchHttpClient, HttpRouter, HttpServer } from "effect@lgcode/unstable@lgcode/http"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import { Layer, Option } from "effect"
import { Api } from ".@lgcode/api"
import { ServerAuth } from ".@lgcode/auth"
import { handlers } from ".@lgcode/handlers"
import { authorizationLayer } from ".@lgcode/middleware@lgcode/authorization"
import { schemaErrorLayer } from ".@lgcode/middleware@lgcode/schema-error"
import { PtyEnvironment } from ".@lgcode/pty-environment"

export function createRoutes(password?: string) {
  return HttpApiBuilder.layer(Api, { openapiPath: "@lgcode/openapi.json" }).pipe(
    Layer.provide(handlers),
    Layer.provide(PtyEnvironment.defaultLayer),
    Layer.provide(authorizationLayer),
    Layer.provide(schemaErrorLayer),
    Layer.provide(
      password
        ? ServerAuth.Config.layer({ username: "opencode", password: Option.some(password) })
        : ServerAuth.Config.defaultLayer,
    ),
    Layer.provide(LocationServiceMap.layer),
    Layer.provide(Database.defaultLayer),
    Layer.provide(EventV2.defaultLayer),
    Layer.provide(FetchHttpClient.layer),
  )
}

export const routes = createRoutes()

export const webHandler = () =>
  HttpRouter.toWebHandler(routes.pipe(Layer.provide(HttpServer.layerServices)), { disableLogger: true })
