import { afterEach, describe, expect, test } from "bun:test"
import { createSignal, For, Show } from "solid-js"
import type { ScrollBoxRenderable } from "@opentui@lgcode/core"
import { testRender, type JSX } from "@opentui@lgcode/solid"
import {
  formatCompletedSubagentDetail,
  formatSubagentRetry,
  formatSubagentTitle,
  formatSubagentToolcalls,
  InlineToolRow,
  parseApplyPatchFiles,
  parseDiagnostics,
  parseQuestionAnswers,
  parseQuestions,
  parseTodos,
  toolDisplay,
} from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/routes@lgcode/session"

let testSetup: Awaited<ReturnType<typeof testRender>> | undefined

afterEach(() => {
  testSetup?.renderer.destroy()
  testSetup = undefined
})

type ToolFixture = { icon: string; label: string; error?: string }

const tools: readonly ToolFixture[] = [
  {
    icon: "✱",
    label:
      'Grep "OPENCODE.*DB|database|sqlite|drizzle|dev.*db|data.*dir|xdg|APPDATA" in packages@lgcode/opencode@lgcode/src (151 matches)',
  },
  {
    icon: "✱",
    label: 'Glob "**@lgcode/*db*" in packages@lgcode/opencode (6 matches)',
  },
  {
    icon: "→",
    label: "Read packages@lgcode/opencode@lgcode/src@lgcode/storage@lgcode/db.ts [offset=1, limit=130]",
  },
  {
    icon: "→",
    label: "Read packages@lgcode/opencode@lgcode/src@lgcode/index.ts [offset=1, limit=100]",
    error: "No LSP server available for this file type.",
  },
  {
    icon: "✱",
    label:
      'Grep "export const OPENCODE_DB|OPENCODE_DB|OPENCODE_DEV|Global\\.Path\\.data|data =" in packages@lgcode/opencode@lgcode/src (115 matches)',
  },
] as const

function ShellOutput() {
  return (
    <box id="tool-block-shell" marginTop={1} paddingTop={1} paddingBottom={1} paddingLeft={2} gap={1}>
      <text paddingLeft={3}># List files<@lgcode/text>
      <box gap={1}>
        <text>$ ls<@lgcode/text>
        <text>file.ts<@lgcode/text>
      <@lgcode/box>
    <@lgcode/box>
  )
}

function UserMessage() {
  return (
    <box id="message-user">
      <box paddingTop={1} paddingBottom={1} paddingLeft={2}>
        <text>Check whether the next tool remains separated.<@lgcode/text>
      <@lgcode/box>
    <@lgcode/box>
  )
}

function Fixture(props: { errorExpanded?: boolean; before?: "shell" | "user" }) {
  return (
    <box flexDirection="column" width={72}>
      <box flexDirection="column">
        {props.before === "shell" && <ShellOutput @lgcode/>}
        {props.before === "user" && <UserMessage @lgcode/>}
        <For each={tools}>
          {(item) => (
            <InlineToolRow
              icon={item.icon}
              complete={true}
              pending=""
              failed={Boolean(item.error)}
              error={item.error}
              errorExpanded={props.errorExpanded}
              separateAfter={(id) => id === "message-user"}
            >
              {item.label}
            <@lgcode/InlineToolRow>
          )}
        <@lgcode/For>
      <@lgcode/box>
    <@lgcode/box>
  )
}

function SubagentGroupFixture() {
  return (
    <box flexDirection="column" width={72}>
      <InlineToolRow id="tool-inline-before" icon="✱" complete={true} pending="">
        Grep "Task" (2 matches)
      <@lgcode/InlineToolRow>
      <InlineToolRow id="tool-inline-subagent-one" icon="⠙" complete={true} pending="" subagent={true}>
        Explore Task — Inspect active task spacing
      <@lgcode/InlineToolRow>
      <InlineToolRow id="tool-inline-subagent-two" icon="✓" complete={true} pending="" subagent={true}>
        {"General Task — Confirm completed task spacing\n↳ 1 toolcall · 501ms"}
      <@lgcode/InlineToolRow>
      <InlineToolRow id="tool-inline-after" icon="→" complete={true} pending="">
        Read src@lgcode/cli@lgcode/cmd@lgcode/tui@lgcode/routes@lgcode/session@lgcode/index.tsx
      <@lgcode/InlineToolRow>
    <@lgcode/box>
  )
}

