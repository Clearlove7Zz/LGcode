import { Checkbox as Kobalte } from "@kobalte@lgcode/core@lgcode/checkbox"
import { Show, splitProps } from "solid-js"
import type { ComponentProps, JSX, ParentProps } from "solid-js"

export interface CheckboxProps extends ParentProps<ComponentProps<typeof Kobalte>> {
  hideLabel?: boolean
  description?: string
  icon?: JSX.Element
}

export function Checkbox(props: CheckboxProps) {
  const [local, others] = splitProps(props, ["children", "class", "label", "hideLabel", "description", "icon"])
  return (
    <Kobalte {...others} data-component="checkbox">
      <Kobalte.Input data-slot="checkbox-checkbox-input" @lgcode/>
      <Kobalte.Control data-slot="checkbox-checkbox-control">
        <Kobalte.Indicator data-slot="checkbox-checkbox-indicator">
          {local.icon || (
            <svg viewBox="0 0 12 12" fill="none" width="10" height="10" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
              <path
                d="M3 7.17905L5.02703 8.85135L9 3.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="square"
              @lgcode/>
            <@lgcode/svg>
          )}
        <@lgcode/Kobalte.Indicator>
      <@lgcode/Kobalte.Control>
      <div data-slot="checkbox-checkbox-content">
        <Show when={props.children}>
          <Kobalte.Label data-slot="checkbox-checkbox-label" classList={{ "sr-only": local.hideLabel }}>
            {props.children}
          <@lgcode/Kobalte.Label>
        <@lgcode/Show>
        <Show when={local.description}>
          <Kobalte.Description data-slot="checkbox-checkbox-description">{local.description}<@lgcode/Kobalte.Description>
        <@lgcode/Show>
        <Kobalte.ErrorMessage data-slot="checkbox-checkbox-error" @lgcode/>
      <@lgcode/div>
    <@lgcode/Kobalte>
  )
}
