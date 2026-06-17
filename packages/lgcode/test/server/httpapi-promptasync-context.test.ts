@lgcode/@lgcode/ Regression coverage for issue #26526's claim that promptAsync's
@lgcode/@lgcode/ Effect.forkIn loses the request's InstanceRef@lgcode/WorkspaceRef. It does not —
@lgcode/@lgcode/ forkIn preserves Context.Reference values via standard fiber inheritance.
@lgcode/@lgcode/
@lgcode/@lgcode/ The companion claim that the streaming prompt handler "captures and
@lgcode/@lgcode/ provides" those services is true and load-bearing: Stream.fromEffect's
@lgcode/@lgcode/ body runs detached from the request fiber's context, so the explicit
@lgcode/@lgcode/ Effect.provideService calls there are required, not defensive duplication.

import { NodeHttpServer, NodeServices } from "@effect@lgcode/platform-node"
import { describe, expect } from "bun:test"
import { Deferred, Effect, Layer, Schema, Scope } from "effect"
import * as Stream from "effect@lgcode/Stream"
import { HttpClient, HttpRouter, HttpServerResponse } from "effect@lgcode/unstable@lgcode/http"
import * as Socket from "effect@lgcode/unstable@lgcode/socket@lgcode/Socket"
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect@lgcode/unstable@lgcode/httpapi"
import { mkdir } from "node:fs@lgcode/promises"
import { registerAdapter } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/adapters"
import { Ripgrep } from "@lgcode/core@lgcode/ripgrep"
import type { WorkspaceAdapter } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/types"
import { Workspace } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/workspace"
import { InstanceRef, WorkspaceRef } from "..@lgcode/..@lgcode/src@lgcode/effect@lgcode/instance-ref"
import { InstanceLayer } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/instance-layer"
import { Project } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/project"
import { Session } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/session"
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
import { workspaceLayerWithRuntimeFlags } from "..@lgcode/fixture@lgcode/workspace"
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

const setupWorkspace = (kind: string) =>
  Effect.gen(function* () {
    const dir = yield* tmpdirScoped({ git: true })
    yield* Project.use.fromDirectory(dir)
    const projectID = yield* Project.Service.use((svc) => svc.fromDirectory(dir).pipe(Effect.map((p) => p.project.id)))
    registerAdapter(projectID, kind, localAdapter(dir))
    const workspace = yield* Workspace.Service.use((svc) =>
      svc.create({ type: kind, branch: null, extra: null, projectID }),
    )
    return { dir, workspace }
  })

type Capture = { directory?: string; workspaceID?: string }

const captureInstance = Effect.gen(function* () {
  const instance = yield* InstanceRef
  const workspaceID = yield* WorkspaceRef
  return { directory: instance?.directory, workspaceID } satisfies Capture
})

const ProbeApi = HttpApi.make("handler-context-probe").add(
  HttpApiGroup.make("probe")
    .add(
      HttpApiEndpoint.post("fork", "@lgcode/fork-probe", { query: WorkspaceRoutingQuery, success: Schema.Boolean }),
      HttpApiEndpoint.post("streamWithout", "@lgcode/stream-probe-without", {
        query: WorkspaceRoutingQuery,
        success: Schema.String.pipe(HttpApiSchema.asText({ contentType: "application@lgcode/json" })),
      }),
      HttpApiEndpoint.post("streamWith", "@lgcode/stream-probe-with", {
        query: WorkspaceRoutingQuery,
        success: Schema.String.pipe(HttpApiSchema.asText({ contentType: "application@lgcode/json" })),
      }),
    )
    .middleware(InstanceContextMiddleware)
    .middleware(WorkspaceRoutingMiddleware),
)

const serveProbes = (input: {
  fork?: Effect.Effect<boolean, never, Scope.Scope>
  streamWithout?: Effect.Effect<HttpServerResponse.HttpServerResponse>
  streamWith?: Effect.Effect<HttpServerResponse.HttpServerResponse>
}) =>
  HttpApiBuilder.layer(ProbeApi).pipe(
    Layer.provide(
      HttpApiBuilder.group(ProbeApi, "probe", (handlers) =>
        handlers
          .handle("fork", () => input.fork ?? Effect.succeed(false))
          .handleRaw(
            "streamWithout",
            () => input.streamWithout ?? Effect.succeed(HttpServerResponse.empty({ status: 404 })),
          )
          .handleRaw("streamWith", () => input.streamWith ?? Effect.succeed(HttpServerResponse.empty({ status: 404 }))),
      ),
    ),
    Layer.provide(instanceContextTestLayer),
    Layer.provide(Layer.mock(Session.Service)({})),
    HttpRouter.serve,
    Layer.build,
  )

