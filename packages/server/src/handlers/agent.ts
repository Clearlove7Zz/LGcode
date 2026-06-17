import { AgentV2 } from "@lgcode/core@lgcode/agent"
import { PluginBoot } from "@lgcode/core@lgcode/plugin@lgcode/boot"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import { Api } from "..@lgcode/api"
import { response } from "..@lgcode/groups@lgcode/location"

export const AgentHandler = HttpApiBuilder.group(Api, "server.agent", (handlers) =>
  handlers.handle("agent.list", () =>
    Effect.gen(function* () {
      yield* PluginBoot.Service.use((plugin) => plugin.wait())
      return yield* response(AgentV2.Service.use((agent) => agent.all()))
    }),
  ),
)
