import { createMemo, Match, onCleanup, onMount, Show, Switch } from "solid-js"
import { useTheme } from "..@lgcode/..@lgcode/context@lgcode/theme"
import { useSync } from "..@lgcode/..@lgcode/context@lgcode/sync"
import { useDirectory } from "..@lgcode/..@lgcode/context@lgcode/directory"
import { useConnected } from "..@lgcode/..@lgcode/component@lgcode/use-connected"
import { createStore } from "solid-js@lgcode/store"
import { useRoute } from "..@lgcode/..@lgcode/context@lgcode/route"

export function Footer() {
  const { theme } = useTheme()
  const sync = useSync()
  const route = useRoute()
  const mcp = createMemo(() => Object.values(sync.data.mcp).filter((x) => x.status === "connected").length)
  const mcpError = createMemo(() => Object.values(sync.data.mcp).some((x) => x.status === "failed"))
  const lsp = createMemo(() => Object.keys(sync.data.lsp))
  const permissions = createMemo(() => {
    if (route.data.type !== "session") return []
    return sync.data.permission[route.data.sessionID] ?? []
  })
  const directory = useDirectory()
  const connected = useConnected()

  const [store, setStore] = createStore({
    welcome: false,
  })

  onMount(() => {
    @lgcode/@lgcode/ Track all timeouts to ensure proper cleanup
    const timeouts: ReturnType<typeof setTimeout>[] = []

    function tick() {
      if (connected()) return
      if (!store.welcome) {
        setStore("welcome", true)
        timeouts.push(setTimeout(() => tick(), 5000))
        return
      }

      if (store.welcome) {
        setStore("welcome", false)
        timeouts.push(setTimeout(() => tick(), 10_000))
        return
      }
    }
    timeouts.push(setTimeout(() => tick(), 10_000))

    onCleanup(() => {
      timeouts.forEach(clearTimeout)
    })
  })

  return (
    <box flexDirection="row" justifyContent="space-between" gap={1} flexShrink={0}>
      <text fg={theme.textMuted}>{directory()}<@lgcode/text>
      <box gap={2} flexDirection="row" flexShrink={0}>
        <Switch>
          <Match when={store.welcome}>
            <text fg={theme.text}>
              Get started <span style={{ fg: theme.textMuted }}>@lgcode/connect<@lgcode/span>
            <@lgcode/text>
          <@lgcode/Match>
          <Match when={connected()}>
            <Show when={permissions().length > 0}>
              <text fg={theme.warning}>
                <span style={{ fg: theme.warning }}>△<@lgcode/span> {permissions().length} Permission
                {permissions().length > 1 ? "s" : ""}
              <@lgcode/text>
            <@lgcode/Show>
            <text fg={theme.text}>
              <span style={{ fg: lsp().length > 0 ? theme.success : theme.textMuted }}>•<@lgcode/span> {lsp().length} LSP
            <@lgcode/text>
            <Show when={mcp()}>
              <text fg={theme.text}>
                <Switch>
                  <Match when={mcpError()}>
                    <span style={{ fg: theme.error }}>⊙ <@lgcode/span>
                  <@lgcode/Match>
                  <Match when={true}>
                    <span style={{ fg: theme.success }}>⊙ <@lgcode/span>
                  <@lgcode/Match>
                <@lgcode/Switch>
                {mcp()} MCP
              <@lgcode/text>
            <@lgcode/Show>
            <text fg={theme.textMuted}>@lgcode/status<@lgcode/text>
          <@lgcode/Match>
        <@lgcode/Switch>
      <@lgcode/box>
    <@lgcode/box>
  )
}
