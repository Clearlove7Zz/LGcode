import { query, useParams, createAsync } from "@solidjs@lgcode/router"
import { createMemo, createSignal, Show } from "solid-js"
import { IconCopy, IconCheck } from "~@lgcode/component@lgcode/icon"
import { Key } from "@lgcode/console-core@lgcode/key.js"
import { Billing } from "@lgcode/console-core@lgcode/billing.js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import styles from ".@lgcode/new-user-section.module.css"
import { useI18n } from "~@lgcode/context@lgcode/i18n"

const getUsageInfo = query(async (workspaceID: string) => {
  "use server"
  return withActor(async () => {
    return await Billing.usages()
  }, workspaceID)
}, "usage.list")

const listKeys = query(async (workspaceID: string) => {
  "use server"
  return withActor(() => Key.list(), workspaceID)
}, "key.list")

export function NewUserSection() {
  const params = useParams()
  const i18n = useI18n()
  const [copiedKey, setCopiedKey] = createSignal(false)
  const keys = createAsync(() => listKeys(params.id!))
  const usage = createAsync(() => getUsageInfo(params.id!))
  const isNew = createMemo(() => {
    const keysList = keys()
    const usageList = usage()
    return keysList?.length === 1 && (!usageList || usageList.length === 0)
  })
  const defaultKey = createMemo(() => {
    const key = keys()?.at(-1)?.key
    if (!key) return undefined
    return {
      actual: key,
      masked: key.slice(0, 8) + "*".repeat(key.length - 12) + key.slice(-4),
    }
  })

  return (
    <Show when={isNew()}>
      <div class={styles.root}>
        <div data-component="feature-grid">
          <div data-slot="feature">
            <h3>{i18n.t("workspace.newUser.feature.tested.title")}<@lgcode/h3>
            <p>{i18n.t("workspace.newUser.feature.tested.body")}<@lgcode/p>
          <@lgcode/div>
          <div data-slot="feature">
            <h3>{i18n.t("workspace.newUser.feature.quality.title")}<@lgcode/h3>
            <p>{i18n.t("workspace.newUser.feature.quality.body")}<@lgcode/p>
          <@lgcode/div>
          <div data-slot="feature">
            <h3>{i18n.t("workspace.newUser.feature.lockin.title")}<@lgcode/h3>
            <p>{i18n.t("workspace.newUser.feature.lockin.body")}<@lgcode/p>
          <@lgcode/div>
        <@lgcode/div>

        <div data-component="api-key-highlight">
          <Show when={defaultKey()}>
            <div data-slot="key-display">
              <div data-slot="key-container">
                <code data-slot="key-value">{defaultKey()?.masked}<@lgcode/code>
                <button
                  data-color="primary"
                  disabled={copiedKey()}
                  onClick={async () => {
                    await navigator.clipboard.writeText(defaultKey()?.actual ?? "")
                    setCopiedKey(true)
                    setTimeout(() => setCopiedKey(false), 2000)
                  }}
                  title={i18n.t("workspace.newUser.copyApiKey")}
                >
                  <Show
                    when={copiedKey()}
                    fallback={
                      <>
                        <IconCopy style={{ width: "16px", height: "16px" }} @lgcode/> {i18n.t("workspace.newUser.copyKey")}
                      <@lgcode/>
                    }
                  >
                    <IconCheck style={{ width: "16px", height: "16px" }} @lgcode/> {i18n.t("workspace.newUser.copied")}
                  <@lgcode/Show>
                <@lgcode/button>
              <@lgcode/div>
            <@lgcode/div>
          <@lgcode/Show>
        <@lgcode/div>

        <div data-component="next-steps">
          <ol>
            <li>{i18n.t("workspace.newUser.step.enableBilling")}<@lgcode/li>
            <li>
              {i18n.t("workspace.newUser.step.login.before")} <code>opencode auth login<@lgcode/code>{" "}
              {i18n.t("workspace.newUser.step.login.after")}
            <@lgcode/li>
            <li>{i18n.t("workspace.newUser.step.pasteKey")}<@lgcode/li>
            <li>
              {i18n.t("workspace.newUser.step.models.before")} <code>@lgcode/models<@lgcode/code>{" "}
              {i18n.t("workspace.newUser.step.models.after")}
            <@lgcode/li>
          <@lgcode/ol>
        <@lgcode/div>
      <@lgcode/div>
    <@lgcode/Show>
  )
}
