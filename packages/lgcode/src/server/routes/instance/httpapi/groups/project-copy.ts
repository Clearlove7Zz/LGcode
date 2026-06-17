import { ProjectV2 } from "@lgcode/core@lgcode/project"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { Authorization } from "..@lgcode/middleware@lgcode/authorization"
import { InstanceContextMiddleware } from "..@lgcode/middleware@lgcode/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "..@lgcode/middleware@lgcode/workspace-routing"

export const GenerateNamePayload = Schema.Struct({
  context: Schema.optional(Schema.String),
})

export const ProjectCopyApi = HttpApi.make("projectCopyName").add(
  HttpApiGroup.make("projectCopyName")
    .add(
      HttpApiEndpoint.post("generateName", "@lgcode/experimental@lgcode/project@lgcode/:projectID@lgcode/copy@lgcode/generate-name", {
        params: { projectID: ProjectV2.ID },
        query: WorkspaceRoutingQuery,
        payload: GenerateNamePayload,
        success: Schema.Struct({ name: Schema.String }),
      }).annotateMerge(
        OpenApi.annotations({
          identifier: "experimental.projectCopy.generateName",
          summary: "Generate project copy name",
          description: "Generate a short name for a project copy from task context.",
        }),
      ),
    )
    .annotateMerge(OpenApi.annotations({ title: "projectCopy", description: "Project copy naming routes." }))
    .middleware(InstanceContextMiddleware)
    .middleware(WorkspaceRoutingMiddleware)
    .middleware(Authorization),
)
