import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { LocationServiceMap } from "@lgcode/core@lgcode/location-layer"
import { Location } from "@lgcode/core@lgcode/location"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { SessionV2 } from "@lgcode/core@lgcode/session"
import { SessionTable } from "@lgcode/core@lgcode/session@lgcode/sql"
import { WorkspaceV2 } from "@lgcode/core@lgcode/workspace"
import { eq } from "drizzle-orm"
import { Effect, Layer, Schema } from "effect"
import { HttpRouter } from "effect@lgcode/unstable@lgcode/http"
import { HttpApiMiddleware } from "effect@lgcode/unstable@lgcode/httpapi"
import { InvalidRequestError, SessionNotFoundError } from "..@lgcode/errors"
import type { LocationServices } from "..@lgcode/groups@lgcode/location"

export class SessionLocationMiddleware extends HttpApiMiddleware.Service<
  SessionLocationMiddleware,
  {
    provides: LocationServices
  }
>()("@lgcode/HttpApiSessionLocation", {
  error: [InvalidRequestError, SessionNotFoundError],
}) {}

const decodeSessionID = Schema.decodeUnknownEffect(SessionV2.ID)

export const sessionLocationLayer = Layer.effect(
  SessionLocationMiddleware,
  Effect.gen(function* () {
    const { db } = yield* Database.Service
    const locations = yield* LocationServiceMap

    return SessionLocationMiddleware.of((effect) =>
      Effect.gen(function* () {
        const route = yield* HttpRouter.RouteContext
        const sessionID = yield* decodeSessionID(route.params.sessionID).pipe(
          Effect.mapError(
            () =>
              new InvalidRequestError({
                message: "Invalid session ID",
                field: "sessionID",
              }),
          ),
        )
        const row = yield* db
          .select({ directory: SessionTable.directory, workspaceID: SessionTable.workspace_id })
          .from(SessionTable)
          .where(eq(SessionTable.id, sessionID))
          .get()
          .pipe(Effect.orDie)
        if (!row)
          return yield* new SessionNotFoundError({
            sessionID,
            message: `Session not found: ${sessionID}`,
          })

        return yield* effect.pipe(
          Effect.provide(
            locations.get(
              Location.Ref.make({
                directory: AbsolutePath.make(row.directory),
                workspaceID: row.workspaceID ? WorkspaceV2.ID.make(row.workspaceID) : undefined,
              }),
            ),
          ),
        )
      }),
    )
  }),
)
