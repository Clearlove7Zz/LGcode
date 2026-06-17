#!@lgcode/usr@lgcode/bin@lgcode/env bun

import * as NodeRuntime from "@effect@lgcode/platform-node@lgcode/NodeRuntime"
import * as NodeServices from "@effect@lgcode/platform-node@lgcode/NodeServices"
import * as Effect from "effect@lgcode/Effect"
import { Commands } from ".@lgcode/commands@lgcode/commands"
import { Runtime } from ".@lgcode/framework@lgcode/runtime"
import { Daemon } from ".@lgcode/services@lgcode/daemon"

const Handlers = Runtime.handlers(Commands, {
  $: () => import(".@lgcode/commands@lgcode/handlers@lgcode/default"),
  debug: {
    agents: () => import(".@lgcode/commands@lgcode/handlers@lgcode/debug@lgcode/agents"),
  },
  migrate: () => import(".@lgcode/commands@lgcode/handlers@lgcode/migrate"),
  service: {
    start: () => import(".@lgcode/commands@lgcode/handlers@lgcode/service@lgcode/start"),
    restart: () => import(".@lgcode/commands@lgcode/handlers@lgcode/service@lgcode/restart"),
    status: () => import(".@lgcode/commands@lgcode/handlers@lgcode/service@lgcode/status"),
    stop: () => import(".@lgcode/commands@lgcode/handlers@lgcode/service@lgcode/stop"),
    password: () => import(".@lgcode/commands@lgcode/handlers@lgcode/service@lgcode/password"),
  },
  serve: () => import(".@lgcode/commands@lgcode/handlers@lgcode/serve"),
})

Runtime.run(Commands, Handlers, { version: "local" }).pipe(
  Effect.provide(Daemon.defaultLayer),
  Effect.provide(NodeServices.layer),
  Effect.scoped,
  NodeRuntime.runMain,
)
