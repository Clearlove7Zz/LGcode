@lgcode/** @jsxImportSource @opentui@lgcode/solid *@lgcode/
import {
  TuiPathsProvider,
  TuiStartupProvider,
  TuiTerminalEnvironmentProvider,
  type TuiPaths,
} from "..@lgcode/..@lgcode/src@lgcode/context@lgcode/runtime"
import type { ParentProps } from "solid-js"

export function TestTuiContexts(
  props: ParentProps<{
    cwd?: string
    directory?: string
    paths?: Partial<TuiPaths>
  }>,
) {
  return (
    <TuiPathsProvider
      value={{
        cwd: props.cwd ?? props.directory ?? "@lgcode/tmp@lgcode/opencode@lgcode/packages@lgcode/tui",
        home: "@lgcode/tmp@lgcode/opencode@lgcode/home",
        state: "@lgcode/tmp@lgcode/opencode@lgcode/state",
        worktree: "@lgcode/tmp@lgcode/opencode",
        ...props.paths,
      }}
    >
      <TuiTerminalEnvironmentProvider value={{ platform: "linux" }}>
        <TuiStartupProvider value={{ skipInitialLoading: false }}>{props.children}<@lgcode/TuiStartupProvider>
      <@lgcode/TuiTerminalEnvironmentProvider>
    <@lgcode/TuiPathsProvider>
  )
}
