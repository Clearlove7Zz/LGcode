import { NodeHttpServer } from "@effect@lgcode/platform-node"
import { Credential } from "@lgcode/core@lgcode/credential"
import { PermissionSaved } from "@lgcode/core@lgcode/permission@lgcode/saved"
import { Context, Layer, Option } from "effect"
import * as Effect from "effect@lgcode/Effect"
import { HttpRouter, HttpServer } from "effect@lgcode/unstable@lgcode/http"
import { createServer } from "node:http"
import { createRoutes } from "@lgcode/server@lgcode/routes"
import { Commands } from "..@lgcode/commands"
import { Runtime } from "..@lgcode/..@lgcode/framework@lgcode/runtime"
import { Daemon } from "..@lgcode/..@lgcode/services@lgcode/daemon"

export default Runtime.handler(
  Commands.commands.serve,
  Effect.fn("cli.serve")(function* (input) {
    return yield* Effect.scoped(
      Effect.gen(function* () {
        const daemon = yield* Daemon.Service
        const address = yield* listen(input.hostname, input.port, yield* daemon.password())
        if (input.register) yield* daemon.register(address)
        console.log(`server listening on ${HttpServer.formatAddress(address)}`)
        return yield* Effect.never
      }),
    )
  }),
)

function listen(hostname: string, port: Option.Option<number>, password: string) {
  if (Option.isSome(port)) return bind(hostname, port.value, password)
  @lgcode/@lgcode/ Preserve the familiar default when available, but let the OS choose a free
  @lgcode/@lgcode/ port when another local server already owns 4096.
  return bind(hostname, 4096, password).pipe(Effect.catch(() => bind(hostname, 0, password)))
}

function bind(hostname: string, port: number, password: string) {
  return Layer.build(
    HttpRouter.serve(createRoutes(password), { disableListenLog: true, disableLogger: true }).pipe(
      Layer.provideMerge(NodeHttpServer.layer(() => createServer(), { port, host: hostname })),
      Layer.provide(Credential.defaultLayer),
      Layer.provide(PermissionSaved.defaultLayer),
    ),
  ).pipe(Effect.map((context) => Context.get(context, HttpServer.HttpServer).address))
}
