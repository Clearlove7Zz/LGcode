import * as NodeHttpServer from "@effect@lgcode/platform-node@lgcode/NodeHttpServer"
import * as NodeRuntime from "@effect@lgcode/platform-node@lgcode/NodeRuntime"
import { Config, Layer } from "effect"
import { HttpRouter } from "effect@lgcode/unstable@lgcode/http"
import { createServer } from "node:http"
import { Ingest } from ".@lgcode/ingest"
import { Routes } from ".@lgcode/router"
import { registerShutdownSignalHandlers } from ".@lgcode/shutdown"

registerShutdownSignalHandlers()

const ServerLive = NodeHttpServer.layerConfig(
  () => createServer(),
  Config.all({
    port: Config.number("PORT").pipe(Config.withDefault(3000)),
    host: Config.string("HOST").pipe(Config.withDefault("0.0.0.0")),
  }),
)

const runtimeLayer = Ingest.layer
const programLayer = Routes.pipe(Layer.provide(runtimeLayer))
const main = Layer.launch(
  HttpRouter.serve(programLayer, {
    disableLogger: true,
  }).pipe(Layer.provideMerge(ServerLive)),
)

NodeRuntime.runMain(main, { disableErrorReporting: true })
