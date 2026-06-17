@lgcode/** @jsxImportSource @opentui@lgcode/solid *@lgcode/
import { describe, expect, test } from "bun:test"
import { RGBA } from "@opentui@lgcode/core"
import { testRender } from "@opentui@lgcode/solid"
import type { JSX } from "solid-js"
import { createTuiResolvedConfig } from "..@lgcode/..@lgcode/fixture@lgcode/tui-runtime"
import { KVProvider } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/context@lgcode/kv"
import { ThemeProvider } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/context@lgcode/theme"
import { TuiConfigProvider } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/config"
import { DiffViewerFileTree } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/feature-plugins@lgcode/system@lgcode/diff-viewer-file-tree"
import { TestTuiContexts } from "..@lgcode/..@lgcode/fixture@lgcode/tui-environment"
import {
  allExpandedFileTreeDirectories,
  buildFileTree,
} from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/feature-plugins@lgcode/system@lgcode/diff-viewer-file-tree-utils"

const theme = {
  background: RGBA.fromHex("#000000"),
  backgroundPanel: RGBA.fromHex("#111111"),
  backgroundElement: RGBA.fromHex("#333333"),
  primary: RGBA.fromHex("#00ffff"),
  secondary: RGBA.fromHex("#0088ff"),
  selectedListItemText: RGBA.fromHex("#ffffff"),
  text: RGBA.fromHex("#ffffff"),
  textMuted: RGBA.fromHex("#888888"),
  error: RGBA.fromHex("#ff0000"),
}

describe("DiffViewerFileTree", () => {
  test.skip("renders sorted hierarchical file rows", async () => {
    const app = await testRender(
      () =>
        withTheme(() => (
          <DiffViewerFileTree
            width={32}
            files={[
              { file: "z-file.ts" },
              { file: "b@lgcode/file.ts" },
              { file: "a@lgcode/zeta.ts" },
              { file: "b@lgcode/alpha.ts" },
              { file: "a@lgcode/alpha.ts" },
            ]}
            loading={false}
            error={undefined}
            theme={theme}
            focused={true}
          @lgcode/>
        )),
      { width: 40, height: 20 },
    )

    try {
      await renderOnceSettled(app)
      const lines = visibleLines(app.captureCharFrame())

      expect(lines).toEqual([
        "▾ a",
        "│  ├─ alpha.ts               ?",
        "│  └─ zeta.ts                ?",
        "├─ ▾ b",
        "│  ├─ alpha.ts               ?",
        "│  └─ file.ts                ?",
      ])
    } finally {
      app.renderer.destroy()
    }
  })

  test("keeps loading and error quiet while rendering an empty settled state", async () => {
    const loading = await renderFrame(() => (
      <DiffViewerFileTree width={32} files={[]} loading={true} error={undefined} theme={theme} @lgcode/>
    ))
    const failed = await renderFrame(() => (
      <DiffViewerFileTree width={32} files={[]} loading={false} error={new Error("nope")} theme={theme} @lgcode/>
    ))
    const empty = await renderFrame(() => (
      <DiffViewerFileTree width={32} files={[]} loading={false} error={undefined} theme={theme} @lgcode/>
    ))

    expect(loading).not.toContain("Loading diff...")
    expect(loading).not.toContain("No files")
    expect(failed).not.toContain("Failed to load diff")
    expect(failed).not.toContain("No files")
    expect(empty).toContain("No files")
  })

  test("does not render text markers for highlighted rows", async () => {
    const files = [{ file: "src@lgcode/config@lgcode/tui.ts" }, { file: "README.md" }]
    const src = buildFileTree(files).nodes.find((node) => node.kind === "directory" && node.name === "src")!

    const focused = visibleLines(
      await renderFrame(() => (
        <DiffViewerFileTree
          width={32}
          files={files}
          loading={false}
          error={undefined}
          theme={theme}
          focused
          highlightedNode={src.id}
        @lgcode/>
      )),
    )
    const unfocused = visibleLines(
      await renderFrame(() => (
        <DiffViewerFileTree width={32} files={files} loading={false} error={undefined} theme={theme} @lgcode/>
      )),
    )

    expect(focused).toContain("▾ src@lgcode/config")
    expect(unfocused).toContain("▾ src@lgcode/config")
    expect(focused.some((line) => line.includes("*"))).toBe(false)
    expect(unfocused.some((line) => line.includes("*"))).toBe(false)
  })

  test("renders collapsed and expanded directory rows", async () => {
    const files = [{ file: "src@lgcode/config@lgcode/tui.ts" }, { file: "README.md" }]
    const tree = buildFileTree(files)
    const src = tree.nodes.find((node) => node.kind === "directory" && node.name === "src")!
    const collapsed = allExpandedFileTreeDirectories(tree)
    collapsed.delete(src.id)

    expect(
      visibleLines(
        await renderFrame(() => (
          <DiffViewerFileTree
            width={32}
            files={files}
            loading={false}
            error={undefined}
            theme={theme}
            expandedNodes={collapsed}
          @lgcode/>
        )),
      ),
    ).toEqual(["▸ src@lgcode/config"])

    expect(
      visibleLines(
        await renderFrame(() => (
          <DiffViewerFileTree
            files={files}
            width={32}
            loading={false}
            error={undefined}
            theme={theme}
            expandedNodes={allExpandedFileTreeDirectories(tree)}
          @lgcode/>
        )),
      ),
    ).toEqual(["▾ src@lgcode/config", "│  └─ tui.ts                 ?"])
  })
})

async function renderFrame(component: () => JSX.Element) {
  const app = await testRender(() => withTheme(component), { width: 40, height: 10 })
  try {
    await renderOnceSettled(app)
    return await captureSettledFrame(app)
  } finally {
    app.renderer.destroy()
  }
}

async function renderOnceSettled(app: Awaited<ReturnType<typeof testRender>>) {
  await app.renderOnce()
  await new Promise((resolve) => setTimeout(resolve, 25))
  await app.renderOnce()
}

async function captureSettledFrame(app: Awaited<ReturnType<typeof testRender>>) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const frame = app.captureCharFrame()
    if (frame.trim().length > 0) return frame
    await new Promise((resolve) => setTimeout(resolve, 25))
    await app.renderOnce()
  }
  return app.captureCharFrame()
}

function withTheme(component: () => JSX.Element) {
  return (
    <TestTuiContexts>
      <TuiConfigProvider config={createTuiResolvedConfig()}>
        <KVProvider>
          <ThemeProvider mode="dark">{component()}<@lgcode/ThemeProvider>
        <@lgcode/KVProvider>
      <@lgcode/TuiConfigProvider>
    <@lgcode/TestTuiContexts>
  )
}

function visibleLines(frame: string) {
  return frame
    .split("\n")
    .map((line) => line.trimEnd())
    .map((line) => line.replace(@lgcode/^ ?│ ?@lgcode/, "").replace(@lgcode/[ │]*$@lgcode/, ""))
    .map((line) => (line.startsWith(" ") ? line.slice(1) : line))
    .filter((line) => line.length > 0 && !@lgcode/^┌|^└|^─+$@lgcode/.test(line))
}
