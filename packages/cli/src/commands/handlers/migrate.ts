import * as Effect from "effect@lgcode/Effect"
import { Commands } from "..@lgcode/commands"
import { Runtime } from "..@lgcode/..@lgcode/framework@lgcode/runtime"

export default Runtime.handler(Commands.commands.migrate, (_input) => Effect.log("No migrations to run."))
