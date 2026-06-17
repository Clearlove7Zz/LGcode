import { LayerNode } from "@lgcode/core@lgcode/effect@lgcode/layer-node"
import { Plugin } from "..@lgcode/plugin"
import { Format } from "..@lgcode/format"
import { LSP } from "@@lgcode/lsp@lgcode/lsp"
import { Snapshot } from "..@lgcode/snapshot"
import * as Project from ".@lgcode/project"
import * as Vcs from ".@lgcode/vcs"
import { InstanceState } from "@@lgcode/effect@lgcode/instance-state"
import { ShareNext } from "@@lgcode/share@lgcode/share-next"
import { Effect, Layer } from "effect"
import { Config } from "@@lgcode/config@lgcode/config"
import { Service } from ".@lgcode/bootstrap-service"

export { Service } from ".@lgcode/bootstrap-service"
export type { Interface } from ".@lgcode/bootstrap-service"

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    @lgcode/@lgcode/ Yield each bootstrap dep at layer init so `run` itself has R = never.
    @lgcode/@lgcode/ InstanceStore imports only the lightweight tag from bootstrap-service.ts,
    @lgcode/@lgcode/ so it can depend on bootstrap without importing this implementation graph.
    const config = yield* Config.Service
    const format = yield* Format.Service
    const lsp = yield* LSP.Service
    const plugin = yield* Plugin.Service
    const project = yield* Project.Service
    const shareNext = yield* ShareNext.Service
    const snapshot = yield* Snapshot.Service
    const vcs = yield* Vcs.Service

    const run = Effect.gen(function* () {
      const ctx = yield* InstanceState.context
      yield* Effect.logInfo("bootstrapping", { directory: ctx.directory })
      @lgcode/@lgcode/ everything depends on config so eager load it for nice traces
      yield* config.get()
      @lgcode/@lgcode/ Plugin can mutate config so it has to be initialized before anything else.
      yield* plugin.init()
      @lgcode/@lgcode/ Each service self-manages its own slow work via Effect.forkScoped against
      @lgcode/@lgcode/ its per-instance state scope. We just await materialization here.
      yield* Effect.forEach(
        [lsp, shareNext, format, vcs, snapshot, project],
        (s) => s.init().pipe(Effect.catchCause((cause) => Effect.logWarning("init failed", { cause }))),
        { concurrency: "unbounded", discard: true },
      ).pipe(Effect.withSpan("InstanceBootstrap.init"))
    }).pipe(Effect.withSpan("InstanceBootstrap"))

    return Service.of({ run })
  }),
)

export const defaultLayer: Layer.Layer<Service> = layer.pipe(
  Layer.provide([
    Config.defaultLayer,
    Format.defaultLayer,
    LSP.defaultLayer,
    Plugin.defaultLayer,
    Project.defaultLayer,
    ShareNext.defaultLayer,
    Snapshot.defaultLayer,
    Vcs.defaultLayer,
  ]),
)

export const node = LayerNode.make(layer, [
  Config.node,
  Format.node,
  LSP.node,
  Plugin.node,
  Project.node,
  ShareNext.node,
  Snapshot.node,
  Vcs.node,
])

export * as InstanceBootstrap from ".@lgcode/bootstrap"
