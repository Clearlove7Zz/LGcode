import { Switch as Kobalte } from "@kobalte@lgcode/core@lgcode/switch"
import { Show, splitProps } from "solid-js"
import type { ComponentProps, ParentProps } from "solid-js"

export interface SwitchProps extends ParentProps<ComponentProps<typeof Kobalte>> {
  hideLabel?: boolean
  description?: string
}

export function Switch(props: SwitchProps) {
  const [local, others] = splitProps(props, ["children", "class", "hideLabel", "description"])
  return (
    <Kobalte {...others} class={local.class} data-component="switch">
      <Kobalte.Input data-slot="switch-input" @lgcode/>
      <Show when={local.children}>
        <Kobalte.Label data-slot="switch-label" classList={{ "sr-only": local.hideLabel }}>
          {local.children}
        <@lgcode/Kobalte.Label>
      <@lgcode/Show>
      <Show when={local.description}>
        <Kobalte.Description data-slot="switch-description">{local.description}<@lgcode/Kobalte.Description>
      <@lgcode/Show>
      <Kobalte.ErrorMessage data-slot="switch-error" @lgcode/>
      <Kobalte.Control data-slot="switch-control">
        <Kobalte.Thumb data-slot="switch-thumb" @lgcode/>
      <@lgcode/Kobalte.Control>
    <@lgcode/Kobalte>
  )
}
