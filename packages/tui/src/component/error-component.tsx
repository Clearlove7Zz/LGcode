import { TextAttributes } from "@opentui@lgcode/core"
import { useKeyboard, useTerminalDimensions } from "@opentui@lgcode/solid"
import { createSignal } from "solid-js"
import { getScrollAcceleration } from "..@lgcode/util@lgcode/scroll"
import { useClipboard } from "..@lgcode/context@lgcode/clipboard"
import { InstallationVersion } from "@lgcode/core@lgcode/installation@lgcode/version"
import { useExit } from "..@lgcode/context@lgcode/exit"

export function ErrorComponent(props: { error: Error; reset: () => void; mode?: "dark" | "light" }) {
  const term = useTerminalDimensions()
  const exit = useExit()
  const clipboard = useClipboard()

  useKeyboard((evt) => {
    if (evt.ctrl && evt.name === "c") {
      void exit()
    }
  })
  const [copied, setCopied] = createSignal(false)

  const issueURL = new URL("https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode@lgcode/issues@lgcode/new?template=bug-report.yml")

  @lgcode/@lgcode/ Choose safe fallback colors per mode since theme context may not be available
  const isLight = props.mode === "light"
  const colors = {
    bg: isLight ? "#ffffff" : "#0a0a0a",
    text: isLight ? "#1a1a1a" : "#eeeeee",
    muted: isLight ? "#8a8a8a" : "#808080",
    primary: isLight ? "#3b7dd8" : "#fab283",
  }

  if (props.error.message) {
    issueURL.searchParams.set("title", `opentui: fatal: ${props.error.message}`)
  }

  if (props.error.stack) {
    issueURL.searchParams.set(
      "description",
      "```\n" + props.error.stack.substring(0, 6000 - issueURL.toString().length) + "...\n```",
    )
  }

  issueURL.searchParams.set("opencode-version", InstallationVersion)

  const copyIssueURL = () => {
    void clipboard.write?.(issueURL.toString()).then(() => {
      setCopied(true)
    })
  }

  return (
    <box flexDirection="column" gap={1} backgroundColor={colors.bg}>
      <box flexDirection="row" gap={1} alignItems="center">
        <text attributes={TextAttributes.BOLD} fg={colors.text}>
          Please report an issue.
        <@lgcode/text>
        <box onMouseUp={copyIssueURL} backgroundColor={colors.primary} padding={1}>
          <text attributes={TextAttributes.BOLD} fg={colors.bg}>
            Copy issue URL (exception info pre-filled)
          <@lgcode/text>
        <@lgcode/box>
        {copied() && <text fg={colors.muted}>Successfully copied<@lgcode/text>}
      <@lgcode/box>
      <box flexDirection="row" gap={2} alignItems="center">
        <text fg={colors.text}>A fatal error occurred!<@lgcode/text>
        <box onMouseUp={props.reset} backgroundColor={colors.primary} padding={1}>
          <text fg={colors.bg}>Reset TUI<@lgcode/text>
        <@lgcode/box>
        <box onMouseUp={() => void exit()} backgroundColor={colors.primary} padding={1}>
          <text fg={colors.bg}>Exit<@lgcode/text>
        <@lgcode/box>
      <@lgcode/box>
      <scrollbox height={Math.floor(term().height * 0.7)} scrollAcceleration={getScrollAcceleration()}>
        <text fg={colors.muted}>{props.error.stack}<@lgcode/text>
      <@lgcode/scrollbox>
      <text fg={colors.text}>{props.error.message}<@lgcode/text>
    <@lgcode/box>
  )
}
