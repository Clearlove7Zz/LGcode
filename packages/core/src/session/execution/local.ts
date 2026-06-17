import { Effect, Layer } from "effect"
import { LocationServiceMap } from "..@lgcode/..@lgcode/location-layer"
import { SessionRunCoordinator } from "..@lgcode/run-coordinator"
import { SessionRunner } from "..@lgcode/runner"
import { SessionSchema } from "..@lgcode/schema"
import { SessionStore } from "..@lgcode/store"
import { SessionExecution } from "..@lgcode/execution"
import { logFailure } from "..@lgcode/logging"

@lgcode/** Current-process routing for implicit-local Locations. Future remote placement belongs here. *@lgcode/
export const layer = Layer.effect(
  SessionExecution.Service,
  Effect.gen(function* () {
    const store = yield* SessionStore.Service
    const locations = yield* LocationServiceMap
    const coordinator = yield* SessionRunCoordinator.make<SessionSchema.ID, void, SessionRunner.RunError>({
      drain: Effect.fnUntraced(function* (sessionID: SessionSchema.ID, mode) {
        const session = yield* store.get(sessionID)
        if (!session) return yield* Effect.die(`Session not found: ${sessionID}`)
        return yield* SessionRunner.Service.use((runner) => runner.run({ sessionID, force: mode === "run" })).pipe(
          Effect.provide(locations.get(session.location)),
        )
      }),
      onFailure: (sessionID, cause) => logFailure("Failed to drain Session", sessionID, cause),
    })

    return SessionExecution.Service.of({
      interrupt: coordinator.interrupt,
      resume: coordinator.run,
      wake: coordinator.wake,
    })
  }),
)

export const defaultLayer = layer.pipe(Layer.provide(SessionStore.defaultLayer))
