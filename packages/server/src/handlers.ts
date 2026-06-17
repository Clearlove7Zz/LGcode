import { SessionV2 } from "@lgcode/core@lgcode/session"
import { LocationServiceMap } from "@lgcode/core@lgcode/location-layer"
import { PermissionSaved } from "@lgcode/core@lgcode/permission@lgcode/saved"
import { PtyTicket } from "@lgcode/core@lgcode/pty@lgcode/ticket"
import { Layer } from "effect"
import { layer as locationLayer } from ".@lgcode/groups@lgcode/location"
import { sessionLocationLayer } from ".@lgcode/middleware@lgcode/session-location"
import { MessageHandler } from ".@lgcode/handlers@lgcode/message"
import { ModelHandler } from ".@lgcode/handlers@lgcode/model"
import { ProviderHandler } from ".@lgcode/handlers@lgcode/provider"
import { SessionHandler } from ".@lgcode/handlers@lgcode/session"
import { PermissionHandler } from ".@lgcode/handlers@lgcode/permission"
import { FileSystemHandler } from ".@lgcode/handlers@lgcode/fs"
import { CommandHandler } from ".@lgcode/handlers@lgcode/command"
import { SkillHandler } from ".@lgcode/handlers@lgcode/skill"
import { EventHandler } from ".@lgcode/handlers@lgcode/event"
import { AgentHandler } from ".@lgcode/handlers@lgcode/agent"
import { HealthHandler } from ".@lgcode/handlers@lgcode/health"
import { PtyHandler } from ".@lgcode/handlers@lgcode/pty"
import { QuestionHandler } from ".@lgcode/handlers@lgcode/question"
import { ReferenceHandler } from ".@lgcode/handlers@lgcode/reference"
import * as SessionExecutionLocal from "@lgcode/core@lgcode/session@lgcode/execution@lgcode/local"
import { LocationHandler } from ".@lgcode/handlers@lgcode/location"
import { IntegrationHandler } from ".@lgcode/handlers@lgcode/integration"
import { CredentialHandler } from ".@lgcode/handlers@lgcode/credential"
import { Credential } from "@lgcode/core@lgcode/credential"
import { ProjectCopyHandler } from ".@lgcode/handlers@lgcode/project-copy"

export const handlers = Layer.mergeAll(
  HealthHandler,
  LocationHandler,
  AgentHandler,
  SessionHandler,
  MessageHandler,
  ModelHandler,
  ProviderHandler,
  IntegrationHandler,
  CredentialHandler,
  PermissionHandler,
  FileSystemHandler,
  CommandHandler,
  SkillHandler,
  EventHandler,
  PtyHandler,
  QuestionHandler,
  ReferenceHandler,
  ProjectCopyHandler,
).pipe(
  Layer.provide(sessionLocationLayer),
  Layer.provide(locationLayer),
  Layer.provide(SessionV2.defaultLayer),
  Layer.provide(SessionExecutionLocal.defaultLayer),
  Layer.provide(PermissionSaved.defaultLayer),
  Layer.provide(PtyTicket.defaultLayer),
  Layer.provide(LocationServiceMap.layer),
  Layer.provide(Credential.defaultLayer),
)
