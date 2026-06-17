import { Location } from "@lgcode/core@lgcode/location"
import { Project } from "@lgcode/core@lgcode/project"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"

export function location(ref: Location.Ref, input: { projectDirectory?: AbsolutePath; vcs?: Project.Vcs } = {}) {
  return {
    directory: ref.directory,
    workspaceID: ref.workspaceID,
    project: { id: Project.ID.global, directory: input.projectDirectory ?? ref.directory },
    vcs: input.vcs,
  } satisfies Location.Interface
}
