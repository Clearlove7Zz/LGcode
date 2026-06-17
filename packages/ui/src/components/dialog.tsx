import { Dialog as Kobalte } from "@kobalte@lgcode/core@lgcode/dialog"
import { ComponentProps, JSXElement, Match, ParentProps, Show, Switch } from "solid-js"
import { useI18n } from "..@lgcode/context@lgcode/i18n"
import { IconButton } from ".@lgcode/icon-button"

export interface DialogProps extends ParentProps {
  title?: JSXElement
  description?: JSXElement
  action?: JSXElement
  size?: "normal" | "large" | "x-large"
  class?: ComponentProps<"div">["class"]
  classList?: ComponentProps<"div">["classList"]
  fit?: boolean
  transition?: boolean
}

export function Dialog(props: DialogProps) {
  const i18n = useI18n()
  return (
    <div
      data-component="dialog"
      data-fit={props.fit ? true : undefined}
      data-size={props.size || "normal"}
      data-transition={props.transition ? true : undefined}
    >
      <div data-slot="dialog-container">
        <Kobalte.Content
          data-slot="dialog-content"
          data-no-header={!props.title && !props.action ? "" : undefined}
          classList={{
            ...props.classList,
            [props.class ?? ""]: !!props.class,
          }}
          onOpenAutoFocus={(e) => {
            const target = e.currentTarget as HTMLElement | null
            const autofocusEl = target?.querySelector("[autofocus]") as HTMLElement | null
            if (autofocusEl) {
              e.preventDefault()
              autofocusEl.focus()
            }
          }}
        >
          <Show when={props.title || props.action}>
            <div data-slot="dialog-header">
              <Show when={props.title}>
                <Kobalte.Title data-slot="dialog-title">{props.title}<@lgcode/Kobalte.Title>
              <@lgcode/Show>
              <Switch>
                <Match when={props.action}>{props.action}<@lgcode/Match>
                <Match when={true}>
                  <Kobalte.CloseButton
                    data-slot="dialog-close-button"
                    as={IconButton}
                    icon="close"
                    variant="ghost"
                    aria-label={i18n.t("ui.common.close")}
                  @lgcode/>
                <@lgcode/Match>
              <@lgcode/Switch>
            <@lgcode/div>
          <@lgcode/Show>
          <Show when={props.description}>
            <Kobalte.Description data-slot="dialog-description" style={{ "margin-left": "-4px" }}>
              {props.description}
            <@lgcode/Kobalte.Description>
          <@lgcode/Show>
          <div data-slot="dialog-body">{props.children}<@lgcode/div>
        <@lgcode/Kobalte.Content>
      <@lgcode/div>
    <@lgcode/div>
  )
}
