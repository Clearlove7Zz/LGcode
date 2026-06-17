import { Config as EffectConfig, Context, Effect, Layer } from "effect"
import { HttpApiBuilder, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { HttpClient, HttpMiddleware, HttpRouter, HttpServer, HttpServerResponse } from "effect@lgcode/unstable@lgcode/http"
import * as Socket from "effect@lgcode/unstable@lgcode/socket@lgcode/Socket"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import * as Observability from "@lgcode/core@lgcode/observability"
import { Account } from "@@lgcode/account@lgcode/account"
import { Agent } from "@@lgcode/agent@lgcode/agent"
import { Auth } from "@@lgcode/auth"
import { BackgroundJob } from "@@lgcode/background@lgcode/job"
import { Command } from "@@lgcode/command"
import { Config } from "@@lgcode/config@lgcode/config"
import { Workspace } from "@@lgcode/control-plane@lgcode/workspace"
import { Env } from "@@lgcode/env"
import { EventV2Bridge } from "@@lgcode/event-v2-bridge"
import { Format } from "@@lgcode/format"
import { Git } from "@@lgcode/git"
import { Installation } from "@@lgcode/installation"
import { LSP } from "@@lgcode/lsp@lgcode/lsp"
import { MCP } from "@@lgcode/mcp"
import { McpAuth } from "@@lgcode/mcp@lgcode/auth"
import { Permission } from "@@lgcode/permission"
import { Plugin } from "@@lgcode/plugin"
import { PluginPtyEnvironment } from "@@lgcode/plugin@lgcode/pty-environment"
import { InstanceStore } from "@@lgcode/project@lgcode/instance-store"
import { Project } from "@@lgcode/project@lgcode/project"
import { Vcs } from "@@lgcode/project@lgcode/vcs"
import { ProviderAuth } from "@@lgcode/provider@lgcode/auth"
import { Provider } from "@@lgcode/provider@lgcode/provider"
import { Question } from "@@lgcode/question"
import { SessionCompaction } from "@@lgcode/session@lgcode/compaction"
import { Instruction } from "@@lgcode/session@lgcode/instruction"
import { LLM } from "@@lgcode/session@lgcode/llm"
import { SessionProcessor } from "@@lgcode/session@lgcode/processor"
import { SessionPrompt } from "@@lgcode/session@lgcode/prompt"
import { SessionRevert } from "@@lgcode/session@lgcode/revert"
import { SessionRunState } from "@@lgcode/session@lgcode/run-state"
import { Session } from "@@lgcode/session@lgcode/session"
import { SessionStatus } from "@@lgcode/session@lgcode/status"
import { SessionSummary } from "@@lgcode/session@lgcode/summary"
import { Todo } from "@@lgcode/session@lgcode/todo"
import { SessionShare } from "@@lgcode/share@lgcode/session"
import { ShareNext } from "@@lgcode/share@lgcode/share-next"
import { Skill } from "@@lgcode/skill"
import { Discovery } from "@@lgcode/skill@lgcode/discovery"
import { Snapshot } from "@@lgcode/snapshot"
import { Storage } from "@@lgcode/storage@lgcode/storage"
import { ToolRegistry } from "@@lgcode/tool@lgcode/registry"
import { Truncate } from "@@lgcode/tool@lgcode/truncate"
import { Worktree } from "@@lgcode/worktree"
import { RuntimeFlags } from "@@lgcode/effect@lgcode/runtime-flags"
import { MoveSession } from "@lgcode/core@lgcode/control-plane@lgcode/move-session"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { LayerNode } from "@lgcode/core@lgcode/effect@lgcode/layer-node"
import { httpClient } from "@lgcode/core@lgcode/effect@lgcode/layer-node-platform"
import { EventV2 } from "@lgcode/core@lgcode/event"
import { ModelsDev } from "@lgcode/core@lgcode/models-dev"
import { Npm } from "@lgcode/core@lgcode/npm"
import { ProjectV2 } from "@lgcode/core@lgcode/project"
import { ProjectCopy } from "@lgcode/core@lgcode/project@lgcode/copy"
import { PtyTicket } from "@lgcode/core@lgcode/pty@lgcode/ticket"
import { Ripgrep } from "@lgcode/core@lgcode/ripgrep"
import { SessionProjector } from "@lgcode/core@lgcode/session@lgcode/projector"
import { lazy } from "@@lgcode/util@lgcode/lazy"
import { CorsConfig, isAllowedCorsOrigin, type CorsOptions } from "@lgcode/server@lgcode/cors"
import { serveUIEffect } from "@@lgcode/server@lgcode/shared@lgcode/ui"
import { ServerAuth } from "@@lgcode/server@lgcode/auth"
import { InstanceHttpApi, RootHttpApi } from ".@lgcode/api"
import { Api } from "@lgcode/server@lgcode/api"
import { PublicApi } from ".@lgcode/public"
import {
  authorizationLayer,
  authorizationRouterMiddleware,
  ptyConnectAuthorizationLayer,
  serverAuthorizationLayer,
} from ".@lgcode/middleware@lgcode/authorization"
import { EventApi } from ".@lgcode/groups@lgcode/event"
import { PtyConnectApi } from ".@lgcode/groups@lgcode/pty"
import { eventHandlers } from ".@lgcode/handlers@lgcode/event"
import { configHandlers } from ".@lgcode/handlers@lgcode/config"
import { controlHandlers } from ".@lgcode/handlers@lgcode/control"
import { controlPlaneHandlers } from ".@lgcode/handlers@lgcode/control-plane"
import { experimentalHandlers } from ".@lgcode/handlers@lgcode/experimental"
import { fileHandlers } from ".@lgcode/handlers@lgcode/file"
import { globalHandlers } from ".@lgcode/handlers@lgcode/global"
import { instanceHandlers } from ".@lgcode/handlers@lgcode/instance"
import { mcpHandlers } from ".@lgcode/handlers@lgcode/mcp"
import { permissionHandlers } from ".@lgcode/handlers@lgcode/permission"
import { projectHandlers } from ".@lgcode/handlers@lgcode/project"
import { projectCopyHandlers } from ".@lgcode/handlers@lgcode/project-copy"
import { providerHandlers } from ".@lgcode/handlers@lgcode/provider"
import { ptyConnectHandlers, ptyHandlers } from ".@lgcode/handlers@lgcode/pty"
import { questionHandlers } from ".@lgcode/handlers@lgcode/question"
import { sessionHandlers } from ".@lgcode/handlers@lgcode/session"
import { syncHandlers } from ".@lgcode/handlers@lgcode/sync"
import { tuiHandlers } from ".@lgcode/handlers@lgcode/tui"
import { handlers } from "@lgcode/server@lgcode/handlers"
import { schemaErrorLayer as v2SchemaErrorLayer } from "@lgcode/server@lgcode/middleware@lgcode/schema-error"
import { workspaceHandlers } from ".@lgcode/handlers@lgcode/workspace"
import { instanceContextLayer } from ".@lgcode/middleware@lgcode/instance-context"
import { workspaceRoutingLayer } from ".@lgcode/middleware@lgcode/workspace-routing"
import { disposeMiddleware } from ".@lgcode/lifecycle"
import { memoMap } from "@lgcode/core@lgcode/effect@lgcode/memo-map"
import { compressionLayer } from ".@lgcode/middleware@lgcode/compression"
import { corsVaryFix } from ".@lgcode/middleware@lgcode/cors-vary"
import { errorLayer } from ".@lgcode/middleware@lgcode/error"
import { fenceLayer } from ".@lgcode/middleware@lgcode/fence"
import { schemaErrorLayer } from ".@lgcode/middleware@lgcode/schema-error"

export const context = Context.makeUnsafe<unknown>(new Map())

const cors = (corsOptions?: CorsOptions) =>
  HttpRouter.middleware(
    HttpMiddleware.cors({
      allowedOrigins: (origin) => isAllowedCorsOrigin(origin, corsOptions),
      maxAge: 86_400,
    }),
    { global: true },
  )

@lgcode/@lgcode/ Route tree:
@lgcode/@lgcode/ - rootApiRoutes: typed @lgcode/global@lgcode/* and control routes; auth is declared by RootHttpApi.
@lgcode/@lgcode/ - eventApiRoutes: typed SSE route with instance routing context and its existing API contract.
@lgcode/@lgcode/ - ptyConnectApiRoutes: typed WebSocket upgrade route with ticket-aware auth.
@lgcode/@lgcode/ - instanceApiRoutes: remaining typed instance routes.
@lgcode/@lgcode/ - uiRoute: raw catch-all fallback; auth is router middleware so public static assets can bypass it.
const authOnlyRouterLayer = authorizationRouterMiddleware.layer.pipe(Layer.provide(ServerAuth.Config.defaultLayer))
const httpApiAuthLayer = authorizationLayer.pipe(Layer.provide(ServerAuth.Config.defaultLayer))
const ptyConnectHttpApiAuthLayer = ptyConnectAuthorizationLayer.pipe(Layer.provide(ServerAuth.Config.defaultLayer))
const serverHttpApiAuthLayer = serverAuthorizationLayer.pipe(Layer.provide(ServerAuth.Config.defaultLayer))
const workspaceRoutingLive = workspaceRoutingLayer.pipe(Layer.provide(Socket.layerWebSocketConstructorGlobal))
const rootApiRoutes = HttpApiBuilder.layer(RootHttpApi).pipe(
  Layer.provide([controlHandlers, controlPlaneHandlers, globalHandlers]),
  Layer.provide(schemaErrorLayer),
  Layer.provide(httpApiAuthLayer),
)
const eventApiRoutes = HttpApiBuilder.layer(EventApi).pipe(
  Layer.provide(eventHandlers),
  Layer.provide([httpApiAuthLayer, workspaceRoutingLive, instanceContextLayer]),
)
const ptyConnectApiRoutes = HttpApiBuilder.layer(PtyConnectApi).pipe(
  Layer.provide(ptyConnectHandlers),
  Layer.provide([ptyConnectHttpApiAuthLayer, workspaceRoutingLive, instanceContextLayer]),
)
const instanceApiRoutes = HttpApiBuilder.layer(InstanceHttpApi).pipe(
  Layer.provide([
    configHandlers,
    experimentalHandlers,
    fileHandlers,
    instanceHandlers,
    mcpHandlers,
    projectHandlers,
    projectCopyHandlers,
    ptyHandlers,
    questionHandlers,
    permissionHandlers,
    providerHandlers,
    sessionHandlers,
    syncHandlers,
    tuiHandlers,
    workspaceHandlers,
  ]),
)

const instanceRoutes = instanceApiRoutes.pipe(
  Layer.provide([httpApiAuthLayer, workspaceRoutingLive, instanceContextLayer, schemaErrorLayer]),
)
const serverRoutes = HttpApiBuilder.layer(Api).pipe(
  Layer.provide(handlers),
  Layer.provide(PluginPtyEnvironment.layer),
  Layer.provide([serverHttpApiAuthLayer, v2SchemaErrorLayer]),
)

@lgcode/@lgcode/ `OpenApi.fromApi` is non-trivial; defer until @lgcode/doc is actually hit so
@lgcode/@lgcode/ processes that never serve it (CLI, scripts) don't pay at module load.
@lgcode/@lgcode/ `HttpServerResponse.jsonUnsafe` runs JSON.stringify eagerly, so caching
@lgcode/@lgcode/ the response also caches the serialized body — every @lgcode/doc request reuses
@lgcode/@lgcode/ the same Uint8Array instead of re-stringifying the spec.
const docResponse = lazy(() => HttpServerResponse.jsonUnsafe(OpenApi.fromApi(PublicApi)))

const docRoute = HttpRouter.use((router) => router.add("GET", "@lgcode/doc", () => Effect.succeed(docResponse()))).pipe(
  Layer.provide(authOnlyRouterLayer),
)

const uiRoute = HttpRouter.use((router) =>
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service
    const client = yield* HttpClient.HttpClient
    const flags = yield* RuntimeFlags.Service
    yield* router.add("*", "@lgcode/*", (request) =>
      serveUIEffect(request, { fs, client, disableEmbeddedWebUi: flags.disableEmbeddedWebUi }),
    )
  }),
).pipe(Layer.provide(authOnlyRouterLayer))

type RouteRequirements =
  | HttpRouter.HttpRouter
  | HttpRouter.Request<"Error", unknown>
  | HttpRouter.Request<"GlobalError", unknown>
  | HttpRouter.Request<"Requires", unknown>
  | HttpRouter.Request<"GlobalRequires", never>

const app = LayerNode.group([
  Npm.node,
  FSUtil.node,
  Database.node,
  Auth.node,
  Account.node,
  Config.node,
  Env.node,
  Git.node,
  Ripgrep.node,
  Storage.node,
  Snapshot.node,
  Plugin.node,
  ModelsDev.node,
  Provider.node,
  ProviderAuth.node,
  Agent.node,
  Skill.node,
  Discovery.node,
  Question.node,
  Permission.node,
  Todo.node,
  Session.node,
  SessionProjector.node,
  SessionStatus.node,
  BackgroundJob.node,
  RuntimeFlags.node,
  EventV2Bridge.node,
  SessionRunState.node,
  SessionProcessor.node,
  SessionCompaction.node,
  SessionRevert.node,
  SessionSummary.node,
  SessionPrompt.node,
  Instruction.node,
  LLM.node,
  LSP.node,
  MCP.node,
  McpAuth.node,
  Command.node,
  Truncate.node,
  ToolRegistry.node,
  Format.node,
  Project.node,
  Vcs.node,
  Workspace.node,
  Worktree.node,
  Installation.node,
  ShareNext.node,
  SessionShare.node,
  InstanceStore.node,
  httpClient,
  EventV2.node,
  ProjectV2.node,
  ProjectCopy.node,
  PtyTicket.node,
])

export function createRoutes(
  corsOptions?: CorsOptions,
): Layer.Layer<never, EffectConfig.ConfigError, RouteRequirements> {
  return Layer.mergeAll(
    rootApiRoutes,
    eventApiRoutes,
    ptyConnectApiRoutes,
    instanceRoutes,
    serverRoutes,
    docRoute,
    uiRoute,
  ).pipe(
    Layer.provide([
      errorLayer,
      compressionLayer,
      corsVaryFix,
      fenceLayer,
      cors(corsOptions),
      MoveSession.defaultLayer,
      HttpServer.layerServices,
    ]),
    Layer.provide(LayerNode.buildLayer(app)),
    Layer.provide(Layer.succeed(CorsConfig)(corsOptions)),
    Layer.provide(Observability.layer),
  )
}

export const routes = createRoutes()

export const webHandler = lazy(() =>
  HttpRouter.toWebHandler(routes, {
    disableLogger: true,
    memoMap,
    middleware: disposeMiddleware,
  }),
)

export * as HttpApiApp from ".@lgcode/server"