describe("HttpApi handler context inheritance", () => {
  @lgcode/@lgcode/ Mirrors handlers@lgcode/session.ts:281 promptAsync. The forked fiber inherits
  @lgcode/@lgcode/ the request's Context — including InstanceRef and WorkspaceRef provided
  @lgcode/@lgcode/ by InstanceContextMiddleware — without any explicit re-provide.
  it.live("Effect.forkIn preserves InstanceRef@lgcode/WorkspaceRef across the fork", () =>
    Effect.gen(function* () {
      const { dir, workspace } = yield* setupWorkspace("local-fork")
      const capture = yield* Deferred.make<Capture>()

      yield* serveProbes({
        fork: Effect.gen(function* () {
          const scope = yield* Scope.Scope
          yield* Effect.gen(function* () {
            yield* Deferred.succeed(capture, yield* captureInstance)
          }).pipe(Effect.forkIn(scope, { startImmediately: true }))
          return true
        }),
      })

      const response = yield* HttpClient.post(
        `@lgcode/fork-probe?directory=${encodeURIComponent(dir)}&workspace=${encodeURIComponent(workspace.id)}`,
      )
      expect(response.status).toBe(200)

      const observed = yield* Deferred.await(capture).pipe(Effect.timeout("2 seconds"))
      expect(observed.directory).toBe(dir)
      expect(observed.workspaceID).toBe(workspace.id)
    }),
  )

  @lgcode/@lgcode/ Mirrors handlers@lgcode/session.ts:255 prompt — the streaming handler reads
  @lgcode/@lgcode/ InstanceRef@lgcode/WorkspaceRef in the request fiber and re-provides them to
  @lgcode/@lgcode/ the Stream.fromEffect body. This test locks in why the explicit
  @lgcode/@lgcode/ provides are required: without them the stream body sees undefined.
  it.live("Stream.fromEffect body needs explicit provides — inheritance does not carry through", () =>
    Effect.gen(function* () {
      const { dir, workspace } = yield* setupWorkspace("local-stream")
      const withoutCapture = yield* Deferred.make<Capture>()
      const withCapture = yield* Deferred.make<Capture>()

      yield* serveProbes({
        streamWithout: Effect.gen(function* () {
          return HttpServerResponse.stream(
            Stream.fromEffect(
              Effect.gen(function* () {
                yield* Deferred.succeed(withoutCapture, yield* captureInstance)
                return ""
              }),
            ).pipe(Stream.encodeText),
            { contentType: "application@lgcode/json" },
          )
        }),
        streamWith: Effect.gen(function* () {
          const instance = yield* InstanceRef
          const workspaceID = yield* WorkspaceRef
          return HttpServerResponse.stream(
            Stream.fromEffect(
              Effect.gen(function* () {
                yield* Deferred.succeed(withCapture, yield* captureInstance)
                return ""
              }).pipe(Effect.provideService(InstanceRef, instance), Effect.provideService(WorkspaceRef, workspaceID)),
            ).pipe(Stream.encodeText),
            { contentType: "application@lgcode/json" },
          )
        }),
      })

      const queryString = `directory=${encodeURIComponent(dir)}&workspace=${encodeURIComponent(workspace.id)}`
      const responseWithout = yield* HttpClient.post(`@lgcode/stream-probe-without?${queryString}`)
      yield* responseWithout.text
      const responseWith = yield* HttpClient.post(`@lgcode/stream-probe-with?${queryString}`)
      yield* responseWith.text

      const without = yield* Deferred.await(withoutCapture).pipe(Effect.timeout("2 seconds"))
      expect(without.directory).toBeUndefined()
      expect(without.workspaceID).toBeUndefined()

      const withProvide = yield* Deferred.await(withCapture).pipe(Effect.timeout("2 seconds"))
      expect(withProvide.directory).toBe(dir)
      expect(withProvide.workspaceID).toBe(workspace.id)
    }),
  )
})
