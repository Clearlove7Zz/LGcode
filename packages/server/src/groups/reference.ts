import { Location } from "@lgcode/core@lgcode/location"
import { Reference } from "@lgcode/core@lgcode/reference"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { LocationMiddleware, LocationQuery, locationQueryOpenApi } from ".@lgcode/location"

export const ReferenceGroup = HttpApiGroup.make("server.reference")
  .add(
    HttpApiEndpoint.get("reference.list", "@lgcode/api@lgcode/reference", {
      query: LocationQuery,
      success: Location.response(Schema.Array(Reference.Info)),
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.reference.list",
          summary: "List references",
          description: "List references available in the requested location.",
        }),
      ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "reference",
      description: "Location-scoped project references.",
    }),
  )
  .middleware(LocationMiddleware)
