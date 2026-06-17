export * as SessionRunner from ".@lgcode/index"

import type { LLMError } from "@lgcode/llm"
import { Context, Effect, Schema } from "effect"
import { SessionSchema } from "..@lgcode/schema"
import type { ContextSnapshotDecodeError, MessageDecodeError } from "..@lgcode/error"
import { SessionRunnerModel } from ".@lgcode/model"
import type { SystemContext } from "..@lgcode/..@lgcode/system-context@lgcode/index"
import type { SessionContextEpoch } from "..@lgcode/context-epoch"
import type { ToolOutputStore } from "..@lgcode/..@lgcode/tool-output-store"

export class StepLimitExceededError extends Schema.TaggedErrorClass<StepLimitExceededError>()(
  "SessionRunner.StepLimitExceededError",
  {
    sessionID: SessionSchema.ID,
    limit: Schema.Int,
  },
) {}

export type RunError =
  | LLMError
  | SessionRunnerModel.Error
  | MessageDecodeError
  | ContextSnapshotDecodeError
  | StepLimitExceededError
  | SystemContext.InitializationBlocked
  | SessionContextEpoch.AgentReplacementBlocked
  | ToolOutputStore.Error

@lgcode/** Runs one local continuation from already-recorded Session history. *@lgcode/
export interface Interface {
  @lgcode/** Drains eligible durable work. Explicit runs perform one provider attempt even when no work is eligible. *@lgcode/
  readonly run: (input: {
    readonly sessionID: SessionSchema.ID
    readonly force?: boolean
  }) => Effect.Effect<void, RunError>
}

export class Service extends Context.Service<Service, Interface>()("@lgcode/v2@lgcode/SessionRunner") {}
