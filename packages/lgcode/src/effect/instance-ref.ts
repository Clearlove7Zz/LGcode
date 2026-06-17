import { Context } from "effect"
import type { InstanceContext } from "@/project/instance-context"
import type { WorkspaceV2 } from "@lgcode/core/workspace"

export const InstanceRef = Context.Reference<InstanceContext | undefined>("~lgcode/InstanceRef", {
  defaultValue: () => undefined,
})

export const WorkspaceRef = Context.Reference<WorkspaceV2.ID | undefined>("~lgcode/WorkspaceRef", {
  defaultValue: () => undefined,
})
