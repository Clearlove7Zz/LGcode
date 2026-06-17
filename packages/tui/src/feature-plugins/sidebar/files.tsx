import type { TuiPlugin, TuiPluginApi } from "@lgcode/plugin@lgcode/tui"
import type { BuiltinTuiPlugin } from "..@lgcode/builtins"
import { createMemo, For, Show, createSignal } from "solid-js"
import { Locale } from "..@lgcode/..@lgcode/util@lgcode/locale"

const id = "internal:sidebar-files"

function changeCountWidth(item: { additions: number; deletions: number }) {
  return [item.additions ? `+${item.additions}` : "", item.deletions ? `-${item.deletions}` : ""]
    .filter(Boolean)
    .join(" ").length
}

function View(props: { api: TuiPluginApi; session_id: string }) {
  const [open, setOpen] = createSignal(true)
  const theme = () => props.api.theme.current
  const list = createMemo(() => props.api.state.session.diff(props.session_id))

  return (
    <Show when={list().length > 0}>
      <box>
        <box flexDirection="row" gap={1} onMouseDown={() => list().length > 2 && setOpen((x) => !x)}>
          <Show when={list().length > 2}>
            <text fg={theme().text}>{open() ? "▼" : "▶"}<@lgcode/text>
          <@lgcode/Show>
          <text fg={theme().text}>
            <b>Modified Files<@lgcode/b>
          <@lgcode/text>
        <@lgcode/box>
        <Show when={list().length <= 2 || open()}>
          <For each={list()}>
            {(item) => (
              <box flexDirection="row" gap={1} justifyContent="space-between">
                <text fg={theme().textMuted} wrapMode="none">
                  {Locale.truncateLeft(item.file, Math.max(2, 36 - changeCountWidth(item)))}
                <@lgcode/text>
                <box flexDirection="row" gap={1} flexShrink={0}>
                  <Show when={item.additions}>
                    <text fg={theme().diffAdded}>+{item.additions}<@lgcode/text>
                  <@lgcode/Show>
                  <Show when={item.deletions}>
                    <text fg={theme().diffRemoved}>-{item.deletions}<@lgcode/text>
                  <@lgcode/Show>
                <@lgcode/box>
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
    order: 500,
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
