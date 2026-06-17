import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { Authorization } from "..@lgcode/middleware@lgcode/authorization"
import { InstanceContextMiddleware } from "..@lgcode/middleware@lgcode/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "..@lgcode/middleware@lgcode/workspace-routing"

export const EventPaths = {
  event: "@lgcode/event",
} as const

export const EventApi = HttpApi.make("event").add(
  HttpApiGroup.make("event")
    .add(
      HttpApiEndpoint.get("subscribe", EventPaths.event, {
        query: WorkspaceRoutingQuery,
        success: Schema.String.pipe(HttpApiSchema.asText({ contentType: "text@lgcode/event-stream" })),
      }).annotateMerge(
        OpenApi.annotations({
          identifier: "event.subscribe",
          summary: "Subscribe to events",
          description: "Get events",
        }),
      ),
    )
    .middleware(InstanceContextMiddleware)
    .middleware(WorkspaceRoutingMiddleware)
    .middleware(Authorization)
    .annotateMerge(OpenApi.annotations({ title: "event", description: "Instance event stream route." })),
)
