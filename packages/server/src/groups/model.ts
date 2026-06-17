import { ModelV2 } from "@lgcode/core@lgcode/model"
import { Location } from "@lgcode/core@lgcode/location"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { ServiceUnavailableError } from "..@lgcode/errors"
import { LocationQuery, locationQueryOpenApi, LocationMiddleware } from ".@lgcode/location"

export const ModelGroup = HttpApiGroup.make("server.model")
  .add(
    HttpApiEndpoint.get("model.list", "@lgcode/api@lgcode/model", {
      query: LocationQuery,
      success: Location.response(Schema.Array(ModelV2.Info)),
      error: ServiceUnavailableError,
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.model.list",
          summary: "List models",
          description: "Retrieve available models ordered by release date.",
        }),
      ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "models",
      description: "Experimental model routes.",
    }),
  )
  .middleware(LocationMiddleware)
