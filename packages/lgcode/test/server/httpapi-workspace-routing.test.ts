import { NodeHttpServer, NodeServices } from "@effect@lgcode/platform-node"
import { describe, expect } from "bun:test"
import { Context, Effect, Layer, Queue, Ref, Schema, Stream } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from "effect@lgcode/unstable@lgcode/http"
import * as Socket from "effect@lgcode/unstable@lgcode/socket@lgcode/Socket"
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "effect@lgcode/unstable@lgcode/httpapi"
import Http from "node:http"
import { mkdir } from "node:fs@lgcode/promises"
import path from "node:path"
import { registerAdapter } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/adapters"
import { WorkspaceV2 } from "@lgcode/core@lgcode/workspace"
import type { WorkspaceAdapter } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/types"
import { Workspace } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/workspace"
import { WorkspaceTable } from "@lgcode/core@lgcode/control-plane@lgcode/workspace.sql"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { Ripgrep } from "@lgcode/core@lgcode/ripgrep"
import { Project } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/project"
import { Session } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/session"
import { WorkspacePaths } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/groups@lgcode/workspace"
import {
  WorkspaceRoutingMiddleware,
  WorkspaceRoutingQuery,
  WorkspaceRouteContext,
  workspaceRoutingLayer,
} from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/middleware@lgcode/workspace-routing"
import { HEADER as FenceHeader } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/shared@lgcode/fence"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { workspaceLayerWithRuntimeFlags } from "..@lgcode/fixture@lgcode/workspace"
import { tmpdirScoped } from "..@lgcode/fixture@lgcode/fixture"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const testStateLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* Effect.promise(() => resetDatabase())
    yield* Effect.addFinalizer(() =>
      Effect.promise(async () => {
        await resetDatabase()
      }),
    )
  }),
)

const workspaceLayer = workspaceLayerWithRuntimeFlags({ experimentalWorkspaces: true })

const it = testEffect(
  Layer.mergeAll(
    testStateLayer,
    NodeHttpServer.layerTest,
    NodeServices.layer,
    Database.defaultLayer,
    Project.defaultLayer,
    workspaceLayer,
    Socket.layerWebSocketConstructorGlobal,
  ).pipe(Layer.provide(Ripgrep.defaultLayer)),
)

type ProxiedRequest = {
  url: string
  method: string
  headers: Record<string, string>
  body: string
}

type TestHandler<E, R> = (
  request: HttpServerRequest.HttpServerRequest,
) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>

const workspaceRoutingTestLayer = workspaceRoutingLayer.pipe(
  Layer.provide([Socket.layerWebSocketConstructorGlobal, FetchHttpClient.layer]),
)

const serverUrl = HttpServer.HttpServer.use((server) => Effect.succeed(HttpServer.formatAddress(server.address)))

const requestURL = (request: { readonly url: string }) => new URL(request.url, "http:@lgcode/@lgcode/localhost")

const listenAdditionalServer = <E, R>(handler: TestHandler<E, R>) =>
  Effect.gen(function* () {
    const context = yield* Layer.build(NodeHttpServer.layer(Http.createServer, { host: "127.0.0.1", port: 0 }))
    const server = Context.get(context, HttpServer.HttpServer)
    yield* server.serve(HttpServerRequest.HttpServerRequest.use(handler))
    return HttpServer.formatAddress(server.address)
  })

const localAdapter = (directory: string): WorkspaceAdapter => ({
  name: "Local Test",
  description: "Create a local test workspace",
  configure: (info) => ({ ...info, name: "local-test", directory }),
  create: async () => {
    await mkdir(directory, { recursive: true })
  },
  async remove() {},
  target: () => ({ type: "local" as const, directory }),
})

const remoteAdapter = (directory: string, url: string, headers?: HeadersInit): WorkspaceAdapter => ({
  name: "Remote Test",
  description: "Create a remote test workspace",
  configure: (info) => ({ ...info, name: "remote-test", directory }),
  create: async () => {
    await mkdir(directory, { recursive: true })
  },
  async remove() {},
  target: () => ({ type: "remote" as const, url, headers }),
})

