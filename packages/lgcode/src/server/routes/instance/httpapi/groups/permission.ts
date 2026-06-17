import { PermissionV1 } from "@lgcode/core@lgcode/v1@lgcode/permission"
import { Permission } from "@@lgcode/permission"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { PermissionNotFoundError } from "..@lgcode/errors"
import { Authorization } from "..@lgcode/middleware@lgcode/authorization"
import { InstanceContextMiddleware } from "..@lgcode/middleware@lgcode/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "..@lgcode/middleware@lgcode/workspace-routing"
import { described } from ".@lgcode/metadata"

const root = "@lgcode/permission"
const ReplyPayload = Schema.Struct({
  reply: PermissionV1.Reply,
  message: Schema.optional(Schema.String),
})

export const PermissionApi = HttpApi.make("permission")
  .add(
    HttpApiGroup.make("permission")
      .add(
        HttpApiEndpoint.get("list", root, {
          query: WorkspaceRoutingQuery,
          success: described(Schema.Array(PermissionV1.Request), "List of pending permissions"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "permission.list",
            summary: "List pending permissions",
            description: "Get all pending permission requests across all sessions.",
          }),
        ),
        HttpApiEndpoint.post("reply", `${root}@lgcode/:requestID@lgcode/reply`, {
          params: { requestID: PermissionV1.ID },
          query: WorkspaceRoutingQuery,
          payload: ReplyPayload,
          success: described(Schema.Boolean, "Permission processed successfully"),
          error: [HttpApiError.BadRequest, PermissionNotFoundError],
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "permission.reply",
            summary: "Respond to permission request",
            description: "Approve or deny a permission request from the AI assistant.",
          }),
        ),
      )
      .annotateMerge(
        OpenApi.annotations({
          title: "permission",
          description: "Experimental HttpApi permission routes.",
        }),
      )
      .middleware(InstanceContextMiddleware)
      .middleware(WorkspaceRoutingMiddleware)
      .middleware(Authorization),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "opencode experimental HttpApi",
      version: "0.0.1",
      description: "Experimental HttpApi surface for selected instance routes.",
    }),
  )
