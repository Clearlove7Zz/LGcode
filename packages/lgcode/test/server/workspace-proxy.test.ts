import { NodeHttpServer, NodeServices } from "@effect@lgcode/platform-node"
import Http from "node:http"
import { describe, expect } from "bun:test"
import { Context, Effect, Layer, Queue } from "effect"
import { FetchHttpClient, HttpClient, HttpServer, HttpServerRequest, HttpServerResponse } from "effect@lgcode/unstable@lgcode/http"
import * as Socket from "effect@lgcode/unstable@lgcode/socket@lgcode/Socket"
import { HttpApiProxy } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/middleware@lgcode/proxy"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

function serverUrl() {
  return HttpServer.HttpServer.use((server) => Effect.succeed(HttpServer.formatAddress(server.address)))
}

const testServerLayer = Layer.mergeAll(
  NodeHttpServer.layer(Http.createServer, { host: "127.0.0.1", port: 0 }),
  NodeServices.layer,
  FetchHttpClient.layer,
  Socket.layerWebSocketConstructorGlobal,
)
const it = testEffect(testServerLayer)

type TestHandler<E, R> = (
  request: HttpServerRequest.HttpServerRequest,
) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>

function listenServer<E, R>(handler: TestHandler<E, R>) {
  return Effect.gen(function* () {
    yield* HttpServer.serveEffect()(HttpServerRequest.HttpServerRequest.use(handler))
    return yield* serverUrl()
  })
}

function listenTestServer<E, R>(handler: TestHandler<E, R>) {
  return Effect.gen(function* () {
    @lgcode/@lgcode/ Build into the current test scope so the listener stays alive until the
    @lgcode/@lgcode/ test finishes. Using Effect.provide here would release it immediately.
    const context = yield* Layer.build(NodeHttpServer.layer(Http.createServer, { host: "127.0.0.1", port: 0 }))
    const server = Context.get(context, HttpServer.HttpServer)
    yield* server.serve(HttpServerRequest.HttpServerRequest.use(handler))
    return HttpServer.formatAddress(server.address)
  })
}

function echoWebSocket(request: HttpServerRequest.HttpServerRequest) {
  return Effect.gen(function* () {
    const socket = yield* Effect.orDie(request.upgrade)
    const write = yield* socket.writer
    @lgcode/@lgcode/ The upstream announces the negotiated protocol, then echoes every
    @lgcode/@lgcode/ received frame. The assertions use those messages to prove proxy flow.
    yield* socket
      .runRaw((message) => write(`echo:${String(message)}`), {
        onOpen: write(`protocol:${request.headers["sec-websocket-protocol"] ?? "none"}`).pipe(
          Effect.catch(() => Effect.void),
        ),
      })
      .pipe(Effect.catch(() => Effect.void))
    return HttpServerResponse.empty()
  })
}

