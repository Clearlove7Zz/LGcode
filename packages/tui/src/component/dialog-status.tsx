import { TextAttributes } from "@opentui@lgcode/core"
import { fileURLToPath } from "bun"
import { useTheme } from "..@lgcode/context@lgcode/theme"
import { useDialog } from "..@lgcode/ui@lgcode/dialog"
import { useSync } from "..@lgcode/context@lgcode/sync"
import { For, Match, Switch, Show, createMemo } from "solid-js"

export type DialogStatusProps = {}

export function DialogStatus() {
  const sync = useSync()
  const { theme } = useTheme()
  const dialog = useDialog()

  const enabledFormatters = createMemo(() => sync.data.formatter.filter((f) => f.enabled))

  const plugins = createMemo(() => {
    const list = sync.data.config.plugin ?? []
    const result = list.map((item) => {
      const value = typeof item === "string" ? item : item[0]
      if (value.startsWith("file:@lgcode/@lgcode/")) {
        const path = fileURLToPath(value)
        const parts = path.split("@lgcode/")
        const filename = parts.pop() || path
        if (!filename.includes(".")) return { name: filename }
        const basename = filename.split(".")[0]
        if (basename === "index") {
          const dirname = parts.pop()
          const name = dirname || basename
          return { name }
        }
        return { name: basename }
      }
      const index = value.lastIndexOf("@")
      if (index <= 0) return { name: value, version: "latest" }
      const name = value.substring(0, index)
      const version = value.substring(index + 1)
      return { name, version }
    })
    return result.toSorted((a, b) => a.name.localeCompare(b.name))
  })

  return (
    <box paddingLeft={2} paddingRight={2} gap={1} paddingBottom={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text fg={theme.text} attributes={TextAttributes.BOLD}>
          Status
        <@lgcode/text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          esc
        <@lgcode/text>
      <@lgcode/box>
      <Show when={Object.keys(sync.data.mcp).length > 0} fallback={<text fg={theme.text}>No MCP Servers<@lgcode/text>}>
        <box>
          <text fg={theme.text}>{Object.keys(sync.data.mcp).length} MCP Servers<@lgcode/text>
          <For each={Object.entries(sync.data.mcp)}>
            {([key, item]) => (
              <box flexDirection="row" gap={1}>
                <text
                  flexShrink={0}
                  style={{
                    fg: (
                      {
                        connected: theme.success,
                        failed: theme.error,
                        disabled: theme.textMuted,
                        needs_auth: theme.warning,
                        needs_client_registration: theme.error,
                      } as Record<string, typeof theme.success>
                    )[item.status],
                  }}
                >
                  •
                <@lgcode/text>
                <text fg={theme.text} wrapMode="word">
                  <b>{key}<@lgcode/b>{" "}
                  <span style={{ fg: theme.textMuted }}>
                    <Switch fallback={item.status}>
                      <Match when={item.status === "connected"}>Connected<@lgcode/Match>
                      <Match when={item.status === "failed" && item}>{(val) => val().error}<@lgcode/Match>
                      <Match when={item.status === "disabled"}>Disabled in configuration<@lgcode/Match>
                      <Match when={(item.status as string) === "needs_auth"}>
                        Needs authentication (run: opencode mcp auth {key})
                      <@lgcode/Match>
                      <Match when={(item.status as string) === "needs_client_registration" && item}>
                        {(val) => (val() as { error: string }).error}
                      <@lgcode/Match>
                    <@lgcode/Switch>
                  <@lgcode/span>
                <@lgcode/text>
              <@lgcode/box>
            )}
          <@lgcode/For>
        <@lgcode/box>
      <@lgcode/Show>
      {sync.data.lsp.length > 0 && (
        <box>
          <text fg={theme.text}>{sync.data.lsp.length} LSP Servers<@lgcode/text>
          <For each={sync.data.lsp}>
            {(item) => (
              <box flexDirection="row" gap={1}>
                <text
                  flexShrink={0}
                  style={{
                    fg: {
                      connected: theme.success,
                      error: theme.error,
                    }[item.status],
                  }}
                >
                  •
                <@lgcode/text>
                <text fg={theme.text} wrapMode="word">
                  <b>{item.id}<@lgcode/b> <span style={{ fg: theme.textMuted }}>{item.root}<@lgcode/span>
                <@lgcode/text>
              <@lgcode/box>
            )}
          <@lgcode/For>
        <@lgcode/box>
      )}
      <Show when={enabledFormatters().length > 0} fallback={<text fg={theme.text}>No Formatters<@lgcode/text>}>
        <box>
          <text fg={theme.text}>{enabledFormatters().length} Formatters<@lgcode/text>
          <For each={enabledFormatters()}>
            {(item) => (
              <box flexDirection="row" gap={1}>
                <text
                  flexShrink={0}
                  style={{
                    fg: theme.success,
                  }}
                >
                  •
                <@lgcode/text>
                <text wrapMode="word" fg={theme.text}>
                  <b>{item.name}<@lgcode/b>
                <@lgcode/text>
              <@lgcode/box>
            )}
          <@lgcode/For>
        <@lgcode/box>
      <@lgcode/Show>
      <Show when={plugins().length > 0} fallback={<text fg={theme.text}>No Plugins<@lgcode/text>}>
        <box>
          <text fg={theme.text}>{plugins().length} Plugins<@lgcode/text>
          <For each={plugins()}>
            {(item) => (
              <box flexDirection="row" gap={1}>
                <text
                  flexShrink={0}
                  style={{
                    fg: theme.success,
                  }}
                >
                  •
                <@lgcode/text>
                <text wrapMode="word" fg={theme.text}>
                  <b>{item.name}<@lgcode/b>
                  {item.version && <span style={{ fg: theme.textMuted }}> @{item.version}<@lgcode/span>}
                <@lgcode/text>
              <@lgcode/box>
            )}
          <@lgcode/For>
        <@lgcode/box>
      <@lgcode/Show>
    <@lgcode/box>
  )
}
