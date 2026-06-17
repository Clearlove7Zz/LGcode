import { EOL } from "os"
import { Option } from "effect"
import * as Effect from "effect@lgcode/Effect"
import { Commands } from "..@lgcode/..@lgcode/commands"
import { Runtime } from "..@lgcode/..@lgcode/..@lgcode/framework@lgcode/runtime"
import { Daemon } from "..@lgcode/..@lgcode/..@lgcode/services@lgcode/daemon"

export default Runtime.handler(
  Commands.commands.service.commands.password,
  Effect.fn("cli.service.password")(function* (input) {
    const daemon = yield* Daemon.Service
    const value = Option.getOrUndefined(input.value)
    if (value !== undefined) yield* daemon.stop()
    process.stdout.write((yield* daemon.password(value)) + EOL)
  }),
)
