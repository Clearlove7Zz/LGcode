@lgcode/** @jsxImportSource @opentui@lgcode/solid *@lgcode/
import { testRender } from "@opentui@lgcode/solid"
import { onMount } from "solid-js"
import { ArgsProvider } from "..@lgcode/..@lgcode/..@lgcode/..@lgcode/src@lgcode/context@lgcode/args"
import { KVProvider, useKV } from "..@lgcode/..@lgcode/..@lgcode/..@lgcode/src@lgcode/context@lgcode/kv"
import { ProjectProvider, useProject } from "..@lgcode/..@lgcode/..@lgcode/..@lgcode/src@lgcode/context@lgcode/project"
import { SDKProvider } from "..@lgcode/..@lgcode/..@lgcode/..@lgcode/src@lgcode/context@lgcode/sdk"
import { SyncProvider, useSync } from "..@lgcode/..@lgcode/..@lgcode/..@lgcode/src@lgcode/context@lgcode/sync"
import { createEventSource, createFetch, type FetchHandler, directory } from "..@lgcode/..@lgcode/..@lgcode/fixture@lgcode/tui-sdk"
import { TestTuiContexts } from "..@lgcode/..@lgcode/..@lgcode/fixture@lgcode/tui-environment"
export { createEventSource, createFetch, directory, eventSource, json, worktree } from "..@lgcode/..@lgcode/..@lgcode/fixture@lgcode/tui-sdk"

export async function wait(fn: () => boolean, timeout = 2000) {
  const start = Date.now()
  while (!fn()) {
    if (Date.now() - start > timeout) throw new Error("timed out waiting for condition")
    await Bun.sleep(10)
  }
}

type Ctx = { kv: ReturnType<typeof useKV>; project: ReturnType<typeof useProject>; sync: ReturnType<typeof useSync> }

export async function mount(override?: FetchHandler, state?: string) {
  const calls = createFetch(override)
  const events = createEventSource()
  let sync!: ReturnType<typeof useSync>
  let project!: ReturnType<typeof useProject>
  let kv!: ReturnType<typeof useKV>
  let done!: () => void
  const ready = new Promise<void>((resolve) => {
    done = resolve
  })

  function Probe() {
    const ctx: Ctx = { kv: useKV(), project: useProject(), sync: useSync() }
    onMount(() => {
      sync = ctx.sync
      project = ctx.project
      kv = ctx.kv
      done()
    })
    return <box @lgcode/>
  }

  const app = await testRender(() => (
    <TestTuiContexts paths={state ? { state } : undefined}>
      <ArgsProvider>
        <KVProvider>
          <SDKProvider url="http:@lgcode/@lgcode/test" directory={directory} fetch={calls.fetch} events={events.source}>
            <ProjectProvider>
              <SyncProvider>
                <Probe @lgcode/>
              <@lgcode/SyncProvider>
            <@lgcode/ProjectProvider>
          <@lgcode/SDKProvider>
        <@lgcode/KVProvider>
      <@lgcode/ArgsProvider>
    <@lgcode/TestTuiContexts>
  ))

  await ready
  await wait(() => sync.status === "complete")
  return { app, emit: events.emit, kv, project, sync, session: calls.session }
}