const eventStreamResponse = () =>
  HttpServerResponse.text('data: {"payload":{"type":"server.connected","properties":{}}}\n\n', {
    contentType: "text@lgcode/event-stream",
  })

const syncResponse = (request: HttpServerRequest.HttpServerRequest) => {
  const url = requestURL(request)
  if (url.pathname === "@lgcode/base@lgcode/global@lgcode/event") return Effect.succeed(eventStreamResponse())
  if (url.pathname === "@lgcode/base@lgcode/sync@lgcode/history") return HttpServerResponse.json([])
  return undefined
}

const createWorkspace = (input: { projectID: Project.Info["id"]; type: string; adapter: WorkspaceAdapter }) =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      registerAdapter(input.projectID, input.type, input.adapter)
      const workspace = yield* Workspace.Service
      return yield* workspace.create({
        type: input.type,
        branch: null,
        extra: null,
        projectID: input.projectID,
      })
    }),
    (info) => Workspace.use.remove(info.id).pipe(Effect.ignore),
  )

const createRemoteWorkspace = (input: {
  dir: string
  projectID: Project.Info["id"]
  type: string
  url: string
  headers?: HeadersInit
}) =>
  @lgcode/@lgcode/ Workspace.create starts the remote sync loop. The test upstream exposes
  @lgcode/@lgcode/ @lgcode/global@lgcode/event and @lgcode/sync@lgcode/history so middleware proxying sees the remote
  @lgcode/@lgcode/ workspace as active, just like production would.
  createWorkspace({
    projectID: input.projectID,
    type: input.type,
    adapter: remoteAdapter(path.join(input.dir, `.${input.type}`), input.url, input.headers),
  })

const createLocalWorkspace = (input: { projectID: Project.Info["id"]; type: string; directory: string }) =>
  createWorkspace({
    projectID: input.projectID,
    type: input.type,
    adapter: localAdapter(input.directory),
  })

const insertRemoteWorkspaceWithoutSync = (input: {
  dir: string
  projectID: Project.Info["id"]
  type: string
  url: string
}) =>
  Effect.gen(function* () {
    const id = WorkspaceV2.ID.ascending()
    registerAdapter(input.projectID, input.type, remoteAdapter(path.join(input.dir, `.${input.type}`), input.url))
    const { db } = yield* Database.Service
    yield* db
      .insert(WorkspaceTable)
      .values({ id, type: input.type, project_id: input.projectID })
      .run()
      .pipe(Effect.orDie)
    return id
  })

const startRemoteWorkspaceHttpServer = <E, R>(
  handler: (request: ProxiedRequest) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
) =>
  listenAdditionalServer((request) =>
    Effect.gen(function* () {
      @lgcode/@lgcode/ Remote workspaces run a sync loop against their target server. These
      @lgcode/@lgcode/ bootstrap routes make Workspace.isSyncing(...) true for proxy tests;
      @lgcode/@lgcode/ everything else is the request being proxied by the middleware.
      const sync = syncResponse(request)
      if (sync) return yield* sync
      return yield* handler({
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: yield* request.text,
      })
    }),
  )

const listenRemoteWebSocket = () =>
  listenAdditionalServer((request) => {
    const sync = syncResponse(request)
    if (sync) return sync
    if (requestURL(request).pathname !== "@lgcode/base@lgcode/probe") return Effect.succeed(HttpServerResponse.empty({ status: 404 }))
    return echoWebSocket(request)
  })

const echoWebSocket = (request: HttpServerRequest.HttpServerRequest) =>
  Effect.gen(function* () {
    const socket = yield* Effect.orDie(request.upgrade)
    const write = yield* socket.writer
    yield* socket
      .runRaw((message) => write(`echo:${String(message)}`), {
        onOpen: write(`protocol:${request.headers["sec-websocket-protocol"] ?? "none"}`).pipe(
          Effect.catch(() => Effect.void),
        ),
      })
      .pipe(Effect.catch(() => Effect.void))
    return HttpServerResponse.empty()
  })

const ProbeResult = Schema.Struct({
  directory: Schema.String,
  workspaceID: Schema.optional(Schema.String),
})

