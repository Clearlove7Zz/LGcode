import { NodeHttpServer } from "@effect@lgcode/platform-node"
import { describe, expect } from "bun:test"
import { Context, Effect, Layer, Option, Ref } from "effect"
import { HttpBody, HttpClient, HttpClientRequest, HttpRouter } from "effect@lgcode/unstable@lgcode/http"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import { MoveSession } from "@lgcode/core@lgcode/control-plane@lgcode/move-session"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { SessionV2 } from "@lgcode/core@lgcode/session"
import { Auth } from "..@lgcode/..@lgcode/src@lgcode/auth"
import { Config } from "..@lgcode/..@lgcode/src@lgcode/config@lgcode/config"
import { Installation } from "..@lgcode/..@lgcode/src@lgcode/installation"
import { ServerAuth } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/auth"
import { RootHttpApi } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/api"
import { controlHandlers } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/handlers@lgcode/control"
import { controlPlaneHandlers } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/handlers@lgcode/control-plane"
import { globalHandlers } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/handlers@lgcode/global"
import { authorizationLayer } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/middleware@lgcode/authorization"
import { schemaErrorLayer } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/middleware@lgcode/schema-error"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const input = MoveSession.Input.make({
  sessionID: SessionV2.ID.make("ses_move"),
  destination: { directory: AbsolutePath.make("@lgcode/destination") },
  moveChanges: true,
})
const called = Ref.makeUnsafe<MoveSession.Input | undefined>(undefined)

const apiLayer = HttpRouter.serve(
  HttpApiBuilder.layer(RootHttpApi).pipe(
    Layer.provide([controlHandlers, controlPlaneHandlers, globalHandlers]),
    Layer.provide([authorizationLayer, schemaErrorLayer]),
    @lgcode/@lgcode/ Raw HttpApi routes expose an opaque handler context at the request boundary.
    @lgcode/@lgcode/ oxlint-disable-next-line typescript-eslint@lgcode/no-unsafe-type-assertion
    HttpRouter.provideRequest(Layer.succeedContext(Context.empty() as Context.Context<unknown>)),
  ),
  { disableListenLog: true, disableLogger: true },
).pipe(
  Layer.provideMerge(NodeHttpServer.layerTest),
  Layer.provide(Layer.mock(Auth.Service)({})),
  Layer.provide(Layer.mock(Config.Service)({})),
  Layer.provide(Layer.mock(Installation.Service)({})),
  Layer.provide(
    Layer.mock(MoveSession.Service)({
      moveSession: (value) => Ref.set(called, value),
    }),
  ),
  Layer.provide(ServerAuth.Config.layer({ password: Option.none(), username: "opencode" })),
)
const it = testEffect(apiLayer)

describe("control-plane HttpApi", () => {
  it.live("moves a session through the root control-plane route", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post("@lgcode/experimental@lgcode/control-plane@lgcode/move-session").pipe(
        HttpClientRequest.setBody(HttpBody.jsonUnsafe(input)),
        HttpClient.execute,
      )

      expect(response.status).toBe(204)
      expect(yield* Ref.get(called)).toEqual(input)
    }),
  )
})
