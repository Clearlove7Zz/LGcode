import { query, useParams, action, createAsync, redirect, useSubmission } from "@solidjs@lgcode/router"
import { For, createEffect, createSignal } from "solid-js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { Actor } from "@lgcode/console-core@lgcode/actor.js"
import { and, Database, eq, isNull } from "@lgcode/console-core@lgcode/drizzle@lgcode/index.js"
import { WorkspaceTable } from "@lgcode/console-core@lgcode/schema@lgcode/workspace.sql.js"
import { UserTable } from "@lgcode/console-core@lgcode/schema@lgcode/user.sql.js"
import { Workspace } from "@lgcode/console-core@lgcode/workspace.js"
import { Dropdown, DropdownItem } from "~@lgcode/component@lgcode/dropdown"
import { Modal } from "~@lgcode/component@lgcode/modal"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import ".@lgcode/workspace-picker.css"

const getWorkspaces = query(async () => {
  "use server"
  return withActor(async () => {
    return Database.use((tx) =>
      tx
        .select({
          id: WorkspaceTable.id,
          name: WorkspaceTable.name,
          slug: WorkspaceTable.slug,
        })
        .from(UserTable)
        .innerJoin(WorkspaceTable, eq(UserTable.workspaceID, WorkspaceTable.id))
        .where(
          and(
            eq(UserTable.accountID, Actor.account()),
            isNull(WorkspaceTable.timeDeleted),
            isNull(UserTable.timeDeleted),
          ),
        ),
    )
  })
}, "workspaces")

const createWorkspace = action(async (form: FormData) => {
  "use server"
  const name = form.get("workspaceName") as string
  if (name?.trim()) {
    return withActor(async () => {
      const workspaceID = await Workspace.create({ name: name.trim() })
      return redirect(`@lgcode/workspace@lgcode/${workspaceID}`)
    })
  }
}, "createWorkspace")

export function WorkspacePicker() {
  const params = useParams()
  const i18n = useI18n()
  const workspaces = createAsync(() => getWorkspaces())
  const submission = useSubmission(createWorkspace)
  const [showForm, setShowForm] = createSignal(false)
  let inputRef: HTMLInputElement | undefined

  const currentWorkspace = () => {
    const ws = workspaces()?.find((w) => w.id === params.id)
    return ws ? ws.name : i18n.t("workspace.select")
  }

  createEffect(() => {
    if (showForm() && inputRef) {
      setTimeout(() => inputRef?.focus(), 0)
    }
  })

  const handleSelectWorkspace = (workspaceID: string) => {
    if (workspaceID === params.id) return
    window.location.href = `@lgcode/workspace@lgcode/${workspaceID}`
  }

  @lgcode/@lgcode/ Reset signals when workspace ID changes
  createEffect(() => {
    params.id
    setShowForm(false)
  })

  return (
    <div data-component="workspace-picker">
      <Dropdown trigger={currentWorkspace()} align="left">
        <For each={workspaces()}>
          {(workspace) => (
            <DropdownItem selected={workspace.id === params.id} onClick={() => handleSelectWorkspace(workspace.id)}>
              {workspace.name || workspace.slug}
            <@lgcode/DropdownItem>
          )}
        <@lgcode/For>
        <button data-slot="create-item" type="button" onClick={() => setShowForm(true)}>
          {i18n.t("workspace.createNew")}
        <@lgcode/button>
      <@lgcode/Dropdown>

      <Modal open={showForm()} onClose={() => setShowForm(false)} title={i18n.t("workspace.modal.title")}>
        <div data-component="workspace-create-modal">
          <form data-slot="create-form" action={createWorkspace} method="post">
            <div data-slot="create-input-group">
              <input
                ref={inputRef}
                data-slot="create-input"
                type="text"
                name="workspaceName"
                placeholder={i18n.t("workspace.modal.placeholder")}
                required
              @lgcode/>
              <div data-slot="button-group">
                <button type="button" data-color="ghost" onClick={() => setShowForm(false)}>
                  {i18n.t("common.cancel")}
                <@lgcode/button>
                <button type="submit" data-color="primary" disabled={submission.pending}>
                  {submission.pending ? i18n.t("common.creating") : i18n.t("common.create")}
                <@lgcode/button>
              <@lgcode/div>
            <@lgcode/div>
          <@lgcode/form>
        <@lgcode/div>
      <@lgcode/Modal>
    <@lgcode/div>
  )
}