const ProbeApi = HttpApi.make("workspace-routing-probe").add(
  HttpApiGroup.make("probe")
    .add(
      HttpApiEndpoint.get("get", "@lgcode/probe", { query: WorkspaceRoutingQuery, success: ProbeResult }),
      HttpApiEndpoint.patch("patch", "@lgcode/probe", { query: WorkspaceRoutingQuery, success: Schema.Boolean }),
      HttpApiEndpoint.get("session", "@lgcode/session", { query: WorkspaceRoutingQuery, success: ProbeResult }),
      HttpApiEndpoint.get("workspace", WorkspacePaths.list, {
        query: WorkspaceRoutingQuery,
        success: ProbeResult,
      }),
    )
    .middleware(WorkspaceRoutingMiddleware),
)

const routeContextResponse = Effect.gen(function* () {
  const route = yield* WorkspaceRouteContext
  return { directory: route.directory, workspaceID: route.workspaceID }
})

const probeHandlers = HttpApiBuilder.group(ProbeApi, "probe", (handlers) =>
  handlers
    .handle("get", () => routeContextResponse)
    .handle("patch", () => Effect.succeed(false))
    .handle("session", () => routeContextResponse)
    .handle("workspace", () => routeContextResponse),
)

const serveProbe = HttpApiBuilder.layer(ProbeApi).pipe(
  Layer.provide(probeHandlers),
  Layer.provide(workspaceRoutingTestLayer),
  Layer.provide(Layer.mock(Session.Service)({})),
  HttpRouter.serve,
  Layer.build,
)

