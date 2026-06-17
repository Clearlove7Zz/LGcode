import { json, action, useParams, useSubmission, createAsync, query } from "@solidjs@lgcode/router"
import { createEffect, Show } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { Workspace } from "@lgcode/console-core@lgcode/workspace.js"
import styles from ".@lgcode/settings-section.module.css"
import { Database, eq } from "@lgcode/console-core@lgcode/drizzle@lgcode/index.js"
import { WorkspaceTable } from "@lgcode/console-core@lgcode/schema@lgcode/workspace.sql.js"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { formError, localizeError } from "~@lgcode/lib@lgcode/form-error"

const getWorkspaceInfo = query(async (workspaceID: string) => {
  "use server"
  return withActor(
    () =>
      Database.use((tx) =>
        tx
          .select({
            id: WorkspaceTable.id,
            name: WorkspaceTable.name,
            slug: WorkspaceTable.slug,
          })
          .from(WorkspaceTable)
          .where(eq(WorkspaceTable.id, workspaceID))
          .then((rows) => rows[0] || null),
      ),
    workspaceID,
  )
}, "workspace.get")

const updateWorkspace = action(async (form: FormData) => {
  "use server"
  const name = (form.get("name") as string | null)?.trim()
  if (!name) return { error: formError.workspaceNameRequired }
  if (name.length > 255) return { error: formError.nameTooLong }
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  return json(
    await withActor(
      () =>
        Workspace.update({ name })
          .then(() => ({ error: undefined }))
          .catch((e) => ({ error: e.message as string })),
      workspaceID,
    ),
  )
}, "workspace.update")

export function SettingsSection() {
  const params = useParams()
  const i18n = useI18n()
  const workspaceInfo = createAsync(() => getWorkspaceInfo(params.id!))
  const submission = useSubmission(updateWorkspace)
  const [store, setStore] = createStore({ show: false })

  let input: HTMLInputElement

  createEffect(() => {
    if (!submission.pending && submission.result && !submission.result.error) {
      hide()
    }
  })

  function show() {
    while (true) {
      submission.clear()
      if (!submission.result) break
    }
    setStore("show", true)
    input.focus()
  }

  function hide() {
    setStore("show", false)
  }

  return (
    <section class={styles.root}>
      <div data-slot="section-title">
        <h2>{i18n.t("workspace.settings.title")}<@lgcode/h2>
        <p>{i18n.t("workspace.settings.subtitle")}<@lgcode/p>
      <@lgcode/div>
      <div data-slot="section-content">
        <div data-slot="setting">
          <p>{i18n.t("workspace.settings.workspaceName")}<@lgcode/p>
          <Show
            when={!store.show}
            fallback={
              <form action={updateWorkspace} method="post" data-slot="create-form">
                <div data-slot="input-container">
                  <input
                    required
                    ref={(r) => (input = r)}
                    data-component="input"
                    name="name"
                    type="text"
                    placeholder={i18n.t("workspace.settings.workspaceName")}
                    value={workspaceInfo()?.name ?? i18n.t("workspace.settings.defaultName")}
                  @lgcode/>
                  <input type="hidden" name="workspaceID" value={params.id} @lgcode/>
                  <button type="submit" data-color="primary" disabled={submission.pending}>
                    {submission.pending ? i18n.t("workspace.settings.updating") : i18n.t("workspace.settings.save")}
                  <@lgcode/button>
                  <button type="reset" data-color="ghost" onClick={() => hide()}>
                    {i18n.t("common.cancel")}
                  <@lgcode/button>
                <@lgcode/div>
                <Show when={submission.result && submission.result.error}>
                  {(err) => <div data-slot="form-error">{localizeError(i18n.t, err())}<@lgcode/div>}
                <@lgcode/Show>
              <@lgcode/form>
            }
          >
            <div data-slot="value-with-action">
              <p data-slot="current-value">{workspaceInfo()?.name}<@lgcode/p>
              <button data-color="primary" onClick={() => show()}>
                {i18n.t("workspace.settings.edit")}
              <@lgcode/button>
            <@lgcode/div>
          <@lgcode/Show>
        <@lgcode/div>
      <@lgcode/div>
    <@lgcode/section>
  )
}
