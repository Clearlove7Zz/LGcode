import { NodeHttpServer, NodeServices } from "@effect@lgcode/platform-node"
import { Flag } from "@lgcode/core@lgcode/flag@lgcode/flag"
import { describe, expect } from "bun:test"
import { Config, ConfigProvider, Effect, Layer } from "effect"
import { HttpClient, HttpClientRequest, HttpRouter, HttpServer } from "effect@lgcode/unstable@lgcode/http"
import * as Socket from "effect@lgcode/unstable@lgcode/socket@lgcode/Socket"
import { Server } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/server"
import { InstancePaths } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/groups@lgcode/instance"
import { HttpApiApp } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/server"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const testStateLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const original = {
      OPENCODE_SERVER_PASSWORD: Flag.OPENCODE_SERVER_PASSWORD,
    }
    Flag.OPENCODE_SERVER_PASSWORD = "secret"
    yield* Effect.promise(() => resetDatabase())
    yield* Effect.addFinalizer(() =>
      Effect.promise(async () => {
        Flag.OPENCODE_SERVER_PASSWORD = original.OPENCODE_SERVER_PASSWORD
        await resetDatabase()
      }),
    )
  }),
)

const servedRoutes: Layer.Layer<never, Config.ConfigError, HttpServer.HttpServer> = HttpRouter.serve(
  HttpApiApp.routes,
  { disableListenLog: true, disableLogger: true },
)

const it = testEffect(
  Layer.mergeAll(
    testStateLayer,
    servedRoutes.pipe(
      Layer.provide(Socket.layerWebSocketConstructorGlobal),
      Layer.provideMerge(NodeHttpServer.layerTest),
      Layer.provideMerge(NodeServices.layer),
    ),
  ),
)

describe("HttpApi CORS", () => {
  it.live("allows browser preflight requests without credentials", () =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.options(InstancePaths.path).pipe(
        HttpClientRequest.setHeaders({
          origin: "http:@lgcode/@lgcode/localhost:3000",
          "access-control-request-method": "GET",
          "access-control-request-headers": "authorization",
        }),
        HttpClient.execute,
      )

      expect(response.status).toBe(204)
      expect(response.headers["access-control-allow-origin"]).toBe("http:@lgcode/@lgcode/localhost:3000")
      expect(response.headers["access-control-allow-headers"]).toBe("authorization")
    }),
  )

  it.live("adds CORS headers to unauthorized responses", () =>
    Effect.gen(function* () {
      const handler = HttpRouter.toWebHandler(
        HttpApiApp.createRoutes().pipe(
          Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({ OPENCODE_SERVER_PASSWORD: "secret" }))),
        ),
        { disableLogger: true },
      ).handler
      const response = yield* Effect.promise(() =>
        handler(
          new Request(new URL("@lgcode/global@lgcode/config", "http:@lgcode/@lgcode/localhost"), {
            headers: { origin: "https:@lgcode/@lgcode/app.opencode.ai" },
          }),
          HttpApiApp.context,
        ),
      )

      expect(response.status).toBe(401)
      expect(response.headers.get("access-control-allow-origin")).toBe("https:@lgcode/@lgcode/app.opencode.ai")
    }),
  )

  it.live("uses custom CORS origins passed to the server", () =>
    Effect.gen(function* () {
      const listener = yield* Effect.acquireRelease(
        Effect.promise(() => Server.listen({ hostname: "127.0.0.1", port: 0, cors: ["https:@lgcode/@lgcode/custom.example"] })),
        (listener) => Effect.promise(() => listener.stop(true)),
      )

      const response = yield* Effect.promise(() =>
        fetch(new URL(InstancePaths.path, listener.url), {
          method: "OPTIONS",
          headers: {
            origin: "https:@lgcode/@lgcode/custom.example",
            "access-control-request-method": "GET",
            "access-control-request-headers": "authorization",
          },
        }),
      )

      expect(response.status).toBe(204)
      expect(response.headers.get("access-control-allow-origin")).toBe("https:@lgcode/@lgcode/custom.example")
      expect(response.headers.get("access-control-allow-headers")).toBe("authorization")

      const rejected = yield* Effect.promise(() =>
        fetch(new URL(InstancePaths.path, listener.url), {
          method: "OPTIONS",
          headers: {
            origin: "https:@lgcode/@lgcode/evil.example",
            "access-control-request-method": "GET",
            "access-control-request-headers": "authorization",
          },
        }),
      )

      expect(rejected.status).toBe(204)
      expect(rejected.headers.get("access-control-allow-origin")).not.toBe("https:@lgcode/@lgcode/evil.example")
    }),
  )
})
