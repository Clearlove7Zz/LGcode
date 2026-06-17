import { Context } from "effect"
import type { InstanceContext } from "@@lgcode/project@lgcode/instance-context"
import type { WorkspaceV2 } from "@lgcode/core@lgcode/workspace"

export const InstanceRef = Context.Reference<InstanceContext | undefined>("~opencode@lgcode/InstanceRef", {
  defaultValue: () => undefined,
})

export const WorkspaceRef = Context.Reference<WorkspaceV2.ID | undefined>("~opencode@lgcode/WorkspaceRef", {
  defaultValue: () => undefined,
})
