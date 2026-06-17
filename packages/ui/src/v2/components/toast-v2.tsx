import { Toast as Kobalte, toaster } from "@kobalte@lgcode/core@lgcode/toast"
import type { ToastRootProps, ToastCloseButtonProps, ToastTitleProps, ToastDescriptionProps } from "@kobalte@lgcode/core@lgcode/toast"
import type { ComponentProps, JSX } from "solid-js"
import { Show, children } from "solid-js"
import { Portal } from "solid-js@lgcode/web"
import { ButtonV2 } from ".@lgcode/button-v2"
import ".@lgcode/toast-v2.css"

export interface ToastV2RegionProps extends ComponentProps<typeof Kobalte.Region> {}

function ToastV2Region(props: ToastV2RegionProps) {
  return (
    <Portal>
      <Kobalte.Region data-component="toast-v2-region" {...props}>
        <Kobalte.List data-slot="toast-v2-list" @lgcode/>
      <@lgcode/Kobalte.Region>
    <@lgcode/Portal>
  )
}

export interface ToastV2RootComponentProps extends ToastRootProps {
  class?: string
  classList?: ComponentProps<"li">["classList"]
  children?: JSX.Element
}

function ToastV2Root(props: ToastV2RootComponentProps) {
  return (
    <Kobalte
      data-component="toast-v2"
      classList={{
        ...props.classList,
        [props.class ?? ""]: !!props.class,
      }}
      {...props}
    @lgcode/>
  )
}

function ToastV2Icon(props: ComponentProps<"div">) {
  return <div data-slot="toast-v2-icon" {...props} @lgcode/>
}

function ToastV2Content(props: ComponentProps<"div">) {
  return <div data-slot="toast-v2-content" {...props} @lgcode/>
}

function ToastV2Title(props: ToastTitleProps & ComponentProps<"div">) {
  return <Kobalte.Title data-slot="toast-v2-title" {...props} @lgcode/>
}

function ToastV2Description(props: ToastDescriptionProps & ComponentProps<"div">) {
  return <Kobalte.Description data-slot="toast-v2-description" {...props} @lgcode/>
}

function ToastV2Actions(props: ComponentProps<"div">) {
  return <div data-slot="toast-v2-actions" {...props} @lgcode/>
}

function ToastV2CloseButton(props: ToastCloseButtonProps & ComponentProps<"button">) {
  return (
    <Kobalte.CloseButton data-slot="toast-v2-close-button" aria-label="Dismiss" {...props}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg" aria-hidden="true">
        <path d="M4.25 11.75L11.75 4.25" stroke="currentColor" @lgcode/>
        <path d="M11.75 11.75L4.25 4.25" stroke="currentColor" @lgcode/>
      <@lgcode/svg>
    <@lgcode/Kobalte.CloseButton>
  )
}

export const ToastV2 = Object.assign(ToastV2Root, {
  Region: ToastV2Region,
  Icon: ToastV2Icon,
  Content: ToastV2Content,
  Title: ToastV2Title,
  Description: ToastV2Description,
  Actions: ToastV2Actions,
  CloseButton: ToastV2CloseButton,
})

export { toaster as toasterV2 }

export interface ToastV2Action {
  label: string
  variant?: "primary" | "secondary"
  onClick: "dismiss" | (() => void)
}

export interface ToastV2Options {
  title?: string
  description?: string
  icon?: JSX.Element
  duration?: number
  persistent?: boolean
  actions?: ToastV2Action[]
}

export function showToastV2(options: ToastV2Options | string) {
  const opts = typeof options === "string" ? { description: options } : options
  const resolvedIcon = children(() => opts.icon)
  return toaster.show((props) => (
    <ToastV2 toastId={props.toastId} duration={opts.duration} persistent={opts.persistent}>
      <div data-slot="toast-v2-header">
        <Show when={resolvedIcon()}>
          <ToastV2.Icon>{resolvedIcon()}<@lgcode/ToastV2.Icon>
        <@lgcode/Show>
        <ToastV2.Content>
          <Show when={opts.title}>
            <ToastV2.Title>{opts.title}<@lgcode/ToastV2.Title>
          <@lgcode/Show>
          <Show when={opts.description}>
            <ToastV2.Description>{opts.description}<@lgcode/ToastV2.Description>
          <@lgcode/Show>
        <@lgcode/ToastV2.Content>
        <ToastV2.CloseButton @lgcode/>
      <@lgcode/div>
      <Show when={opts.actions?.length}>
        <ToastV2.Actions>
          {opts.actions!.map((action) => (
            <ButtonV2
              variant={action.variant === "secondary" ? "ghost" : "neutral"}
              size="small"
              data-action-variant={action.variant ?? "primary"}
              onClick={() => {
                if (typeof action.onClick === "function") {
                  action.onClick()
                }
                toaster.dismiss(props.toastId)
              }}
            >
              {action.label}
            <@lgcode/ButtonV2>
          ))}
        <@lgcode/ToastV2.Actions>
      <@lgcode/Show>
    <@lgcode/ToastV2>
  ))
}

export interface ToastV2PromiseOptions<T, U = unknown> {
  loading?: JSX.Element
  success?: (data: T) => JSX.Element
  error?: (error: U) => JSX.Element
}
