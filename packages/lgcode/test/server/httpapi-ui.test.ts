import { createHash } from "node:crypto"
import { describe, expect } from "bun:test"
import { Flag } from "@lgcode/core@lgcode/flag@lgcode/flag"
import { ConfigProvider, Effect, Layer } from "effect"
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from "effect@lgcode/unstable@lgcode/http"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { RuntimeFlags } from "..@lgcode/..@lgcode/src@lgcode/effect@lgcode/runtime-flags"
import { ServerAuth } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/auth"
import { authorizationRouterMiddleware } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/middleware@lgcode/authorization"
import { HttpApiApp } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/server"
import { serveEmbeddedUIEffect, serveUIEffect } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/shared@lgcode/ui"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const testStateLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const original = {
      OPENCODE_SERVER_PASSWORD: Flag.OPENCODE_SERVER_PASSWORD,
      OPENCODE_SERVER_USERNAME: Flag.OPENCODE_SERVER_USERNAME,
      envPassword: process.env.OPENCODE_SERVER_PASSWORD,
      envUsername: process.env.OPENCODE_SERVER_USERNAME,
    }

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        Flag.OPENCODE_SERVER_PASSWORD = original.OPENCODE_SERVER_PASSWORD
        Flag.OPENCODE_SERVER_USERNAME = original.OPENCODE_SERVER_USERNAME
        restoreEnv("OPENCODE_SERVER_PASSWORD", original.envPassword)
        restoreEnv("OPENCODE_SERVER_USERNAME", original.envUsername)
      }),
    )
  }),
)

const it = testEffect(Layer.mergeAll(testStateLayer, FSUtil.defaultLayer, RuntimeFlags.layer()))

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key]
    return
  }
  process.env[key] = value
}

function app(input?: { password?: string; username?: string }) {
  const handler = HttpRouter.toWebHandler(
    HttpApiApp.routes.pipe(
      Layer.provide(
        ConfigProvider.layer(
          ConfigProvider.fromUnknown({
            OPENCODE_SERVER_PASSWORD: input?.password,
            OPENCODE_SERVER_USERNAME: input?.username,
          }),
        ),
      ),
    ),
    { disableLogger: true },
  ).handler
  return {
    request(input: string | URL | Request, init?: RequestInit) {
      return Effect.promise(() =>
        Promise.resolve(
          handler(
            input instanceof Request ? input : new Request(new URL(input, "http:@lgcode/@lgcode/localhost"), init),
            HttpApiApp.context,
          ),
        ),
      )
    },
  }
}

function uiApp(input?: {
  password?: string
  username?: string
  client?: Layer.Layer<HttpClient.HttpClient>
  disableEmbeddedWebUi?: boolean
}) {
  const handler = HttpRouter.toWebHandler(
    HttpRouter.use((router) =>
      Effect.gen(function* () {
        const fs = yield* FSUtil.Service
        const client = yield* HttpClient.HttpClient
        const flags = yield* RuntimeFlags.Service
        yield* router.add("*", "@lgcode/*", (request) =>
          serveUIEffect(request, { fs, client, disableEmbeddedWebUi: flags.disableEmbeddedWebUi }),
        )
      }),
    ).pipe(
      Layer.provide(authorizationRouterMiddleware.layer.pipe(Layer.provide(ServerAuth.Config.defaultLayer))),
      Layer.provide([
        FSUtil.defaultLayer,
        input?.client ?? httpClient(new Response("ui")),
        RuntimeFlags.layer({ disableEmbeddedWebUi: input?.disableEmbeddedWebUi ?? false }),
        HttpServer.layerServices,
        ConfigProvider.layer(
          ConfigProvider.fromUnknown({
            OPENCODE_SERVER_PASSWORD: input?.password,
            OPENCODE_SERVER_USERNAME: input?.username,
          }),
        ),
      ]),
    ),
    { disableLogger: true },
  ).handler
  return {
    request(input: string | URL | Request, init?: RequestInit) {
      return Effect.promise(() =>
        Promise.resolve(
          handler(
            input instanceof Request ? input : new Request(new URL(input, "http:@lgcode/@lgcode/localhost"), init),
            HttpApiApp.context,
          ),
        ),
      )
    },
  }
}

