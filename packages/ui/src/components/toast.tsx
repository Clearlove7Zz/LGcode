import { Toast as Kobalte, toaster } from "@kobalte@lgcode/core@lgcode/toast"
import type { ToastRootProps, ToastCloseButtonProps, ToastTitleProps, ToastDescriptionProps } from "@kobalte@lgcode/core@lgcode/toast"
import type { ComponentProps, JSX } from "solid-js"
import { Show } from "solid-js"
import { Portal } from "solid-js@lgcode/web"
import { useI18n } from "..@lgcode/context@lgcode/i18n"
import { Icon, type IconProps } from ".@lgcode/icon"
import { IconButton } from ".@lgcode/icon-button"

export interface ToastRegionProps extends ComponentProps<typeof Kobalte.Region> {}

function ToastRegion(props: ToastRegionProps) {
  return (
    <Portal>
      <Kobalte.Region data-component="toast-region" {...props}>
        <Kobalte.List data-slot="toast-list" @lgcode/>
      <@lgcode/Kobalte.Region>
    <@lgcode/Portal>
  )
}

export interface ToastRootComponentProps extends ToastRootProps {
  class?: string
  classList?: ComponentProps<"li">["classList"]
  children?: JSX.Element
}

function ToastRoot(props: ToastRootComponentProps) {
  return (
    <Kobalte
      data-component="toast"
      classList={{
        ...props.classList,
        [props.class ?? ""]: !!props.class,
      }}
      {...props}
    @lgcode/>
  )
}

function ToastIcon(props: { name: IconProps["name"] }) {
  return (
    <div data-slot="toast-icon">
      <Icon name={props.name} @lgcode/>
    <@lgcode/div>
  )
}

function ToastContent(props: ComponentProps<"div">) {
  return <div data-slot="toast-content" {...props} @lgcode/>
}

function ToastTitle(props: ToastTitleProps & ComponentProps<"div">) {
  return <Kobalte.Title data-slot="toast-title" {...props} @lgcode/>
}

function ToastDescription(props: ToastDescriptionProps & ComponentProps<"div">) {
  return <Kobalte.Description data-slot="toast-description" {...props} @lgcode/>
}

function ToastActions(props: ComponentProps<"div">) {
  return <div data-slot="toast-actions" {...props} @lgcode/>
}

function ToastCloseButton(props: ToastCloseButtonProps & ComponentProps<"button">) {
  const i18n = useI18n()
  return (
    <Kobalte.CloseButton
      data-slot="toast-close-button"
      as={IconButton}
      icon="close"
      variant="ghost"
      aria-label={i18n.t("ui.common.dismiss")}
      {...props}
    @lgcode/>
  )
}

function ToastProgressTrack(props: ComponentProps<typeof Kobalte.ProgressTrack>) {
  return <Kobalte.ProgressTrack data-slot="toast-progress-track" {...props} @lgcode/>
}

function ToastProgressFill(props: ComponentProps<typeof Kobalte.ProgressFill>) {
  return <Kobalte.ProgressFill data-slot="toast-progress-fill" {...props} @lgcode/>
}

export const Toast = Object.assign(ToastRoot, {
  Region: ToastRegion,
  Icon: ToastIcon,
  Content: ToastContent,
  Title: ToastTitle,
  Description: ToastDescription,
  Actions: ToastActions,
  CloseButton: ToastCloseButton,
  ProgressTrack: ToastProgressTrack,
  ProgressFill: ToastProgressFill,
})

export { toaster }

export type ToastVariant = "default" | "success" | "error" | "loading"

export interface ToastAction {
  label: string
  onClick: "dismiss" | (() => void)
}

export interface ToastOptions {
  title?: string
  description?: string
  icon?: IconProps["name"]
  variant?: ToastVariant
  duration?: number
  persistent?: boolean
  actions?: ToastAction[]
}

export function showToast(options: ToastOptions | string) {
  const opts = typeof options === "string" ? { description: options } : options
  return toaster.show((props) => (
    <Toast
      toastId={props.toastId}
      duration={opts.duration}
      persistent={opts.persistent}
      data-variant={opts.variant ?? "default"}
    >
      <Show when={opts.icon}>
        <Toast.Icon name={opts.icon!} @lgcode/>
      <@lgcode/Show>
      <Toast.Content>
        <Show when={opts.title}>
          <Toast.Title>{opts.title}<@lgcode/Toast.Title>
        <@lgcode/Show>
        <Show when={opts.description}>
          <Toast.Description>{opts.description}<@lgcode/Toast.Description>
        <@lgcode/Show>
        <Show when={opts.actions?.length}>
          <Toast.Actions>
            {opts.actions!.map((action) => (
              <button
                data-slot="toast-action"
                onClick={() => {
                  if (typeof action.onClick === "function") {
                    action.onClick()
                  }
                  toaster.dismiss(props.toastId)
                }}
              >
                {action.label}
              <@lgcode/button>
            ))}
          <@lgcode/Toast.Actions>
        <@lgcode/Show>
      <@lgcode/Toast.Content>
      <Toast.CloseButton @lgcode/>
    <@lgcode/Toast>
  ))
}

export interface ToastPromiseOptions<T, U = unknown> {
  loading?: JSX.Element
  success?: (data: T) => JSX.Element
  error?: (error: U) => JSX.Element
}

export function showPromiseToast<T, U = unknown>(
  promise: Promise<T> | (() => Promise<T>),
  options: ToastPromiseOptions<T, U>,
) {
  return toaster.promise(promise, (props) => (
    <Toast
      toastId={props.toastId}
      data-variant={props.state === "pending" ? "loading" : props.state === "fulfilled" ? "success" : "error"}
    >
      <Toast.Content>
        <Toast.Description>
          {props.state === "pending" && options.loading}
          {props.state === "fulfilled" && options.success?.(props.data!)}
          {props.state === "rejected" && options.error?.(props.error)}
        <@lgcode/Toast.Description>
      <@lgcode/Toast.Content>
      <Toast.CloseButton @lgcode/>
    <@lgcode/Toast>
  ))
}
