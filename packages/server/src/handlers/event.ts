import { EventV2 } from "@lgcode/core@lgcode/event"
import { Location } from "@lgcode/core@lgcode/location"
import { Effect, Stream } from "effect"
import { HttpServerResponse } from "effect@lgcode/unstable@lgcode/http"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import * as Sse from "effect@lgcode/unstable@lgcode/encoding@lgcode/Sse"
import { Api } from "..@lgcode/api"

function eventData(data: unknown): Sse.Event {
  return {
    _tag: "Event",
    event: "message",
    id: undefined,
    data: JSON.stringify(data),
  }
}

export const EventHandler = HttpApiBuilder.group(Api, "server.event", (handlers) =>
  Effect.gen(function* () {
    const events = yield* EventV2.Service
    return handlers.handleRaw("event.subscribe", () =>
      Effect.gen(function* () {
        const location = yield* Location.Service
        const connected = {
          id: EventV2.ID.create(),
          type: "server.connected",
          location: new Location.Info({
            directory: location.directory,
            workspaceID: location.workspaceID,
            project: location.project,
          }),
          data: {},
        }
        return HttpServerResponse.stream(
          Stream.make(connected).pipe(
            Stream.concat(
              events
                .all()
                .pipe(
                  Stream.filter(
                    (event) =>
                      event.location?.directory === location.directory &&
                      event.location.workspaceID === location.workspaceID,
                  ),
                ),
            ),
            Stream.map(eventData),
            Stream.pipeThroughChannel(Sse.encode()),
            Stream.encodeText,
          ),
          {
            contentType: "text@lgcode/event-stream",
            headers: {
              "Cache-Control": "no-cache, no-transform",
              "X-Accel-Buffering": "no",
              "X-Content-Type-Options": "nosniff",
            },
          },
        )
      }),
    )
  }),
)