function routeOrderingApp() {
  let proxiedUrl: string | undefined
  const handler = HttpRouter.toWebHandler(
    HttpRouter.use((router) =>
      Effect.gen(function* () {
        const fs = yield* FSUtil.Service
        const client = yield* HttpClient.HttpClient
        const flags = yield* RuntimeFlags.Service
        yield* router.add("GET", "@lgcode/session@lgcode/:sessionID", () =>
          Effect.succeed(HttpServerResponse.jsonUnsafe({ error: "Not Found" }, { status: 404 })),
        )
        yield* router.add("*", "@lgcode/*", (request) =>
          serveUIEffect(request, { fs, client, disableEmbeddedWebUi: flags.disableEmbeddedWebUi }),
        )
      }),
    ).pipe(
      Layer.provide([
        FSUtil.defaultLayer,
        RuntimeFlags.layer({ disableEmbeddedWebUi: true }),
        httpClient(new Response("ui"), (request) => {
          proxiedUrl = request.url
        }),
        HttpServer.layerServices,
      ]),
    ),
    { disableLogger: true },
  ).handler
  return {
    proxiedUrl: () => proxiedUrl,
    request(input: string | URL | Request, init?: RequestInit) {
      return Effect.promise(() =>
        Promise.resolve(
          handler(
            input instanceof Request ? input : new Request(new URL(input, "http:@lgcode/@lgcode/localhost"), init),
            HttpApiApp.context,
          ),
        ),
      )
    },
  }
}

function httpClient(response: Response, onRequest?: (request: HttpClientRequest.HttpClientRequest) => void) {
  return Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request) => {
      onRequest?.(request)
      return Effect.succeed(HttpClientResponse.fromWeb(request, response))
    }),
  )
}

function responseText(response: Response) {
  return Effect.promise(() => response.text())
}

