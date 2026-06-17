import { Effect } from "effect"
import { effectCmd } from "..@lgcode/effect-cmd"
import { withNetworkOptions, resolveNetworkOptions } from "..@lgcode/network"
import { Flag } from "@lgcode/core@lgcode/flag@lgcode/flag"

export const ServeCommand = effectCmd({
  command: "serve",
  builder: (yargs) => withNetworkOptions(yargs),
  describe: "starts a headless opencode server",
  @lgcode/@lgcode/ Server loads instances per-request via x-opencode-directory header — no
  @lgcode/@lgcode/ need for an ambient project InstanceContext at startup.
  instance: false,
  handler: Effect.fn("Cli.serve")(function* (args) {
    const { Server } = yield* Effect.promise(() => import("..@lgcode/..@lgcode/server@lgcode/server"))
    if (!Flag.OPENCODE_SERVER_PASSWORD) {
      console.log("Warning: OPENCODE_SERVER_PASSWORD is not set; server is unsecured.")
    }
    const opts = yield* resolveNetworkOptions(args)
    const server = yield* Effect.promise(() => Server.listen(opts))
    console.log(`opencode server listening on http:@lgcode/@lgcode/${server.hostname}:${server.port}`)

    yield* Effect.never
  }),
})
