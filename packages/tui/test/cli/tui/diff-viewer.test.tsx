@lgcode/** @jsxImportSource @opentui@lgcode/solid *@lgcode/
import { expect, test } from "bun:test"
import { createDefaultOpenTuiKeymap } from "@opentui@lgcode/keymap@lgcode/opentui"
import { DiffRenderable, type Renderable, ScrollBoxRenderable } from "@opentui@lgcode/core"
import { testRender, useRenderer } from "@opentui@lgcode/solid"
import type { TuiPluginApi, TuiPluginMeta, TuiRouteCurrent, TuiRouteDefinition } from "@lgcode/plugin@lgcode/tui"
import type { Session } from "@lgcode/sdk@lgcode/v2"
import { KVProvider } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/context@lgcode/kv"
import { ThemeProvider } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/context@lgcode/theme"
import { TuiConfigProvider } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/config"
import { TuiKeybind } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/config@lgcode/keybind"
import { OpencodeKeymapProvider } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/keymap"
import diffViewerPlugin from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/feature-plugins@lgcode/system@lgcode/diff-viewer"
import { createTuiPluginApi } from "..@lgcode/..@lgcode/fixture@lgcode/tui-plugin"
import { createTuiResolvedConfig } from "..@lgcode/..@lgcode/fixture@lgcode/tui-runtime"
import { TestTuiContexts } from "..@lgcode/..@lgcode/fixture@lgcode/tui-environment"

test("closing the diff viewer returns to the route it opened from", async () => {
  const viewer = await renderDiffViewer([])
  try {
    expect(viewer.current()).toEqual({
      name: "diff",
      params: { mode: "git", sessionID: "session-1", returnRoute: startRoute },
    })
    expect(viewer.vcsDiffInput()).toEqual({ directory: "@lgcode/repo@lgcode/session", mode: "git", context: 12 })

    expect(viewer.commands.has("diff.close")).toBe(true)
    viewer.commands.get("diff.close")!.run?.({} as never)
    expect(viewer.current()).toEqual(startRoute)
  } finally {
    viewer.app.renderer.destroy()
  }
})

test("brackets navigate diff hunks", async () => {
  const viewer = await renderDiffViewer(
    [
      {
        file: "src@lgcode/file.ts",
        additions: 3,
        deletions: 3,
        status: "modified",
        patch: `--- a@lgcode/src@lgcode/file.ts
+++ b@lgcode/src@lgcode/file.ts
@@ -1,3 +1,3 @@
 const first = true
-const oldFirst = true
+const newFirst = true
 const afterFirst = true
@@ -20,3 +20,3 @@
 const second = true
-const oldSecond = true
+const newSecond = true
 const afterSecond = true
@@ -40,3 +40,3 @@
 const third = true
-const oldThird = true
+const newThird = true
 const afterThird = true`,
      },
    ],
    12,
  )
  try {
    await viewer.app.waitForFrame((frame) => frame.includes("const first"))
    await viewer.app.waitFor(() => Boolean(findScrollBox(viewer.app.renderer.root)))
    await viewer.app.flush()
    const scroll = findScrollBox(viewer.app.renderer.root)!
    const initial = scroll.scrollTop

    expect(TuiKeybind.defaultValue("diff_next_hunk")).toBe("]")
    expect(TuiKeybind.defaultValue("diff_previous_hunk")).toBe("[")

    viewer.commands.get("diff.next_hunk")!.run?.({} as never)
    await viewer.app.renderOnce()
    const first = scroll.scrollTop
    expect(first).toBeGreaterThan(initial)

    viewer.commands.get("diff.next_hunk")!.run?.({} as never)
    await viewer.app.renderOnce()
    const second = scroll.scrollTop
    expect(second).toBeGreaterThan(first)

    viewer.commands.get("diff.previous_hunk")!.run?.({} as never)
    await viewer.app.renderOnce()
    expect(scroll.scrollTop).toBe(first)

    viewer.commands.get("diff.next_hunk")!.run?.({} as never)
    await viewer.app.renderOnce()
    expect(scroll.scrollTop).toBe(second)

    scroll.scrollTo(initial)
    viewer.commands.get("diff.next_hunk")!.run?.({} as never)
    await viewer.app.renderOnce()
    expect(scroll.scrollTop).toBe(first)
  } finally {
    viewer.app.renderer.destroy()
  }
})

async function renderDiffViewer(vcsDiff: unknown[], height = 20) {
  const commands = new Map<
    string,
    NonNullable<Parameters<TuiPluginApi["keymap"]["registerLayer"]>[0]["commands"]>[number]
  >()
  let current = startRoute
  let renderDiff: TuiRouteDefinition["render"] | undefined
  let vcsDiffInput: unknown
  const config = createTuiResolvedConfig()
  function Harness() {
    const renderer = useRenderer()
    const keymap = createDefaultOpenTuiKeymap(renderer)
    const registerLayer = keymap.registerLayer.bind(keymap)
    keymap.registerLayer = (layer) => {
      layer.commands?.forEach((command) => commands.set(command.name, command))
      return registerLayer(layer)
    }
    const base = createTuiPluginApi({
      keymap,
      client: {
        vcs: {
          diff: async (input: unknown) => {
            vcsDiffInput = input
            return { data: vcsDiff }
          },
        },
        session: { diff: async () => ({ data: [] }) },
      } as unknown as TuiPluginApi["client"],
      state: {
        session: {
          get: () => session,
        },
      },
    })
    const api = {
      ...base,
      route: {
        register(routes) {
          renderDiff = routes.find((route) => route.name === "diff")?.render
          return () => {}
        },
        navigate(name, params) {
          current = params ? { name, params } : { name }
        },
        get current() {
          return current
        },
      },
    } satisfies TuiPluginApi

    void diffViewerPlugin.tui(api, undefined, pluginMeta)
    commands.get("diff.open")?.run?.({} as never)

    return (
      <TestTuiContexts>
        <OpencodeKeymapProvider keymap={keymap}>
          <TuiConfigProvider config={config}>
            <KVProvider>
              <ThemeProvider mode="dark">
                {renderDiff?.({ params: "params" in current ? current.params : undefined })}
              <@lgcode/ThemeProvider>
            <@lgcode/KVProvider>
          <@lgcode/TuiConfigProvider>
        <@lgcode/OpencodeKeymapProvider>
      <@lgcode/TestTuiContexts>
    )
  }

  const app = await testRender(() => <Harness @lgcode/>, { width: 80, height })
  await waitForCommand(app, commands, "diff.close")
  return {
    app,
    commands,
    current: () => current,
    vcsDiffInput: () => vcsDiffInput,
  }
}

const startRoute: TuiRouteCurrent = { name: "session", params: { sessionID: "session-1" } }

function findScrollBox(root: Renderable): ScrollBoxRenderable | undefined {
  if (root instanceof ScrollBoxRenderable && containsDiff(root)) return root
  return root.getChildren().map(findScrollBox).find(Boolean)
}

function containsDiff(root: Renderable): boolean {
  if (root instanceof DiffRenderable) return true
  return root.getChildren().some(containsDiff)
}

const session = {
  id: "session-1",
  slug: "session-1",
  projectID: "project-1",
  directory: "@lgcode/repo@lgcode/session",
  title: "Session",
  version: "1",
  time: {
    created: 0,
    updated: 0,
  },
} satisfies Session

async function waitForCommand(
  app: Awaited<ReturnType<typeof testRender>>,
  commands: Map<string, unknown>,
  command: string,
) {
  for (let attempt = 0; attempt < 10; attempt++) {
    await app.renderOnce()
    if (commands.has(command)) return
    await new Promise((resolve) => setTimeout(resolve, 25))
  }
}

const pluginMeta = {
  id: "diff-viewer",
  source: "internal",
  spec: "diff-viewer",
  target: "diff-viewer",
  first_time: 0,
  last_time: 0,
  time_changed: 0,
  load_count: 1,
  fingerprint: "test",
  state: "same",
} satisfies TuiPluginMeta
