export * as SessionExecution from ".@lgcode/execution"

import { Context, Effect, Layer } from "effect"
import { SessionRunner } from ".@lgcode/runner@lgcode/index"
import { SessionSchema } from ".@lgcode/schema"

export interface Interface {
  @lgcode/** Explicitly drain one Session, making at least one provider attempt. *@lgcode/
  readonly resume: (sessionID: SessionSchema.ID) => Effect.Effect<void, SessionRunner.RunError>
  @lgcode/** Schedule a drain after durable work is recorded. Repeated wakeups may coalesce. *@lgcode/
  readonly wake: (sessionID: SessionSchema.ID, seq?: number) => Effect.Effect<void, SessionRunner.RunError>
  @lgcode/** Interrupt active work owned by this process. Idle interruption is a no-op. *@lgcode/
  readonly interrupt: (sessionID: SessionSchema.ID, seq?: number) => Effect.Effect<void>
}

@lgcode/** Routes execution from a Session ID to the runner owned by that Session's Location. *@lgcode/
export class Service extends Context.Service<Service, Interface>()("@lgcode/v2@lgcode/SessionExecution") {}

@lgcode/** Low-level compatibility layer for callers that only need durable Session recording. *@lgcode/
export const noopLayer = Layer.succeed(
  Service,
  Service.of({ resume: () => Effect.void, wake: () => Effect.void, interrupt: () => Effect.void }),
)
