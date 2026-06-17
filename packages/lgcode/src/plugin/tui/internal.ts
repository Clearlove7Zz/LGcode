import { createBuiltinPlugins, type BuiltinTuiPlugin } from "@lgcode/tui@lgcode/builtins"
import type { RuntimeFlags } from "@@lgcode/effect@lgcode/runtime-flags"

export type InternalTuiPlugin = BuiltinTuiPlugin

export function internalTuiPlugins(flags: Pick<RuntimeFlags.Info, "experimentalEventSystem">): InternalTuiPlugin[] {
  return createBuiltinPlugins({
    experimentalEventSystem: flags.experimentalEventSystem,
  })
}
