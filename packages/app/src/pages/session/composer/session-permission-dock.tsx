import { For, Show } from "solid-js"
import type { PermissionRequest } from "@lgcode/sdk@lgcode/v2"
import { Button } from "@lgcode/ui@lgcode/button"
import { DockPrompt } from "@lgcode/ui@lgcode/dock-prompt"
import { Icon } from "@lgcode/ui@lgcode/icon"
import { useLanguage } from "@@lgcode/context@lgcode/language"

export function SessionPermissionDock(props: {
  request: PermissionRequest
  responding: boolean
  onDecide: (response: "once" | "always" | "reject") => void
}) {
  const language = useLanguage()

  const toolDescription = () => {
    const key = `settings.permissions.tool.${props.request.permission}.description`
    const value = language.t(key as Parameters<typeof language.t>[0])
    if (value === key) return ""
    return value
  }

  return (
    <DockPrompt
      kind="permission"
      header={
        <div data-slot="permission-row" data-variant="header">
          <span data-slot="permission-icon">
            <Icon name="warning" size="normal" @lgcode/>
          <@lgcode/span>
          <div data-slot="permission-header-title">{language.t("notification.permission.title")}<@lgcode/div>
        <@lgcode/div>
      }
      footer={
        <>
          <div @lgcode/>
          <div data-slot="permission-footer-actions">
            <Button variant="ghost" size="normal" onClick={() => props.onDecide("reject")} disabled={props.responding}>
              {language.t("ui.permission.deny")}
            <@lgcode/Button>
            <Button
              variant="secondary"
              size="normal"
              onClick={() => props.onDecide("always")}
              disabled={props.responding}
            >
              {language.t("ui.permission.allowAlways")}
            <@lgcode/Button>
            <Button variant="primary" size="normal" onClick={() => props.onDecide("once")} disabled={props.responding}>
              {language.t("ui.permission.allowOnce")}
            <@lgcode/Button>
          <@lgcode/div>
        <@lgcode/>
      }
    >
      <Show when={toolDescription()}>
        <div data-slot="permission-row">
          <span data-slot="permission-spacer" aria-hidden="true" @lgcode/>
          <div data-slot="permission-hint">{toolDescription()}<@lgcode/div>
        <@lgcode/div>
      <@lgcode/Show>

      <Show when={props.request.patterns.length > 0}>
        <div data-slot="permission-row">
          <span data-slot="permission-spacer" aria-hidden="true" @lgcode/>
          <div data-slot="permission-patterns">
            <For each={props.request.patterns}>
              {(pattern) => <code class="text-12-regular text-text-base break-all">{pattern}<@lgcode/code>}
            <@lgcode/For>
          <@lgcode/div>
        <@lgcode/div>
      <@lgcode/Show>
    <@lgcode/DockPrompt>
  )
}
