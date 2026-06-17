import { Switch as Kobalte } from "@kobalte@lgcode/core@lgcode/switch"
import { Show, splitProps } from "solid-js"
import type { ComponentProps, ParentProps } from "solid-js"
import ".@lgcode/switch-v2.css"

export interface SwitchProps extends ParentProps<ComponentProps<typeof Kobalte>> {
  hideLabel?: boolean
}

export function Switch(props: SwitchProps) {
  const [local, others] = splitProps(props, ["children", "class", "hideLabel"])
  return (
    <Kobalte {...others} class={local.class} data-component="switch">
      <Kobalte.Input data-slot="switch-input" @lgcode/>
      <Show when={local.children}>
        {(label) => (
          <Kobalte.Label data-slot="switch-label" classList={{ "sr-only": local.hideLabel }}>
            {label()}
          <@lgcode/Kobalte.Label>
        )}
      <@lgcode/Show>
      <Kobalte.Control data-slot="switch-control">
        <Kobalte.Thumb data-slot="switch-thumb" @lgcode/>
      <@lgcode/Kobalte.Control>
      <Kobalte.ErrorMessage data-slot="switch-error" @lgcode/>
    <@lgcode/Kobalte>
  )
}
