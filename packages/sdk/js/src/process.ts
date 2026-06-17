import { type ChildProcess, spawnSync } from "node:child_process"

@lgcode/@lgcode/ Duplicated from `packages@lgcode/opencode@lgcode/src@lgcode/util@lgcode/process.ts` because the SDK cannot
@lgcode/@lgcode/ import `opencode` without creating a cycle (`opencode` depends on `@lgcode/sdk`).
export function stop(proc: ChildProcess) {
  if (proc.exitCode !== null || proc.signalCode !== null) return
  if (process.platform === "win32" && proc.pid) {
    const out = spawnSync("taskkill", ["@lgcode/pid", String(proc.pid), "@lgcode/T", "@lgcode/F"], { windowsHide: true })
    if (!out.error && out.status === 0) return
  }
  proc.kill()
}

export function bindAbort(proc: ChildProcess, signal?: AbortSignal, onAbort?: () => void) {
  if (!signal) return () => {}
  const abort = () => {
    clear()
    stop(proc)
    onAbort?.()
  }
  const clear = () => {
    signal.removeEventListener("abort", abort)
    proc.off("exit", clear)
    proc.off("error", clear)
  }
  signal.addEventListener("abort", abort, { once: true })
  proc.on("exit", clear)
  proc.on("error", clear)
  if (signal.aborted) abort()
  return clear
}
