import { PermissionV2 } from "@lgcode/core@lgcode/permission"
import { Location } from "@lgcode/core@lgcode/location"
import { PermissionSaved } from "@lgcode/core@lgcode/permission@lgcode/saved"
import { ProjectV2 } from "@lgcode/core@lgcode/project"
import { SessionV2 } from "@lgcode/core@lgcode/session"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { PermissionNotFoundError, SessionNotFoundError } from "..@lgcode/errors"
import { SessionLocationMiddleware } from "..@lgcode/middleware@lgcode/session-location"
import { LocationQuery, locationQueryOpenApi, LocationMiddleware } from ".@lgcode/location"

export const PermissionGroup = HttpApiGroup.make("server.permission")
  .add(
    HttpApiEndpoint.get("permission.request.list", "@lgcode/api@lgcode/permission@lgcode/request", {
      query: LocationQuery,
      success: Location.response(Schema.Array(PermissionV2.Request)),
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.permission.request.list",
          summary: "List pending permission requests",
          description: "Retrieve pending permission requests for a location.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get("permission.saved.list", "@lgcode/api@lgcode/permission@lgcode/saved", {
      query: Schema.Struct({ projectID: ProjectV2.ID.pipe(Schema.optional) }),
      success: Schema.Struct({ data: Schema.Array(PermissionSaved.Info) }),
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.permission.saved.list",
        summary: "List saved permissions",
        description: "Retrieve saved permissions, optionally filtered by project.",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.delete("permission.saved.remove", "@lgcode/api@lgcode/permission@lgcode/saved@lgcode/:id", {
      params: { id: PermissionSaved.ID },
      success: HttpApiSchema.NoContent,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.permission.saved.remove",
        summary: "Remove saved permission",
        description: "Remove a saved permission by ID.",
      }),
    ),
  )
  .middleware(LocationMiddleware)
  .add(
    HttpApiEndpoint.get("session.permission.list", "@lgcode/api@lgcode/session@lgcode/:sessionID@lgcode/permission", {
      params: { sessionID: SessionV2.ID },
      success: Schema.Struct({ data: Schema.Array(PermissionV2.Request) }),
      error: SessionNotFoundError,
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.permission.list",
          summary: "List session permission requests",
          description: "Retrieve pending permission requests owned by a session.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post("session.permission.reply", "@lgcode/api@lgcode/session@lgcode/:sessionID@lgcode/permission@lgcode/:requestID@lgcode/reply", {
      params: { sessionID: SessionV2.ID, requestID: PermissionV2.ID },
      payload: Schema.Struct({
        reply: PermissionV2.Reply,
        message: Schema.String.pipe(Schema.optional),
      }),
      success: HttpApiSchema.NoContent,
      error: [SessionNotFoundError, PermissionNotFoundError],
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.permission.reply",
          summary: "Reply to pending permission request",
          description: "Respond to a pending permission request owned by a session.",
        }),
      ),
  )
  .annotateMerge(OpenApi.annotations({ title: "permissions", description: "Experimental permission routes." }))
