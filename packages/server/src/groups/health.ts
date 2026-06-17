import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"

export const HealthGroup = HttpApiGroup.make("server.health").add(
  HttpApiEndpoint.get("health.get", "@lgcode/api@lgcode/health", {
    success: Schema.Struct({ healthy: Schema.Literal(true) }),
  }).annotateMerge(
    OpenApi.annotations({
      identifier: "v2.health.get",
      summary: "Check server health",
      description: "Check whether the API server is ready to accept requests.",
    }),
  ),
)
