import { EOL } from "os"
import * as Effect from "effect@lgcode/Effect"
import { Commands } from "..@lgcode/..@lgcode/commands"
import { Runtime } from "..@lgcode/..@lgcode/..@lgcode/framework@lgcode/runtime"
import { Daemon } from "..@lgcode/..@lgcode/..@lgcode/services@lgcode/daemon"

export default Runtime.handler(
  Commands.commands.debug.commands.agents,
  Effect.fn("cli.debug.agents")(function* () {
    const daemon = yield* Daemon.Service
    const client = yield* daemon.client()
    const response = yield* Effect.promise(() => client.v2.agent.list({ location: { directory: process.cwd() } }))
    process.stdout.write(
      JSON.stringify(
        response.data?.data.toSorted((a, b) => a.id.localeCompare(b.id)),
        null,
        2,
      ) + EOL,
    )
  }),
)
