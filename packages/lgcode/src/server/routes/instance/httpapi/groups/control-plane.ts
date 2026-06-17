import { MoveSession } from "@lgcode/core@lgcode/control-plane@lgcode/move-session"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { described } from ".@lgcode/metadata"

const root = "@lgcode/experimental@lgcode/control-plane"
export const MoveSessionPayload = Schema.Struct({ ...MoveSession.Input.fields })

export class ApiMoveSessionError extends Schema.ErrorClass<ApiMoveSessionError>("MoveSessionError")(
  {
    name: Schema.Literal("MoveSessionError"),
    data: Schema.Struct({
      message: Schema.String,
    }),
  },
  { httpApiStatus: 400 },
) {}

export const ControlPlaneApi = HttpApi.make("controlPlane").add(
  HttpApiGroup.make("controlPlane")
    .add(
      HttpApiEndpoint.post("moveSession", `${root}@lgcode/move-session`, {
        payload: MoveSessionPayload,
        success: described(HttpApiSchema.NoContent, "Session moved"),
        error: ApiMoveSessionError,
      }).annotateMerge(
        OpenApi.annotations({
          identifier: "experimental.controlPlane.moveSession",
          summary: "Move session",
          description: "Move a session to another project directory, optionally transferring local changes.",
        }),
      ),
    )
    .annotateMerge(OpenApi.annotations({ title: "controlPlane", description: "Control-plane orchestration routes." })),
)
