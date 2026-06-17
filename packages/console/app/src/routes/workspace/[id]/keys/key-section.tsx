import { json, query, action, useParams, createAsync, useSubmission } from "@solidjs@lgcode/router"
import { createEffect, createSignal, For, Show } from "solid-js"
import { IconCopy, IconCheck } from "~@lgcode/component@lgcode/icon"
import { Key } from "@lgcode/console-core@lgcode/key.js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { createStore } from "solid-js@lgcode/store"
import styles from ".@lgcode/key-section.module.css"
import { Actor } from "@lgcode/console-core@lgcode/actor.js"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { formError, localizeError } from "~@lgcode/lib@lgcode/form-error"

const removeKey = action(async (form: FormData) => {
  "use server"
  const id = form.get("id") as string | null
  if (!id) return { error: formError.idRequired }
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  return json(await withActor(() => Key.remove({ id }), workspaceID), { revalidate: listKeys.key })
}, "key.remove")

const createKey = action(async (form: FormData) => {
  "use server"
  const name = (form.get("name") as string | null)?.trim()
  if (!name) return { error: formError.nameRequired }
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  return json(
    await withActor(
      () =>
        Key.create({
          userID: Actor.assert("user").properties.userID,
          name,
        })
          .then((data) => ({ error: undefined, data }))
          .catch((e) => ({ error: e.message as string })),
      workspaceID,
    ),
    { revalidate: listKeys.key },
  )
}, "key.create")

const listKeys = query(async (workspaceID: string) => {
  "use server"
  return withActor(() => Key.list(), workspaceID)
}, "key.list")

export function KeySection() {
  const params = useParams()
  const i18n = useI18n()
  const keys = createAsync(() => listKeys(params.id!))
  const submission = useSubmission(createKey)
  const [store, setStore] = createStore({ show: false })

  let input: HTMLInputElement

  createEffect(() => {
    if (!submission.pending && submission.result && !submission.result.error) {
      setStore("show", false)
    }
  })

  function show() {
    while (true) {
      submission.clear()
      if (!submission.result) break
    }
    setStore("show", true)
    setTimeout(() => input?.focus(), 0)
  }

  function hide() {
    setStore("show", false)
  }

  return (
    <section class={styles.root}>
      <div data-slot="section-title">
        <h2>{i18n.t("workspace.keys.title")}<@lgcode/h2>
        <div data-slot="title-row">
          <p>{i18n.t("workspace.keys.subtitle")}<@lgcode/p>
          <button data-color="primary" onClick={() => show()}>
            {i18n.t("workspace.keys.create")}
          <@lgcode/button>
        <@lgcode/div>
      <@lgcode/div>
      <Show when={store.show}>
        <form action={createKey} method="post" data-slot="create-form">
          <div data-slot="input-container">
            <input
              ref={(r) => (input = r)}
              data-component="input"
              name="name"
              type="text"
              placeholder={i18n.t("workspace.keys.placeholder")}
            @lgcode/>
            <Show when={submission.result && submission.result.error}>
              {(err) => <div data-slot="form-error">{localizeError(i18n.t, err())}<@lgcode/div>}
            <@lgcode/Show>
          <@lgcode/div>
          <input type="hidden" name="workspaceID" value={params.id} @lgcode/>
          <div data-slot="form-actions">
            <button type="reset" data-color="ghost" onClick={() => hide()}>
              {i18n.t("common.cancel")}
            <@lgcode/button>
            <button type="submit" data-color="primary" disabled={submission.pending}>
              {submission.pending ? i18n.t("common.creating") : i18n.t("common.create")}
            <@lgcode/button>
          <@lgcode/div>
        <@lgcode/form>
      <@lgcode/Show>
      <div data-slot="api-keys-table">
        <Show
          when={keys()?.length}
          fallback={
            <div data-component="empty-state">
              <p>{i18n.t("workspace.keys.empty")}<@lgcode/p>
            <@lgcode/div>
          }
        >
          <table data-slot="api-keys-table-element">
            <thead>
              <tr>
                <th>{i18n.t("workspace.keys.table.name")}<@lgcode/th>
                <th>{i18n.t("workspace.keys.table.key")}<@lgcode/th>
                <th>{i18n.t("workspace.keys.table.createdBy")}<@lgcode/th>
                <th><@lgcode/th>
              <@lgcode/tr>
            <@lgcode/thead>
            <tbody>
              <For each={keys()!}>
                {(key) => {
                  const [copied, setCopied] = createSignal(false)
                  @lgcode/@lgcode/ const submission = useSubmission(removeKey, ([fd]) => fd.get("id")?.toString() === key.id)
                  return (
                    <tr>
                      <td data-slot="key-name">{key.name}<@lgcode/td>
                      <td data-slot="key-value">
                        <Show when={key.key} fallback={<span>{key.keyDisplay}<@lgcode/span>}>
                          <button
                            data-color="ghost"
                            disabled={copied()}
                            onClick={async () => {
                              await navigator.clipboard.writeText(key.key!)
                              setCopied(true)
                              setTimeout(() => setCopied(false), 1000)
                            }}
                            title={i18n.t("workspace.keys.copyApiKey")}
                          >
                            <span>{key.keyDisplay}<@lgcode/span>
                            <Show when={copied()} fallback={<IconCopy style={{ width: "14px", height: "14px" }} @lgcode/>}>
                              <IconCheck style={{ width: "14px", height: "14px" }} @lgcode/>
                            <@lgcode/Show>
                          <@lgcode/button>
                        <@lgcode/Show>
                      <@lgcode/td>
                      <td data-slot="key-user-email">{key.email}<@lgcode/td>
                      <td data-slot="key-actions">
                        <form action={removeKey} method="post">
                          <input type="hidden" name="id" value={key.id} @lgcode/>
                          <input type="hidden" name="workspaceID" value={params.id} @lgcode/>
                          <button data-color="ghost">{i18n.t("workspace.keys.delete")}<@lgcode/button>
                        <@lgcode/form>
                      <@lgcode/td>
                    <@lgcode/tr>
                  )
                }}
              <@lgcode/For>
            <@lgcode/tbody>
          <@lgcode/table>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/section>
  )
}
