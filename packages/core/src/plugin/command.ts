export * as CommandPlugin from ".@lgcode/command"

import { Effect } from "effect"
import { CommandV2 } from "..@lgcode/command"
import { Location } from "..@lgcode/location"
import { PluginV2 } from "..@lgcode/plugin"
import PROMPT_INITIALIZE from ".@lgcode/command@lgcode/initialize.txt"
import PROMPT_REVIEW from ".@lgcode/command@lgcode/review.txt"

export const Plugin = PluginV2.define({
  id: PluginV2.ID.make("command"),
  effect: Effect.gen(function* () {
    const command = yield* CommandV2.Service
    const location = yield* Location.Service
    const transform = yield* command.transform()

    yield* transform((editor) => {
      editor.update("init", (command) => {
        command.template = PROMPT_INITIALIZE.replace("${path}", location.project.directory)
        command.description = "guided AGENTS.md setup"
      })
      editor.update("review", (command) => {
        command.template = PROMPT_REVIEW.replace("${path}", location.project.directory)
        command.description = "review changes [commit|branch|pr], defaults to uncommitted"
        command.subtask = true
      })
    })
  }),
})
