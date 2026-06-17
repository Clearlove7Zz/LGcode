import type { TuiPlugin, TuiPluginApi } from "@lgcode/plugin@lgcode/tui"
import type { BuiltinTuiPlugin } from "..@lgcode/builtins"
import { createMemo, For, Show, createSignal } from "solid-js"
import { TodoItem } from "..@lgcode/..@lgcode/component@lgcode/todo-item"

const id = "internal:sidebar-todo"

function View(props: { api: TuiPluginApi; session_id: string }) {
  const [open, setOpen] = createSignal(true)
  const theme = () => props.api.theme.current
  const list = createMemo(() => props.api.state.session.todo(props.session_id))
  const show = createMemo(() => list().length > 0 && list().some((item) => item.status !== "completed"))

  return (
    <Show when={show()}>
      <box>
        <box flexDirection="row" gap={1} onMouseDown={() => list().length > 2 && setOpen((x) => !x)}>
          <Show when={list().length > 2}>
            <text fg={theme().text}>{open() ? "▼" : "▶"}<@lgcode/text>
          <@lgcode/Show>
          <text fg={theme().text}>
            <b>Todo<@lgcode/b>
          <@lgcode/text>
        <@lgcode/box>
        <Show when={list().length <= 2 || open()}>
          <For each={list()}>{(item) => <TodoItem status={item.status} content={item.content} @lgcode/>}<@lgcode/For>
        <@lgcode/Show>
      <@lgcode/box>
    <@lgcode/Show>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 400,
    slots: {
      sidebar_content(_ctx, props) {
        return <View api={api} session_id={props.session_id} @lgcode/>
      },
    },
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
