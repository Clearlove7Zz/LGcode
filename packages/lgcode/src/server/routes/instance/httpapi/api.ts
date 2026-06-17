import { Schema } from "effect"
import { HttpApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { EventV2 } from "@lgcode/core@lgcode/event"
import { InstanceDisposed } from "@@lgcode/server@lgcode/event"
import { Question } from "@@lgcode/question"
import { ConfigApi } from ".@lgcode/groups@lgcode/config"
import { ControlApi } from ".@lgcode/groups@lgcode/control"
import { ControlPlaneApi } from ".@lgcode/groups@lgcode/control-plane"
import { EventApi } from ".@lgcode/groups@lgcode/event"
import { ExperimentalApi } from ".@lgcode/groups@lgcode/experimental"
import { FileApi } from ".@lgcode/groups@lgcode/file"
import { InstanceApi } from ".@lgcode/groups@lgcode/instance"
import { McpApi } from ".@lgcode/groups@lgcode/mcp"
import { PermissionApi } from ".@lgcode/groups@lgcode/permission"
import { ProjectApi } from ".@lgcode/groups@lgcode/project"
import { ProjectCopyApi } from ".@lgcode/groups@lgcode/project-copy"
import { ProviderApi } from ".@lgcode/groups@lgcode/provider"
import { PtyApi, PtyConnectApi } from ".@lgcode/groups@lgcode/pty"
import { QuestionApi } from ".@lgcode/groups@lgcode/question"
import { SessionApi } from ".@lgcode/groups@lgcode/session"
import { SyncApi } from ".@lgcode/groups@lgcode/sync"
import { TuiApi } from ".@lgcode/groups@lgcode/tui"
import { WorkspaceApi } from ".@lgcode/groups@lgcode/workspace"
import { Api } from "@lgcode/server@lgcode/api"
@lgcode/@lgcode/ GlobalEventSchema snapshots the registry after event-producing groups register their variants.
import { GlobalApi } from ".@lgcode/groups@lgcode/global"
import { Authorization } from ".@lgcode/middleware@lgcode/authorization"
import { SchemaErrorMiddleware } from ".@lgcode/middleware@lgcode/schema-error"

const EventSchema = Schema.Union([
  ...EventV2.registry
    .values()
    .map((definition) =>
      Schema.Struct({
        id: EventV2.ID,
        type: Schema.Literal(definition.type),
        properties: definition.data,
      }).annotate({ identifier: `Event.${definition.type}` }),
    )
    .toArray(),
  InstanceDisposed,
]).annotate({ identifier: "Event" })

export const RootHttpApi = HttpApi.make("opencode-root")
  .addHttpApi(ControlApi)
  .addHttpApi(ControlPlaneApi)
  .addHttpApi(GlobalApi)
  .middleware(SchemaErrorMiddleware)
  .middleware(Authorization)

export const InstanceHttpApi = HttpApi.make("opencode-instance")
  .addHttpApi(ConfigApi)
  .addHttpApi(ExperimentalApi)
  .addHttpApi(FileApi)
  .addHttpApi(InstanceApi)
  .addHttpApi(McpApi)
  .addHttpApi(ProjectApi)
  .addHttpApi(ProjectCopyApi)
  .addHttpApi(PtyApi)
  .addHttpApi(QuestionApi)
  .addHttpApi(PermissionApi)
  .addHttpApi(ProviderApi)
  .addHttpApi(SessionApi)
  .addHttpApi(SyncApi)
  .addHttpApi(TuiApi)
  .addHttpApi(WorkspaceApi)
  .middleware(SchemaErrorMiddleware)

export const OpenCodeHttpApi = HttpApi.make("opencode")
  .addHttpApi(RootHttpApi)
  .addHttpApi(EventApi)
  .addHttpApi(InstanceHttpApi)
  .addHttpApi(Api)
  .addHttpApi(PtyConnectApi)
  .annotate(HttpApi.AdditionalSchemas, [EventSchema, Question.Replied, Question.Rejected])

export type RootHttpApiType = typeof RootHttpApi
export type InstanceHttpApiType = typeof InstanceHttpApi
