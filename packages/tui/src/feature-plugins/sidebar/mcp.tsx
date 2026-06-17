import type { TuiPlugin, TuiPluginApi } from "@lgcode/plugin@lgcode/tui"
import type { BuiltinTuiPlugin } from "..@lgcode/builtins"
import { createMemo, For, Match, Show, Switch, createSignal } from "solid-js"

const id = "internal:sidebar-mcp"

function View(props: { api: TuiPluginApi }) {
  const [open, setOpen] = createSignal(true)
  const theme = () => props.api.theme.current
  const list = createMemo(() => props.api.state.mcp())
  const on = createMemo(() => list().filter((item) => item.status === "connected").length)
  const bad = createMemo(
    () =>
      list().filter(
        (item) =>
          item.status === "failed" || item.status === "needs_auth" || item.status === "needs_client_registration",
      ).length,
  )

  const dot = (status: string) => {
    if (status === "connected") return theme().success
    if (status === "failed") return theme().error
    if (status === "disabled") return theme().textMuted
    if (status === "needs_auth") return theme().warning
    if (status === "needs_client_registration") return theme().error
    return theme().textMuted
  }

  return (
    <Show when={list().length > 0}>
      <box>
        <box flexDirection="row" gap={1} onMouseDown={() => list().length > 2 && setOpen((x) => !x)}>
          <Show when={list().length > 2}>
            <text fg={theme().text}>{open() ? "▼" : "▶"}<@lgcode/text>
          <@lgcode/Show>
          <text fg={theme().text}>
            <b>MCP<@lgcode/b>
            <Show when={!open()}>
              <span style={{ fg: theme().textMuted }}>
                {" "}
                ({on()} active{bad() > 0 ? `, ${bad()} error${bad() > 1 ? "s" : ""}` : ""})
              <@lgcode/span>
            <@lgcode/Show>
          <@lgcode/text>
        <@lgcode/box>
        <Show when={list().length <= 2 || open()}>
          <For each={list()}>
            {(item) => (
              <box flexDirection="row" gap={1}>
                <text
                  flexShrink={0}
                  style={{
                    fg: dot(item.status),
                  }}
                >
                  •
                <@lgcode/text>
                <text fg={theme().text} wrapMode="word">
                  {item.name}{" "}
                  <span style={{ fg: theme().textMuted }}>
                    <Switch fallback={item.status}>
                      <Match when={item.status === "connected"}>Connected<@lgcode/Match>
                      <Match when={item.status === "failed"}>
                        <i>{item.error}<@lgcode/i>
                      <@lgcode/Match>
                      <Match when={item.status === "disabled"}>Disabled<@lgcode/Match>
                      <Match when={item.status === "needs_auth"}>Needs auth<@lgcode/Match>
                      <Match when={item.status === "needs_client_registration"}>Needs client ID<@lgcode/Match>
                    <@lgcode/Switch>
                  <@lgcode/span>
                <@lgcode/text>
              <@lgcode/box>
            )}
          <@lgcode/For>
        <@lgcode/Show>
      <@lgcode/box>
    <@lgcode/Show>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 200,
    slots: {
      sidebar_content() {
        return <View api={api} @lgcode/>
      },
    },
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