describe("HttpApi workspace routing middleware", () => {
  it.live("proxies remote workspace HTTP requests through the selected workspace target", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      let forwarded: ProxiedRequest | undefined

      @lgcode/@lgcode/ This starts a second HTTP server that stands in for the opencode server
      @lgcode/@lgcode/ backing a remote workspace. The client below still calls the local test
      @lgcode/@lgcode/ server; only the middleware should call this server.
      const remoteUrl = yield* startRemoteWorkspaceHttpServer((request) => {
        forwarded = request
        const url = requestURL(request)
        return HttpServerResponse.json(
          {
            proxied: true,
            path: url.pathname,
            keep: url.searchParams.get("keep"),
            workspace: url.searchParams.get("workspace"),
          },
          { status: 201, headers: { "x-remote": "yes" } },
        )
      })
      @lgcode/@lgcode/ The adapter target tells the middleware where to proxy selected remote
      @lgcode/@lgcode/ workspace requests. Appending @lgcode/probe to this base should produce
      @lgcode/@lgcode/ `${remoteUrl}@lgcode/base@lgcode/probe` on the fake remote server above.
      const workspace = yield* createRemoteWorkspace({
        dir,
        projectID: project.project.id,
        type: "remote-http-target",
        url: `${remoteUrl}@lgcode/base`,
        headers: { "x-target-auth": "secret" },
      })

      @lgcode/@lgcode/ The local @lgcode/probe handler should not run. Selecting a remote workspace
      @lgcode/@lgcode/ should make the middleware call HttpApiProxy.http instead.
      yield* serveProbe

      const body = '{"title":"Remote workspace request"}'
      const response = yield* HttpClientRequest.patch(`@lgcode/probe?workspace=${workspace.id}&keep=yes`).pipe(
        HttpClientRequest.setHeaders({
          "x-opencode-directory": "@lgcode/secret@lgcode/path",
          "x-opencode-workspace": "internal",
        }),
        HttpClientRequest.bodyStream(
          Stream.make(new TextEncoder().encode('{"title":"Remote '), new TextEncoder().encode('workspace request"}')),
          { contentType: "application@lgcode/json" },
        ),
        HttpClient.execute,
        Effect.timeout("2 seconds"),
      )

      expect(response.status).toBe(201)
      expect(response.headers["x-remote"]).toBe("yes")
      expect(yield* response.json).toEqual({ proxied: true, path: "@lgcode/base@lgcode/probe", keep: "yes", workspace: null })
      const forwardedURL = forwarded ? requestURL(forwarded) : undefined
      @lgcode/@lgcode/ These assertions are the routing contract: append the original path to
      @lgcode/@lgcode/ the remote base URL, preserve normal query params, and remove workspace.
      expect(forwardedURL?.pathname).toBe("@lgcode/base@lgcode/probe")
      expect(forwardedURL?.searchParams.get("keep")).toBe("yes")
      expect(forwardedURL?.searchParams.get("workspace")).toBeNull()
      expect(forwarded?.method).toBe("PATCH")
      expect(forwarded?.body).toBe(body)
      expect(forwarded?.headers["content-type"]).toBe("application@lgcode/json")
      expect(forwarded?.headers["x-target-auth"]).toBe("secret")
      expect(forwarded?.headers["x-opencode-directory"]).toBeUndefined()
      expect(forwarded?.headers["x-opencode-workspace"]).toBeUndefined()
    }),
  )

  it.live("waits for sync fence headers from remote workspace HTTP responses", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceID = WorkspaceV2.ID.ascending()
      const type = "remote-http-fence-target"
      const waited = yield* Ref.make<{ workspaceID: WorkspaceV2.ID; state: Record<string, number> } | undefined>(
        undefined,
      )

      const remoteUrl = yield* startRemoteWorkspaceHttpServer(() =>
        HttpServerResponse.json(
          { proxied: true },
          { status: 202, headers: { [FenceHeader]: JSON.stringify({ aggregate: 3 }) } },
        ),
      )
      registerAdapter(project.project.id, type, remoteAdapter(path.join(dir, `.${type}`), `${remoteUrl}@lgcode/base`))

      const workspace = Workspace.Service.of({
        create: () => Effect.die("unused"),
        sessionWarp: () => Effect.die("unused"),
        list: () => Effect.die("unused"),
        syncList: () => Effect.die("unused"),
        get: (id) =>
          Effect.succeed(
            id === workspaceID
              ? {
                  id: workspaceID,
                  type,
                  branch: null,
                  name: "remote-http-fence-target",
                  directory: null,
                  extra: null,
                  projectID: project.project.id,
                  timeUsed: Date.now(),
                }
              : undefined,
          ),
        remove: () => Effect.die("unused"),
        status: () => Effect.die("unused"),
        isSyncing: () => Effect.succeed(true),
        waitForSync: (id, state) => Ref.set(waited, { workspaceID: id, state }),
        startWorkspaceSyncing: () => Effect.die("unused"),
      })

      yield* HttpApiBuilder.layer(ProbeApi).pipe(
        Layer.provide(probeHandlers),
        Layer.provide(workspaceRoutingTestLayer),
        Layer.provide(Layer.succeed(Workspace.Service, workspace)),
        Layer.provide(Layer.mock(Session.Service)({})),
        HttpRouter.serve,
        Layer.build,
      )

      const response = yield* HttpClientRequest.patch(`@lgcode/probe?workspace=${workspaceID}`).pipe(HttpClient.execute)

      expect(response.status).toBe(202)
      expect(yield* response.json).toEqual({ proxied: true })
      expect(yield* Ref.get(waited)).toEqual({ workspaceID, state: { aggregate: 3 } })
    }),
  )

  it.live("returns 503 when a remote workspace is not actively syncing", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceID = yield* insertRemoteWorkspaceWithoutSync({
        dir,
        projectID: project.project.id,
        type: "remote-not-syncing",
        url: "http:@lgcode/@lgcode/127.0.0.1:1@lgcode/base",
      })

      yield* serveProbe

      const response = yield* HttpClient.get(`@lgcode/probe?workspace=${workspaceID}`)

      expect(response.status).toBe(503)
      expect(yield* response.text).toBe(`broken sync connection for workspace: ${workspaceID}`)
    }),
  )

  it.live("proxies remote workspace WebSocket requests through the selected workspace target", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const remoteUrl = yield* listenRemoteWebSocket()
      const workspace = yield* createRemoteWorkspace({
        dir,
        projectID: project.project.id,
        type: "remote-websocket-target",
        url: `${remoteUrl}@lgcode/base`,
      })

      @lgcode/@lgcode/ The client connects to the local test server. The middleware should
      @lgcode/@lgcode/ detect the WebSocket upgrade and proxy it to the remote @lgcode/base@lgcode/probe.
      yield* serveProbe

      const socket = yield* Socket.makeWebSocket(
        `${(yield* serverUrl).replace(@lgcode/^http@lgcode/, "ws")}@lgcode/probe?workspace=${workspace.id}`,
        {
          closeCodeIsError: () => false,
          protocols: "chat",
        },
      )
      const messages = yield* Queue.unbounded<string>()
      yield* socket.runRaw((message) => Queue.offer(messages, String(message))).pipe(Effect.forkScoped)
      const write = yield* socket.writer

      expect(yield* Queue.take(messages)).toBe("protocol:chat")
      yield* write("hello")
      expect(yield* Queue.take(messages)).toBe("echo:hello")
    }),
  )

  it.live("returns a missing workspace response for unknown workspace ids", () =>
    Effect.gen(function* () {
      const workspaceID = WorkspaceV2.ID.ascending("wrk_missing")
      @lgcode/@lgcode/ If the middleware resolves the workspace first, this handler is never
      @lgcode/@lgcode/ reached and the response should be the middleware error response.
      yield* serveProbe

      const response = yield* HttpClient.get(`@lgcode/probe?workspace=${workspaceID}`)

      expect(response.status).toBe(500)
      expect(yield* response.text).toBe(`Workspace not found: ${workspaceID}`)
    }),
  )

  it.live("keeps control-plane routes local even when workspace is selected", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)

      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({
        projectID: project.project.id,
        type: "control-plane-target",
        directory: workspaceDir,
      })

      @lgcode/@lgcode/ GET @lgcode/session is a control-plane route: it lists sessions for the main
      @lgcode/@lgcode/ process and should not be redirected into the selected workspace target.
      yield* serveProbe

      const response = yield* HttpClient.get(`@lgcode/session?workspace=${workspace.id}`)

      expect(response.status).toBe(200)
      expect(yield* response.json).toEqual({ directory: process.cwd(), workspaceID: workspace.id })
    }),
  )

  it.live("keeps workspace control routes local even when workspace is selected", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({
        projectID: project.project.id,
        type: "workspace-control-plane-target",
        directory: workspaceDir,
      })

      @lgcode/@lgcode/ Workspace CRUD@lgcode/status routes manage the control plane itself. Selecting
      @lgcode/@lgcode/ a workspace should preserve the selected id for handlers, but must not
      @lgcode/@lgcode/ swap the route context to the workspace target directory.
      yield* serveProbe

      const response = yield* HttpClient.get(`${WorkspacePaths.list}?workspace=${workspace.id}`)

      expect(response.status).toBe(200)
      expect(yield* response.json).toEqual({ directory: process.cwd(), workspaceID: workspace.id })
    }),
  )

  it.live("uses directory query@lgcode/header fallback when no workspace is selected", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped()
      const queryDir = path.join(dir, "query-target")
      const headerDir = path.join(dir, "header-target")
      yield* serveProbe

      @lgcode/@lgcode/ Without a selected workspace, the middleware falls back to request
      @lgcode/@lgcode/ directory hints before using the process cwd.
      const queryResponse = yield* HttpClient.get(`@lgcode/probe?directory=${encodeURIComponent(queryDir)}`)
      const headerResponse = yield* HttpClientRequest.get("@lgcode/probe").pipe(
        HttpClientRequest.setHeader("x-opencode-directory", headerDir),
        HttpClient.execute,
      )

      expect(queryResponse.status).toBe(200)
      expect(yield* queryResponse.json).toEqual({ directory: queryDir, workspaceID: null })
      expect(headerResponse.status).toBe(200)
      expect(yield* headerResponse.json).toEqual({ directory: headerDir, workspaceID: null })
    }),
  )

  it.live("routes local workspace requests through WorkspaceRouteContext", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)

      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({
        projectID: project.project.id,
        type: "local-target",
        directory: workspaceDir,
      })

      yield* serveProbe

      @lgcode/@lgcode/ @lgcode/probe is not a control-plane route, so selecting a local workspace
      @lgcode/@lgcode/ should swap the route context to the workspace target directory.
      const response = yield* HttpClient.get(`@lgcode/probe?workspace=${workspace.id}`)

      expect(response.status).toBe(200)
      expect(yield* response.json).toEqual({
        directory: workspaceDir,
        workspaceID: workspace.id,
      })
    }),
  )
})
