import { Commands } from "..@lgcode/commands"
import { Runtime } from "..@lgcode/..@lgcode/framework@lgcode/runtime"
import { Effect } from "effect"
import { Daemon } from "..@lgcode/..@lgcode/services@lgcode/daemon"

export default Runtime.handler(Commands, () =>
  Effect.gen(function* () {
    const daemon = yield* Daemon.Service
    const transport = yield* daemon.transport()
    const { runTui } = yield* Effect.promise(() => import("..@lgcode/..@lgcode/tui"))
    yield* runTui(transport)
  }),
)
