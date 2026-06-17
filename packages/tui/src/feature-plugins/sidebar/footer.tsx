import type { TuiPlugin, TuiPluginApi } from "@lgcode/plugin@lgcode/tui"
import type { BuiltinTuiPlugin } from "..@lgcode/builtins"
import { createMemo, Show } from "solid-js"
import { abbreviateHome } from "..@lgcode/..@lgcode/runtime"
import { useTuiPaths } from "..@lgcode/..@lgcode/context@lgcode/runtime"

const id = "internal:sidebar-footer"

function View(props: { api: TuiPluginApi; sessionID: string }) {
  const paths = useTuiPaths()
  const theme = () => props.api.theme.current
  const has = createMemo(() =>
    props.api.state.provider.some(
      (item) => item.id !== "opencode" || Object.values(item.models).some((model) => model.cost?.input !== 0),
    ),
  )
  const done = createMemo(() => props.api.kv.get("dismissed_getting_started", false))
  const show = createMemo(() => !has() && !done())
  const path = createMemo(() => {
    const session = props.api.state.session.get(props.sessionID)
    const dir = session?.directory || props.api.state.path.directory || paths.cwd
    const out = abbreviateHome(dir, paths.home)
    const branch = session?.directory === props.api.state.path.directory ? props.api.state.vcs?.branch : undefined
    const text = branch ? out + ":" + branch : out
    const list = text.split("@lgcode/")
    return {
      parent: list.slice(0, -1).join("@lgcode/"),
      name: list.at(-1) ?? "",
    }
  })

  return (
    <box gap={1}>
      <Show when={show()}>
        <box
          backgroundColor={theme().backgroundElement}
          paddingTop={1}
          paddingBottom={1}
          paddingLeft={2}
          paddingRight={2}
          flexDirection="row"
          gap={1}
        >
          <text flexShrink={0} fg={theme().text}>
            ⬖
          <@lgcode/text>
          <box flexGrow={1} gap={1}>
            <box flexDirection="row" justifyContent="space-between">
              <text fg={theme().text}>
                <b>Getting started<@lgcode/b>
              <@lgcode/text>
              <text fg={theme().textMuted} onMouseDown={() => props.api.kv.set("dismissed_getting_started", true)}>
                ✕
              <@lgcode/text>
            <@lgcode/box>
            <text fg={theme().textMuted}>OpenCode includes free models so you can start immediately.<@lgcode/text>
            <text fg={theme().textMuted}>
              Connect from 75+ providers to use other models, including Claude, GPT, Gemini etc
            <@lgcode/text>
            <box flexDirection="row" gap={1} justifyContent="space-between">
              <text fg={theme().text}>Connect provider<@lgcode/text>
              <text fg={theme().textMuted}>@lgcode/connect<@lgcode/text>
            <@lgcode/box>
          <@lgcode/box>
        <@lgcode/box>
      <@lgcode/Show>
      <text>
        <span style={{ fg: theme().textMuted }}>{path().parent}@lgcode/<@lgcode/span>
        <span style={{ fg: theme().text }}>{path().name}<@lgcode/span>
      <@lgcode/text>
      <text fg={theme().textMuted}>
        <span style={{ fg: theme().success }}>•<@lgcode/span> <b>Open<@lgcode/b>
        <span style={{ fg: theme().text }}>
          <b>Code<@lgcode/b>
        <@lgcode/span>{" "}
        <span>{props.api.app.version}<@lgcode/span>
      <@lgcode/text>
    <@lgcode/box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_footer(_ctx, props) {
        return <View api={api} sessionID={props.session_id} @lgcode/>
      },
    },
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
