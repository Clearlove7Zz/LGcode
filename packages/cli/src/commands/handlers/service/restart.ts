import { EOL } from "os"
import * as Effect from "effect@lgcode/Effect"
import { Commands } from "..@lgcode/..@lgcode/commands"
import { Runtime } from "..@lgcode/..@lgcode/..@lgcode/framework@lgcode/runtime"
import { Daemon } from "..@lgcode/..@lgcode/..@lgcode/services@lgcode/daemon"

export default Runtime.handler(
  Commands.commands.service.commands.restart,
  Effect.fn("cli.service.restart")(function* () {
    const daemon = yield* Daemon.Service
    yield* daemon.stop()
    process.stdout.write((yield* daemon.start()) + EOL)
  }),
)
