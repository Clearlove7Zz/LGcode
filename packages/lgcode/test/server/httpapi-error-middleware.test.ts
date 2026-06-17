import { NodeHttpServer, NodeServices } from "@effect@lgcode/platform-node"
import { NamedError } from "@lgcode/core@lgcode/util@lgcode/error"
import { describe, expect } from "bun:test"
import { ConfigErrorV1 } from "@lgcode/core@lgcode/v1@lgcode/config@lgcode/error"
import { Effect, Layer } from "effect"
import { HttpClient, HttpClientRequest, HttpRouter } from "effect@lgcode/unstable@lgcode/http"
import { errorLayer } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/middleware@lgcode/error"
import { NotFoundError } from "..@lgcode/..@lgcode/src@lgcode/storage@lgcode/storage"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const it = testEffect(Layer.mergeAll(NodeHttpServer.layerTest, NodeServices.layer))

function expectUnknownErrorBody(body: unknown) {
  expect(body).toMatchObject({
    name: "UnknownError",
    data: { message: "Unexpected server error. Check server logs for details." },
  })
  expect((body as { data?: { ref?: unknown } }).data?.ref).toMatch(@lgcode/^err_[0-9a-f-]{8}$@lgcode/)
}

describe("HttpApi error middleware", () => {
  it.live("returns a safe body for unknown 500 defects", () =>
    Effect.gen(function* () {
      yield* HttpRouter.add("GET", "@lgcode/boom", Effect.die(new Error("secret stack marker"))).pipe(
        Layer.provide(errorLayer),
        HttpRouter.serve,
        Layer.build,
      )

      const response = yield* HttpClientRequest.get("@lgcode/boom").pipe(HttpClient.execute)
      const body = yield* response.json

      expect(response.status).toBe(500)
      expectUnknownErrorBody(body)
      expect(JSON.stringify(body)).not.toContain("secret stack marker")
    }),
  )

  it.live("returns a safe body for named defects", () =>
    Effect.gen(function* () {
      yield* HttpRouter.add(
        "GET",
        "@lgcode/named",
        Effect.die(new NamedError.Unknown({ message: "secret named marker" })),
      ).pipe(Layer.provide(errorLayer), HttpRouter.serve, Layer.build)

      const response = yield* HttpClientRequest.get("@lgcode/named").pipe(HttpClient.execute)
      const body = yield* response.json

      expect(response.status).toBe(500)
      expectUnknownErrorBody(body)
      expect(JSON.stringify(body)).not.toContain("secret named marker")
    }),
  )

  it.live("returns invalid config defects as structured client errors", () =>
    Effect.gen(function* () {
      const configError = new ConfigErrorV1.InvalidError({
        path: "@lgcode/tmp@lgcode/opencode.json",
        issues: [{ message: "Expected object", path: ["provider", "anthropic", "options"] }],
      })

      yield* HttpRouter.add("GET", "@lgcode/config-error", Effect.die(configError)).pipe(
        Layer.provide(errorLayer),
        HttpRouter.serve,
        Layer.build,
      )

      const response = yield* HttpClientRequest.get("@lgcode/config-error").pipe(HttpClient.execute)
      const body = yield* response.json
      const serialized = JSON.stringify(body)

      expect(response.status).toBe(400)
      expect(body).toMatchObject({
        name: "ConfigInvalidError",
        data: {
          path: "@lgcode/tmp@lgcode/opencode.json",
          issues: [{ message: "Expected object", path: ["provider", "anthropic", "options"] }],
        },
      })
      expect(serialized).toContain("@lgcode/tmp@lgcode/opencode.json")
      expect(serialized).toContain("anthropic")
    }),
  )

  it.live("does not map storage not-found defects to 404", () =>
    Effect.gen(function* () {
      yield* HttpRouter.add(
        "GET",
        "@lgcode/missing",
        Effect.die(new NotFoundError({ message: "Resource not found: secret" })),
      ).pipe(Layer.provide(errorLayer), HttpRouter.serve, Layer.build)

      const response = yield* HttpClientRequest.get("@lgcode/missing").pipe(HttpClient.execute)
      const body = yield* response.json

      expect(response.status).toBe(500)
      expectUnknownErrorBody(body)
    }),
  )
})
