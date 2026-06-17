import { run as runTui, type TuiInput } from "@lgcode/tui"
import { Global } from "@lgcode/core@lgcode/global"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(Global.defaultLayer))
}
