import { Location } from "@lgcode/core@lgcode/location"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import { Api } from "..@lgcode/api"

export const LocationHandler = HttpApiBuilder.group(Api, "server.location", (handlers) =>
  handlers.handle(
    "location.get",
    Effect.fn(function* () {
      const location = yield* Location.Service
      return new Location.Info({
        directory: location.directory,
        workspaceID: location.workspaceID,
        project: location.project,
      })
    }),
  ),
)