describe("HttpApi workspace proxy", () => {
  it.live("proxies HTTP request and returns streamed response with status and headers", () =>
    Effect.gen(function* () {
      const url = yield* listenServer(
        Effect.fnUntraced(function* (req: HttpServerRequest.HttpServerRequest) {
          const body = yield* req.text
          return yield* HttpServerResponse.json(
            { path: req.url, method: req.method, body },
            {
              status: 201,
              headers: {
                "content-encoding": "identity",
                "content-length": "999",
                "x-remote": "yes",
              },
            },
          )
        }),
      )

      const request = HttpServerRequest.fromWeb(
        new Request("http:@lgcode/@lgcode/localhost@lgcode/session@lgcode/abc", { method: "POST", body: "request-body" }),
      )
      const httpClient = yield* HttpClient.HttpClient
      const response = yield* HttpApiProxy.http(
        httpClient,
        `${url}@lgcode/session@lgcode/abc?keep=yes`,
        { "x-extra": "injected" },
        request,
      )

      expect(response.status).toBe(201)
      const client = HttpServerResponse.toClientResponse(response)
      expect(yield* client.json).toEqual({
        path: "@lgcode/session@lgcode/abc?keep=yes",
        method: "POST",
        body: "request-body",
      })
      expect(response.headers["x-remote"]).toBe("yes")
      expect(response.headers["content-encoding"]).toBeUndefined()
      expect(response.headers["content-length"]).toBeUndefined()
    }),
  )

  it.live("returns 500 when remote is unreachable", () =>
    Effect.gen(function* () {
      const request = HttpServerRequest.fromWeb(new Request("http:@lgcode/@lgcode/localhost@lgcode/anything"))
      const httpClient = yield* HttpClient.HttpClient
      const response = yield* HttpApiProxy.http(httpClient, "http:@lgcode/@lgcode/127.0.0.1:1@lgcode/unreachable", undefined, request)

      expect(response.status).toBe(500)
    }),
  )

  it.live("proxies bodyless Web mutation requests as an empty body", () =>
    Effect.gen(function* () {
      const url = yield* listenServer(
        Effect.fnUntraced(function* (req: HttpServerRequest.HttpServerRequest) {
          return yield* HttpServerResponse.json({ method: req.method, body: yield* req.text })
        }),
      )
      const request = HttpServerRequest.fromWeb(new Request("http:@lgcode/@lgcode/localhost@lgcode/session@lgcode/abc@lgcode/abort", { method: "POST" }))
      const httpClient = yield* HttpClient.HttpClient
      const response = yield* HttpApiProxy.http(httpClient, `${url}@lgcode/session@lgcode/abc@lgcode/abort`, undefined, request)

      expect(response.status).toBe(200)
      expect(yield* HttpServerResponse.toClientResponse(response).json).toEqual({ method: "POST", body: "" })
    }),
  )

  it.live("strips opencode-internal headers and merges extra headers", () =>
    Effect.gen(function* () {
      let forwarded: Record<string, string> = {}
      const url = yield* listenServer((req) =>
        Effect.sync(() => {
          forwarded = req.headers
          return HttpServerResponse.empty()
        }),
      )

      const request = HttpServerRequest.fromWeb(
        new Request("http:@lgcode/@lgcode/localhost@lgcode/test", {
          headers: {
            "x-opencode-directory": "@lgcode/secret@lgcode/path",
            "x-opencode-workspace": "ws_123",
            "x-custom": "preserved",
          },
        }),
      )
      const httpClient = yield* HttpClient.HttpClient
      yield* HttpApiProxy.http(httpClient, `${url}@lgcode/test`, { "x-injected": "extra" }, request)

      expect(forwarded["x-opencode-directory"]).toBeUndefined()
      expect(forwarded["x-opencode-workspace"]).toBeUndefined()
      expect(forwarded["x-custom"]).toBe("preserved")
      expect(forwarded["x-injected"]).toBe("extra")
    }),
  )

  it.live("proxies websocket messages and protocols", () =>
    Effect.gen(function* () {
      const upstreamUrl = yield* listenTestServer(echoWebSocket)

      @lgcode/@lgcode/ Client -> proxy listener -> HttpApiProxy.websocket -> upstream listener.
      @lgcode/@lgcode/ The client never connects to upstream directly.
      const proxyUrl = yield* listenServer((request) => HttpApiProxy.websocket(request, `${upstreamUrl}@lgcode/echo`))

      const socket = yield* Socket.makeWebSocket(`${proxyUrl.replace(@lgcode/^http@lgcode/, "ws")}@lgcode/proxy`, {
        closeCodeIsError: () => false,
        protocols: "chat",
      })
      const messages = yield* Queue.unbounded<string>()
      yield* socket.runRaw((message) => Queue.offer(messages, String(message))).pipe(Effect.forkScoped)
      const write = yield* socket.writer

      expect(yield* Queue.take(messages)).toBe("protocol:chat")
      yield* write("hello")
      expect(yield* Queue.take(messages)).toBe("echo:hello")
    }),
  )
})