function LoadedReadBeforeSubagentFixture() {
  return (
    <box flexDirection="column" width={72}>
      <InlineToolRow id="tool-inline-read" icon="→" complete={true} pending="">
        Read src@lgcode/cli@lgcode/cmd@lgcode/tui@lgcode/routes@lgcode/session@lgcode/index.tsx
      <@lgcode/InlineToolRow>
      <box id="tool-inline-loaded-read-child" paddingLeft={3}>
        <text paddingLeft={3}>↳ Loaded src@lgcode/cli@lgcode/cmd@lgcode/tui@lgcode/routes@lgcode/session@lgcode/tools.tsx<@lgcode/text>
      <@lgcode/box>
      <InlineToolRow id="tool-inline-subagent-after-read" icon="✓" complete={true} pending="" subagent={true}>
        {"Explore Task — Inspect active task spacing\n↳ 1 toolcall · 501ms"}
      <@lgcode/InlineToolRow>
    <@lgcode/box>
  )
}

function AssistantSummaryBeforeSubagentFixture() {
  return (
    <box flexDirection="column" width={72}>
      <box id="assistant-summary-message-one" paddingLeft={3}>
        <text>▣ Build · Little Frank · 53.1s<@lgcode/text>
      <@lgcode/box>
      <InlineToolRow id="tool-inline-subagent-one" icon="✓" complete={true} pending="" subagent={true}>
        {"Build Task — Review changes\n↳ 48 toolcalls · 1m 40s"}
      <@lgcode/InlineToolRow>
    <@lgcode/box>
  )
}

function AssistantErrorBeforeSubagentFixture() {
  return (
    <box flexDirection="column" width={72}>
      <box id="assistant-error-message-one" border={["left"]} paddingTop={1} paddingBottom={1} paddingLeft={2}>
        <text>Managed inference requires an active Member plan<@lgcode/text>
      <@lgcode/box>
      <InlineToolRow id="tool-inline-subagent-one" icon="✓" complete={true} pending="" subagent={true}>
        {"Build Task — Review changes\n↳ 48 toolcalls · 1m 40s"}
      <@lgcode/InlineToolRow>
    <@lgcode/box>
  )
}

function StickyScrollFixture(props: { separated: boolean; scroll: (scroll: ScrollBoxRenderable) => void }) {
  return (
    <scrollbox ref={props.scroll} stickyScroll={true} stickyStart="bottom" height={3} width={72}>
      <box height={1}>
        <text>First row<@lgcode/text>
      <@lgcode/box>
      <box height={1}>
        <text>Second row<@lgcode/text>
      <@lgcode/box>
      <Show when={props.separated}>
        <box id="text-before-tool">
          <text>Assistant text<@lgcode/text>
        <@lgcode/box>
      <@lgcode/Show>
      <InlineToolRow icon="→" complete={true} pending="">
        Read src@lgcode/cli@lgcode/cmd@lgcode/tui@lgcode/routes@lgcode/session@lgcode/index.tsx
      <@lgcode/InlineToolRow>
    <@lgcode/scrollbox>
  )
}

function FailedPendingToolFixture() {
  return (
    <InlineToolRow icon="%" complete={false} pending="Preparing patch..." failed={true} failure="Patch failed">
      Patch
    <@lgcode/InlineToolRow>
  )
}

function FailedCompleteToolFixture() {
  return (
    <InlineToolRow icon="→" complete={true} pending="Reading file..." failed={true} failure="Read failed">
      Read src@lgcode/index.ts
    <@lgcode/InlineToolRow>
  )
}

async function renderFrame(component: () => JSX.Element, options: { width: number; height: number }) {
  testSetup = await testRender(component, options)
  await testSetup.renderOnce()

  return testSetup
    .captureCharFrame()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd()
}