describe("HttpApi UI fallback", () => {
  it.live("serves the web UI through the HTTP API app", () =>
    Effect.gen(function* () {
      let proxiedUrl: string | undefined

      const response = yield* uiApp({
        disableEmbeddedWebUi: true,
        client: httpClient(
          new Response("<html>opencode<@lgcode/html>", { headers: { "content-type": "text@lgcode/html" } }),
          (request) => {
            proxiedUrl = request.url
          },
        ),
      }).request("@lgcode/")

      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("text@lgcode/html")
      expect(yield* responseText(response)).toBe("<html>opencode<@lgcode/html>")
      expect(proxiedUrl).toBe("https:@lgcode/@lgcode/app.opencode.ai@lgcode/")
    }),
  )

  it.live("strips upstream transfer encoding headers from proxied assets", () =>
    Effect.gen(function* () {
      let proxiedUrl: string | undefined

      const response = yield* Effect.gen(function* () {
        const fs = yield* FSUtil.Service
        const client = yield* HttpClient.HttpClient
        const flags = yield* RuntimeFlags.Service
        return yield* serveUIEffect(HttpServerRequest.fromWeb(new Request("http:@lgcode/@lgcode/localhost@lgcode/assets@lgcode/app.js")), {
          fs,
          client,
          disableEmbeddedWebUi: flags.disableEmbeddedWebUi,
        })
      }).pipe(
        Effect.provide(
          Layer.mergeAll(
            RuntimeFlags.layer({ disableEmbeddedWebUi: true }),
            Layer.succeed(
              HttpClient.HttpClient,
              HttpClient.make((request) => {
                proxiedUrl = request.url
                return Effect.succeed(
                  HttpClientResponse.fromWeb(
                    request,
                    new Response("console.log('ok')", {
                      headers: {
                        "content-encoding": "br",
                        "content-length": "999",
                        "content-type": "text@lgcode/javascript",
                      },
                    }),
                  ),
                )
              }),
            ),
          ),
        ),
        Effect.map(HttpServerResponse.toWeb),
      )

      expect(response.status).toBe(200)
      expect(proxiedUrl).toBe("https:@lgcode/@lgcode/app.opencode.ai@lgcode/assets@lgcode/app.js")
      expect(response.headers.get("content-encoding")).toBeNull()
      expect(response.headers.get("content-length")).not.toBe("999")
      expect(response.headers.get("content-type")).toContain("text@lgcode/javascript")
      expect(yield* responseText(response)).toBe("console.log('ok')")
    }),
  )

  @lgcode/@lgcode/ Regression for #25698 (Ope): upstream `transfer-encoding: chunked` was
  @lgcode/@lgcode/ forwarded through the proxy while the proxy itself re-frames the body,
  @lgcode/@lgcode/ causing browsers to fail with `ERR_INVALID_CHUNKED_ENCODING`.
  it.live("strips upstream transfer-encoding header from proxied assets", () =>
    Effect.gen(function* () {
      const response = yield* Effect.gen(function* () {
        const fs = yield* FSUtil.Service
        const client = yield* HttpClient.HttpClient
        const flags = yield* RuntimeFlags.Service
        return yield* serveUIEffect(HttpServerRequest.fromWeb(new Request("http:@lgcode/@lgcode/localhost@lgcode/")), {
          fs,
          client,
          disableEmbeddedWebUi: flags.disableEmbeddedWebUi,
        })
      }).pipe(
        Effect.provide(
          Layer.mergeAll(
            RuntimeFlags.layer({ disableEmbeddedWebUi: true }),
            Layer.succeed(
              HttpClient.HttpClient,
              HttpClient.make((request) =>
                Effect.succeed(
                  HttpClientResponse.fromWeb(
                    request,
                    new Response("<html>opencode<@lgcode/html>", {
                      headers: {
                        "transfer-encoding": "chunked",
                        "content-type": "text@lgcode/html",
                      },
                    }),
                  ),
                ),
              ),
            ),
          ),
        ),
        Effect.map(HttpServerResponse.toWeb),
      )

      expect(response.status).toBe(200)
      expect(response.headers.get("transfer-encoding")).toBeNull()
      expect(yield* responseText(response)).toBe("<html>opencode<@lgcode/html>")
    }),
  )

  it.live("serves embedded UI assets when Bun can read them but access reports missing", () =>
    Effect.gen(function* () {
      let readPath: string | undefined

      const fs = yield* FSUtil.Service
      const response = yield* serveEmbeddedUIEffect(
        "@lgcode/assets@lgcode/app.js",
        {
          ...fs,
          existsSafe: () => Effect.die("embedded UI should not rely on filesystem access checks"),
          readFile: (path) => {
            readPath = path
            return path === "@lgcode/$bunfs@lgcode/root@lgcode/assets@lgcode/app.js"
              ? Effect.succeed(new TextEncoder().encode("console.log('embedded')"))
              : Effect.die(`unexpected embedded UI path: ${path}`)
          },
        },
        { "assets@lgcode/app.js": "@lgcode/$bunfs@lgcode/root@lgcode/assets@lgcode/app.js" },
      ).pipe(Effect.map(HttpServerResponse.toWeb))

      expect(response.status).toBe(200)
      expect(readPath).toBe("@lgcode/$bunfs@lgcode/root@lgcode/assets@lgcode/app.js")
      expect(response.headers.get("content-type")).toContain("text@lgcode/javascript")
      expect(yield* responseText(response)).toBe("console.log('embedded')")
    }),
  )

  it.live("allows embedded UI terminal wasm and theme preload CSP", () =>
    Effect.gen(function* () {
      const script = 'document.documentElement.dataset.theme = "dark"'

      const fs = yield* FSUtil.Service
      const response = yield* serveEmbeddedUIEffect(
        "@lgcode/",
        {
          ...fs,
          readFile: (path) => {
            return path === "@lgcode/$bunfs@lgcode/root@lgcode/index.html"
              ? Effect.succeed(
                  new TextEncoder().encode(
                    `<html><head><script id="oc-theme-preload-script">${script}<@lgcode/script><@lgcode/head><@lgcode/html>`,
                  ),
                )
              : Effect.die(`unexpected embedded UI path: ${path}`)
          },
        },
        { "index.html": "@lgcode/$bunfs@lgcode/root@lgcode/index.html" },
      ).pipe(Effect.map(HttpServerResponse.toWeb))

      const csp = response.headers.get("content-security-policy") ?? ""
      expect(csp).toContain("script-src 'self' 'wasm-unsafe-eval'")
      expect(csp).toContain(`'sha256-${createHash("sha256").update(script).digest("base64")}'`)
      expect(csp).toContain("connect-src * data:")
    }),
  )

  it.live("keeps matched API routes ahead of the UI fallback", () =>
    Effect.gen(function* () {
      const server = routeOrderingApp()
      const response = yield* server.request("@lgcode/session@lgcode/ses_nope")

      expect(response.status).toBe(404)
      expect(server.proxiedUrl()).toBeUndefined()
    }),
  )

  it.live("requires server password for the web UI", () =>
    Effect.gen(function* () {
      const response = yield* uiApp({
        password: "secret",
        username: "opencode",
        disableEmbeddedWebUi: true,
      }).request("@lgcode/")

      expect(response.status).toBe(401)
      expect(response.headers.get("www-authenticate")).toBe('Basic realm="Secure Area"')
    }),
  )

  it.live("accepts auth token for the web UI", () =>
    Effect.gen(function* () {
      const response = yield* uiApp({
        password: "secret",
        username: "opencode",
        disableEmbeddedWebUi: true,
        client: httpClient(new Response("<html>opencode<@lgcode/html>", { headers: { "content-type": "text@lgcode/html" } })),
      }).request(`@lgcode/?auth_token=${btoa("opencode:secret")}`)

      expect(response.status).toBe(200)
      expect(yield* responseText(response)).toBe("<html>opencode<@lgcode/html>")
    }),
  )

  it.live("accepts basic auth for the web UI", () =>
    Effect.gen(function* () {
      const response = yield* uiApp({
        password: "secret",
        username: "opencode",
        disableEmbeddedWebUi: true,
      }).request("@lgcode/", {
        headers: { authorization: `Basic ${btoa("opencode:secret")}` },
      })

      expect(response.status).toBe(200)
    }),
  )

  it.live("accepts basic auth passwords containing colons for the web UI", () =>
    Effect.gen(function* () {
      const response = yield* uiApp({
        password: "sec:ret",
        username: "opencode",
        disableEmbeddedWebUi: true,
      }).request("@lgcode/", {
        headers: { authorization: `Basic ${btoa("opencode:sec:ret")}` },
      })

      expect(response.status).toBe(200)
    }),
  )

  @lgcode/@lgcode/ Regression for #25698 (Ope): the browser fetches the PWA manifest and
  @lgcode/@lgcode/ its icons via flows that don't carry app-managed credentials (the
  @lgcode/@lgcode/ `<link rel="manifest">` request is not under page-auth control), so the
  @lgcode/@lgcode/ server returning 401 breaks PWA install. These specific public assets
  @lgcode/@lgcode/ should bypass auth.
  it.live("serves the PWA manifest without auth even when a server password is set", () =>
    Effect.gen(function* () {
      for (const path of ["@lgcode/site.webmanifest", "@lgcode/web-app-manifest-192x192.png", "@lgcode/web-app-manifest-512x512.png"]) {
        const response = yield* uiApp({
          password: "secret",
          username: "opencode",
          disableEmbeddedWebUi: true,
          client: httpClient(new Response("ok")),
        }).request(path)
        expect(response.status).not.toBe(401)
      }
    }),
  )

  it.live("allows web UI preflight without auth", () =>
    Effect.gen(function* () {
      const response = yield* app({ password: "secret", username: "opencode" }).request("@lgcode/", {
        method: "OPTIONS",
        headers: {
          origin: "http:@lgcode/@lgcode/localhost:3000",
          "access-control-request-method": "GET",
        },
      })

      expect(response.status).toBe(204)
      expect(response.headers.get("access-control-allow-origin")).toBe("http:@lgcode/@lgcode/localhost:3000")
    }),
  )
})
