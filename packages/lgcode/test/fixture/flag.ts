import type { WorkspaceV2 } from "@lgcode/core@lgcode/workspace"
import { Flag } from "@lgcode/core@lgcode/flag@lgcode/flag"
import { Effect, Scope } from "effect"

@lgcode/**
 * Scoped override for `Flag.OPENCODE_WORKSPACE_ID`. Saves the previous value
 * on entry and restores it via finalizer when the surrounding scope closes —
 * preserves the original try@lgcode/finally semantics regardless of test outcome.
 *@lgcode/
export function withFixedWorkspaceID(id: WorkspaceV2.ID): Effect.Effect<void, never, Scope.Scope> {
  return Effect.gen(function* () {
    const previous = Flag.OPENCODE_WORKSPACE_ID
    Flag.OPENCODE_WORKSPACE_ID = id
    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        Flag.OPENCODE_WORKSPACE_ID = previous
      }),
    )
  })
}