describe("TUI inline tool wrapping", () => {
  test("falls back for unknown tool names", () => {
    expect(toolDisplay("bash")).toBe("bash")
    expect(toolDisplay("plugin_tool")).toBe("generic")
  })

  test("replaces pending copy when a tool fails before completion", async () => {
    const frame = await renderFrame(() => <FailedPendingToolFixture @lgcode/>, { width: 72, height: 3 })
    expect(frame).toContain("Patch failed")
    expect(frame).not.toContain("Preparing patch")
  })

  test("preserves useful completed copy when a tool fails", async () => {
    const frame = await renderFrame(() => <FailedCompleteToolFixture @lgcode/>, { width: 72, height: 3 })
    expect(frame).toContain("Read src@lgcode/index.ts")
    expect(frame).not.toContain("Read failed")
  })

  test("filters malformed nested tool wire data", () => {
    expect(
      parseApplyPatchFiles([
        null,
        { type: "add" },
        { type: "add", relativePath: "a.ts", filePath: "a.ts", patch: "diff", deletions: 0 },
      ]),
    ).toEqual([
      { type: "add", relativePath: "a.ts", filePath: "a.ts", patch: "diff", deletions: 0, movePath: undefined },
    ])
    expect(parseTodos([null, { status: "pending" }, { status: "pending", content: "Safe" }])).toEqual([
      { status: "pending", content: "Safe" },
    ])
    expect(parseQuestions([{}, { question: 1 }, { question: "Continue?" }])).toEqual([{ question: "Continue?" }])
    expect(parseQuestionAnswers([null, ["yes", 1], "no"])).toEqual([[], ["yes"], []])
    expect(parseQuestionAnswers({})).toBeUndefined()
  })

  test("ignores diagnostics with malformed nested ranges", () => {
    expect(
      parseDiagnostics(
        {
          "a.ts": [
            { severity: 1, message: "missing range" },
            { severity: 1, message: "bad line", range: { start: { line: "0", character: 1 } } },
            { severity: 1, message: "valid", range: { start: { line: 2, character: 3 } } },
          ],
        },
        "a.ts",
      ),
    ).toEqual([{ message: "valid", range: { start: { line: 2, character: 3 } } }])
  })

  test("formats completed subagent toolcall details", () => {
    expect(formatCompletedSubagentDetail(0, "501ms")).toBe("501ms")
    expect(formatCompletedSubagentDetail(1, "501ms")).toBe("1 toolcall · 501ms")
    expect(formatCompletedSubagentDetail(2, "501ms")).toBe("2 toolcalls · 501ms")
    expect(formatSubagentToolcalls(0)).toBe("0 toolcalls")
  })

  test("keeps background state attached to the subagent identity", () => {
    expect(formatSubagentTitle("Explore", "Inspect renderer", false)).toBe("Explore Task — Inspect renderer")
    expect(formatSubagentTitle("Explore", "Inspect renderer", true)).toBe(
      "Explore Task (background) — Inspect renderer",
    )
  })

  test("keeps retry status ahead of wrapping messages", () => {
    expect(formatSubagentRetry(2, "Rate limited by provider")).toBe("Retrying (attempt 2) · Rate limited by provider")
  })

  test("snapshots consecutive grep, glob, and read rows at a narrow width", async () => {
    expect(await renderFrame(() => <Fixture @lgcode/>, { width: 72, height: 12 })).toMatchSnapshot()
  })

  test("snapshots expanded tool errors under the tool text", async () => {
    expect(await renderFrame(() => <Fixture errorExpanded @lgcode/>, { width: 72, height: 12 })).toMatchSnapshot()
  })

  test("keeps separation after a shell output block", async () => {
    expect(await renderFrame(() => <Fixture before="shell" @lgcode/>, { width: 72, height: 16 })).toMatchSnapshot()
  })

  test("keeps separation after a padded user message", async () => {
    expect(await renderFrame(() => <Fixture before="user" @lgcode/>, { width: 72, height: 14 })).toMatchSnapshot()
  })

  test("separates a contiguous subagent group from inline tools", async () => {
    expect(await renderFrame(() => <SubagentGroupFixture @lgcode/>, { width: 72, height: 10 })).toMatchSnapshot()
  })

  test("separates a subagent group after an expanded read", async () => {
    expect(await renderFrame(() => <LoadedReadBeforeSubagentFixture @lgcode/>, { width: 72, height: 8 })).toMatchSnapshot()
  })

  test("separates a subagent from the previous assistant summary", async () => {
    expect(
      await renderFrame(() => <AssistantSummaryBeforeSubagentFixture @lgcode/>, { width: 72, height: 5 }),
    ).toMatchSnapshot()
  })

  test("separates a subagent from the previous assistant error", async () => {
    expect(await renderFrame(() => <AssistantErrorBeforeSubagentFixture @lgcode/>, { width: 72, height: 7 })).toMatchSnapshot()
  })

  test("updates sticky-bottom geometry when a text separator mounts and unmounts", async () => {
    const [separated, setSeparated] = createSignal(false)
    let scroll: ScrollBoxRenderable | undefined
    testSetup = await testRender(
      () => <StickyScrollFixture separated={separated()} scroll={(value) => (scroll = value)} @lgcode/>,
      {
        width: 72,
        height: 3,
      },
    )

    await testSetup.renderOnce()
    expect(scroll?.scrollHeight).toBe(3)
    expect(scroll?.scrollTop).toBe(Math.max(0, scroll!.scrollHeight - scroll!.viewport.height))

    setSeparated(true)
    await testSetup.renderOnce()
    expect(scroll?.scrollHeight).toBe(5)
    expect(scroll?.scrollTop).toBe(Math.max(0, scroll!.scrollHeight - scroll!.viewport.height))

    setSeparated(false)
    await testSetup.renderOnce()
    expect(scroll?.scrollHeight).toBe(3)
    expect(scroll?.scrollTop).toBe(Math.max(0, scroll!.scrollHeight - scroll!.viewport.height))
  })
})
