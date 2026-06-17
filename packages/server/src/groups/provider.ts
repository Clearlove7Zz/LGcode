import { ProviderV2 } from "@lgcode/core@lgcode/provider"
import { Location } from "@lgcode/core@lgcode/location"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { ProviderNotFoundError, ServiceUnavailableError } from "..@lgcode/errors"
import { LocationQuery, locationQueryOpenApi, LocationMiddleware } from ".@lgcode/location"

export const ProviderGroup = HttpApiGroup.make("server.provider")
  .add(
    HttpApiEndpoint.get("provider.list", "@lgcode/api@lgcode/provider", {
      query: LocationQuery,
      success: Location.response(Schema.Array(ProviderV2.Info)),
      error: ServiceUnavailableError,
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.provider.list",
          summary: "List providers",
          description: "Retrieve active AI providers so clients can show provider availability and configuration.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get("provider.get", "@lgcode/api@lgcode/provider@lgcode/:providerID", {
      params: { providerID: ProviderV2.ID },
      query: LocationQuery,
      success: Location.response(ProviderV2.Info),
      error: [ProviderNotFoundError, ServiceUnavailableError],
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.provider.get",
          summary: "Get provider",
          description: "Retrieve a single AI provider so clients can inspect its availability and endpoint settings.",
        }),
      ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "providers",
      description: "Experimental provider routes.",
    }),
  )
  .middleware(LocationMiddleware)
