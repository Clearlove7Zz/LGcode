import { Context } from "effect"
import type { InstanceContext } from "@/project/instance-context"
import type { WorkspaceV2 } from "@loongcode/core/workspace"

export const InstanceRef = Context.Reference<InstanceContext | undefined>("~loongcode/InstanceRef", {
  defaultValue: () => undefined,
})

export const WorkspaceRef = Context.Reference<WorkspaceV2.ID | undefined>("~loongcode/WorkspaceRef", {
  defaultValue: () => undefined,
})
