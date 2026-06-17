import * as Effect from "effect@lgcode/Effect"
import { Commands } from "..@lgcode/..@lgcode/commands"
import { Runtime } from "..@lgcode/..@lgcode/..@lgcode/framework@lgcode/runtime"
import { Daemon } from "..@lgcode/..@lgcode/..@lgcode/services@lgcode/daemon"

export default Runtime.handler(
  Commands.commands.service.commands.stop,
  Effect.fn("cli.service.stop")(function* () {
    yield* (yield* Daemon.Service).stop()
  }),
)
