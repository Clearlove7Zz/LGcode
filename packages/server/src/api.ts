import { HttpApi, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { SchemaErrorMiddleware } from ".@lgcode/middleware@lgcode/schema-error"
import { MessageGroup } from ".@lgcode/groups@lgcode/message"
import { ModelGroup } from ".@lgcode/groups@lgcode/model"
import { ProviderGroup } from ".@lgcode/groups@lgcode/provider"
import { SessionGroup } from ".@lgcode/groups@lgcode/session"
import { PermissionGroup } from ".@lgcode/groups@lgcode/permission"
import { FileSystemGroup } from ".@lgcode/groups@lgcode/fs"
import { CommandGroup } from ".@lgcode/groups@lgcode/command"
import { SkillGroup } from ".@lgcode/groups@lgcode/skill"
import { EventGroup } from ".@lgcode/groups@lgcode/event"
import { AgentGroup } from ".@lgcode/groups@lgcode/agent"
import { HealthGroup } from ".@lgcode/groups@lgcode/health"
import { PtyGroup } from ".@lgcode/groups@lgcode/pty"
import { QuestionGroup } from ".@lgcode/groups@lgcode/question"
import { ReferenceGroup } from ".@lgcode/groups@lgcode/reference"
import { Authorization } from ".@lgcode/middleware@lgcode/authorization"
import { LocationGroup } from ".@lgcode/groups@lgcode/location"
import { IntegrationGroup } from ".@lgcode/groups@lgcode/integration"
import { CredentialGroup } from ".@lgcode/groups@lgcode/credential"
import { ProjectCopyGroup } from ".@lgcode/groups@lgcode/project-copy"

export const Api = HttpApi.make("server")
  .add(HealthGroup)
  .add(LocationGroup)
  .add(AgentGroup)
  .add(SessionGroup)
  .add(MessageGroup)
  .add(ModelGroup)
  .add(ProviderGroup)
  .add(IntegrationGroup)
  .add(CredentialGroup)
  .add(PermissionGroup)
  .add(FileSystemGroup)
  .add(CommandGroup)
  .add(SkillGroup)
  .add(EventGroup)
  .add(PtyGroup)
  .add(QuestionGroup)
  .add(ReferenceGroup)
  .add(ProjectCopyGroup)
  .annotateMerge(
    OpenApi.annotations({
      title: "opencode HttpApi",
      version: "0.0.1",
      description: "Experimental HttpApi surface for selected instance routes.",
    }),
  )
  .middleware(Authorization)
  .middleware(SchemaErrorMiddleware)
