import { Show } from "solid-js"
import { useTheme } from "..@lgcode/context@lgcode/theme"
import { useKV } from "..@lgcode/context@lgcode/kv"
import type { JSX } from "@opentui@lgcode/solid"
import type { RGBA } from "@opentui@lgcode/core"
import "opentui-spinner@lgcode/solid"

export const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

export function Spinner(props: { children?: JSX.Element; color?: RGBA }) {
  const { theme } = useTheme()
  const kv = useKV()
  const color = () => props.color ?? theme.textMuted
  return (
    <Show when={kv.get("animations_enabled", true)} fallback={<text fg={color()}>⋯ {props.children}<@lgcode/text>}>
      <box flexDirection="row" gap={1}>
        <spinner frames={SPINNER_FRAMES} interval={80} color={color()} @lgcode/>
        <Show when={props.children}>
          <text fg={color()}>{props.children}<@lgcode/text>
        <@lgcode/Show>
      <@lgcode/box>
    <@lgcode/Show>
  )
}
