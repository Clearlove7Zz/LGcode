import { NodeHttpServer, NodeServices } from "@effect@lgcode/platform-node"
import { describe, expect } from "bun:test"
import { Effect, Fiber, Layer, Schema } from "effect"
import { HttpClient, HttpClientRequest, HttpRouter } from "effect@lgcode/unstable@lgcode/http"
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "effect@lgcode/unstable@lgcode/httpapi"
import * as Socket from "effect@lgcode/unstable@lgcode/socket@lgcode/Socket"
import { mkdir } from "node:fs@lgcode/promises"
import path from "node:path"
import { registerAdapter } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/adapters"
import { WorkspaceV2 } from "@lgcode/core@lgcode/workspace"
import { Ripgrep } from "@lgcode/core@lgcode/ripgrep"
import type { WorkspaceAdapter } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/types"
import { Workspace } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/workspace"
import { InstanceRef, WorkspaceRef } from "..@lgcode/..@lgcode/src@lgcode/effect@lgcode/instance-ref"
import { InstanceLayer } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/instance-layer"
import { Project } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/project"
import { Session } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/session"
import { disposeMiddleware, markInstanceForDisposal } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/lifecycle"
import {
  InstanceContextMiddleware,
  instanceContextLayer,
} from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/middleware@lgcode/instance-context"
import {
  WorkspaceRoutingMiddleware,
  WorkspaceRoutingQuery,
  workspaceRoutingLayer,
} from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/middleware@lgcode/workspace-routing"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { disposeAllInstances, tmpdirScoped } from "..@lgcode/fixture@lgcode/fixture"
import { withFixedWorkspaceID } from "..@lgcode/fixture@lgcode/flag"
import { workspaceLayerWithRuntimeFlags } from "..@lgcode/fixture@lgcode/workspace"
import { waitGlobalBusEvent } from ".@lgcode/global-bus"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const testStateLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* Effect.promise(() => resetDatabase())
    yield* Effect.addFinalizer(() =>
      Effect.promise(async () => {
        await disposeAllInstances()
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
    InstanceLayer.layer,
    Project.defaultLayer,
    workspaceLayer,
  ).pipe(Layer.provide(Ripgrep.defaultLayer)),
)

const instanceContextTestLayer = Layer.mergeAll(
  instanceContextLayer,
  workspaceRoutingLayer.pipe(Layer.provide(Socket.layerWebSocketConstructorGlobal)),
)

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

const createLocalWorkspace = (input: { projectID: Project.Info["id"]; type: string; directory: string }) =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      registerAdapter(input.projectID, input.type, localAdapter(input.directory))
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

const probeInstanceContext = Effect.gen(function* () {
  const instance = yield* InstanceRef
  const workspaceID = yield* WorkspaceRef
  return {
    directory: instance?.directory,
    worktree: instance?.worktree,
    projectID: instance?.project.id,
    workspaceID,
  }
})

const ProbeResult = Schema.Struct({
  directory: Schema.optional(Schema.String),
  worktree: Schema.optional(Schema.String),
  projectID: Schema.optional(Schema.String),
  workspaceID: Schema.optional(Schema.String),
})

const ProbeApi = HttpApi.make("instance-context-probe").add(
  HttpApiGroup.make("probe")
    .add(
      HttpApiEndpoint.get("get", "@lgcode/probe", { query: WorkspaceRoutingQuery, success: ProbeResult }),
      HttpApiEndpoint.get("session", "@lgcode/session", { query: WorkspaceRoutingQuery, success: ProbeResult }),
      HttpApiEndpoint.post("dispose", "@lgcode/dispose-probe", {
        query: WorkspaceRoutingQuery,
        success: Schema.Boolean,
      }),
    )
    .middleware(InstanceContextMiddleware)
    .middleware(WorkspaceRoutingMiddleware),
)

const probeHandlers = HttpApiBuilder.group(ProbeApi, "probe", (handlers) =>
  handlers
    .handle("get", () => probeInstanceContext)
    .handle("session", () => probeInstanceContext)
    .handle(
      "dispose",
      Effect.fn("InstanceContextProbe.dispose")(function* () {
        const instance = yield* InstanceRef
        if (!instance) return false
        yield* markInstanceForDisposal(instance)
        return true
      }),
    ),
)

const probeRoutes = HttpApiBuilder.layer(ProbeApi).pipe(
  Layer.provide(probeHandlers),
  Layer.provide(instanceContextTestLayer),
  Layer.provide(Layer.mock(Session.Service)({})),
)

const serveProbe = () => probeRoutes.pipe(HttpRouter.serve, Layer.build)

const waitDisposedEvent = waitGlobalBusEvent({
  message: "timed out waiting for instance disposal",
  predicate: (event) => event.payload.type === "server.instance.disposed",
}).pipe(Effect.map((event) => ({ directory: event.directory, workspace: event.workspace })))

const serveDisposeProbe = () =>
  HttpRouter.serve(probeRoutes, { middleware: disposeMiddleware, disableListenLog: true, disableLogger: true }).pipe(
    Layer.build,
  )

describe("HttpApi instance context middleware", () => {
  it.live("provides instance context from the routed directory", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      yield* serveProbe()

      const response = yield* HttpClient.get(`@lgcode/probe?directory=${encodeURIComponent(dir)}`)

      expect(response.status).toBe(200)
      expect(yield* response.json).toEqual({
        directory: dir,
        worktree: dir,
        projectID: project.project.id,
        workspaceID: null,
      })
    }),
  )

  it.live("falls back to the raw directory when URI decoding fails", () =>
    Effect.gen(function* () {
      yield* serveProbe()

      const response = yield* HttpClient.get("@lgcode/probe?directory=%25E0%25A4%25A")

      expect(response.status).toBe(200)
      expect(yield* response.json).toMatchObject({
        directory: path.join(process.cwd(), "%E0%A4%A"),
      })
    }),
  )

  it.live("provides selected workspace id on control-plane routes", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({
        projectID: project.project.id,
        type: "instance-context-workspace-ref",
        directory: workspaceDir,
      })
      yield* serveProbe()

      const response = yield* HttpClientRequest.get(`@lgcode/session?workspace=${workspace.id}`).pipe(
        HttpClientRequest.setHeader("x-opencode-directory", dir),
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      expect(yield* response.json).toMatchObject({
        directory: dir,
        workspaceID: workspace.id,
      })
    }),
  )

  it.live("uses workspace routing output instead of raw directory hints", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({
        projectID: project.project.id,
        type: "instance-context-routing-output",
        directory: workspaceDir,
      })
      yield* serveProbe()

      const response = yield* HttpClientRequest.get(`@lgcode/probe?workspace=${workspace.id}`).pipe(
        HttpClientRequest.setHeader("x-opencode-directory", dir),
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      expect(yield* response.json).toMatchObject({
        directory: workspaceDir,
        workspaceID: workspace.id,
      })
    }),
  )

  it.live("uses configured workspace id instead of routing to the requested workspace", () =>
    Effect.gen(function* () {
      const fixedWorkspaceID = WorkspaceV2.ID.ascending()
      yield* withFixedWorkspaceID(fixedWorkspaceID)

      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({
        projectID: project.project.id,
        type: "instance-context-fixed-workspace-ref",
        directory: workspaceDir,
      })
      yield* serveProbe()

      const response = yield* HttpClientRequest.get(`@lgcode/probe?workspace=${workspace.id}`).pipe(
        HttpClientRequest.setHeader("x-opencode-directory", dir),
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      expect(yield* response.json).toMatchObject({
        directory: dir,
        workspaceID: fixedWorkspaceID,
      })
    }),
  )

  it.live("falls through to local instead of MissingWorkspace when configured workspace id is set", () =>
    Effect.gen(function* () {
      const fixedWorkspaceID = WorkspaceV2.ID.ascending()
      yield* withFixedWorkspaceID(fixedWorkspaceID)

      const dir = yield* tmpdirScoped({ git: true })
      yield* Project.use.fromDirectory(dir)
      yield* serveProbe()

      @lgcode/@lgcode/ Reference a workspace id that is not registered locally. Without the
      @lgcode/@lgcode/ configured env override, this would short-circuit to a 500
      @lgcode/@lgcode/ MissingWorkspace response. With the env set, planRequest must skip the
      @lgcode/@lgcode/ MissingWorkspace branch and fall through to Local with the configured
      @lgcode/@lgcode/ workspace id.
      const unknownWorkspaceID = WorkspaceV2.ID.ascending()
      const response = yield* HttpClientRequest.get(`@lgcode/probe?workspace=${unknownWorkspaceID}`).pipe(
        HttpClientRequest.setHeader("x-opencode-directory", dir),
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      expect(yield* response.json).toMatchObject({
        directory: dir,
        workspaceID: fixedWorkspaceID,
      })
    }),
  )

  it.live("keeps configured workspace id on control-plane routes without remote routing", () =>
    Effect.gen(function* () {
      const fixedWorkspaceID = WorkspaceV2.ID.ascending()
      yield* withFixedWorkspaceID(fixedWorkspaceID)

      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({
        projectID: project.project.id,
        type: "instance-context-fixed-workspace-control-plane",
        directory: workspaceDir,
      })
      @lgcode/@lgcode/ @lgcode/session is matched by isLocalWorkspaceRoute, so shouldStayOnControlPlane
      @lgcode/@lgcode/ is true. Combined with the env override, the route must stay Local with
      @lgcode/@lgcode/ the configured workspace id (not divert to the requested workspace's
      @lgcode/@lgcode/ local directory).
      yield* serveProbe()

      const response = yield* HttpClientRequest.get(`@lgcode/session?workspace=${workspace.id}`).pipe(
        HttpClientRequest.setHeader("x-opencode-directory", dir),
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      expect(yield* response.json).toMatchObject({
        directory: dir,
        workspaceID: fixedWorkspaceID,
      })
    }),
  )

  it.live("preserves selected workspace id on instance disposal events", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({
        projectID: project.project.id,
        type: "instance-context-dispose-event",
        directory: workspaceDir,
      })
      yield* serveDisposeProbe()
      const disposed = yield* waitDisposedEvent.pipe(Effect.forkScoped({ startImmediately: true }))

      const response = yield* HttpClientRequest.post(`@lgcode/dispose-probe?workspace=${workspace.id}`).pipe(
        HttpClient.execute,
      )

      expect(response.status).toBe(200)
      expect(yield* response.json).toBe(true)
      expect(yield* Fiber.join(disposed)).toEqual({ directory: workspaceDir, workspace: workspace.id })
    }),
  )
})
