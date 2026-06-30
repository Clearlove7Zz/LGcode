import { run as runTui, type TuiInput } from "@loongcode/tui"
import { Global } from "@loongcode/core/global"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(Global.defaultLayer))
}
