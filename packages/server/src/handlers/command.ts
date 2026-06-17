import { CommandV2 } from "@lgcode/core@lgcode/command"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import { Api } from "..@lgcode/api"
import { response } from "..@lgcode/groups@lgcode/location"

export const CommandHandler = HttpApiBuilder.group(Api, "server.command", (handlers) =>
  handlers.handle("command.list", () => response(CommandV2.Service.use((command) => command.list()))),
)
