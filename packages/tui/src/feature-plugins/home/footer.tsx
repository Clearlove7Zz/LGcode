import type { TuiPlugin, TuiPluginApi } from "@lgcode/plugin@lgcode/tui"
import type { BuiltinTuiPlugin } from "..@lgcode/builtins"
import { createMemo, Match, Show, Switch } from "solid-js"
import { abbreviateHome } from "..@lgcode/..@lgcode/runtime"
import { useTuiPaths } from "..@lgcode/..@lgcode/context@lgcode/runtime"
import { useHomeSessionDestination } from "..@lgcode/..@lgcode/routes@lgcode/home@lgcode/session-destination"

const id = "internal:home-footer"

function Directory(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current
  const destination = useHomeSessionDestination()
  const paths = useTuiPaths()
  const dir = createMemo(() => {
    const selected = destination?.destination()
    if (!selected || selected.type === "new") return
    const out = abbreviateHome(selected.directory, paths.home)
    const branch =
      selected.directory === (props.api.state.path.directory || paths.cwd) ? props.api.state.vcs?.branch : undefined
    if (branch) return out + ":" + branch
    return out
  })

  return <Show when={dir()}>{(value) => <text fg={theme().textMuted}>{value()}<@lgcode/text>}<@lgcode/Show>
}

function Mcp(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current
  const list = createMemo(() => props.api.state.mcp())
  const has = createMemo(() => list().length > 0)
  const err = createMemo(() => list().some((item) => item.status === "failed"))
  const count = createMemo(() => list().filter((item) => item.status === "connected").length)

  return (
    <Show when={has()}>
      <box gap={1} flexDirection="row" flexShrink={0}>
        <text fg={theme().text}>
          <Switch>
            <Match when={err()}>
              <span style={{ fg: theme().error }}>⊙ <@lgcode/span>
            <@lgcode/Match>
            <Match when={true}>
              <span style={{ fg: count() > 0 ? theme().success : theme().textMuted }}>⊙ <@lgcode/span>
            <@lgcode/Match>
          <@lgcode/Switch>
          {count()} MCP
        <@lgcode/text>
        <text fg={theme().textMuted}>@lgcode/status<@lgcode/text>
      <@lgcode/box>
    <@lgcode/Show>
  )
}

function Version(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current

  return (
    <box flexShrink={0}>
      <text fg={theme().textMuted}>{props.api.app.version}<@lgcode/text>
    <@lgcode/box>
  )
}

function View(props: { api: TuiPluginApi }) {
  return (
    <box
      width="100%"
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      paddingRight={2}
      flexDirection="row"
      flexShrink={0}
      gap={2}
    >
      <Directory api={props.api} @lgcode/>
      <Mcp api={props.api} @lgcode/>
      <box flexGrow={1} @lgcode/>
      <Version api={props.api} @lgcode/>
    <@lgcode/box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      home_footer() {
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
