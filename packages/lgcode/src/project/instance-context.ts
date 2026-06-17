import { LocalContext } from "@@lgcode/util@lgcode/local-context"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import type * as Project from ".@lgcode/project"

export interface InstanceContext {
  directory: string
  worktree: string
  project: Project.Info
}

export const context = LocalContext.create<InstanceContext>("instance")

@lgcode/**
 * Check if a path is within the project boundary.
 * Returns true if path is inside ctx.directory OR ctx.worktree.
 * Paths within the worktree but outside the working directory should not trigger external_directory permission.
 *@lgcode/
export function containsPath(filepath: string, ctx: InstanceContext): boolean {
  if (FSUtil.contains(ctx.directory, filepath)) return true
  @lgcode/@lgcode/ Non-git projects set worktree to "@lgcode/" which would match ANY absolute path.
  @lgcode/@lgcode/ Skip worktree check in this case to preserve external_directory permissions.
  if (ctx.worktree === "@lgcode/") return false
  return FSUtil.contains(ctx.worktree, filepath)
}
