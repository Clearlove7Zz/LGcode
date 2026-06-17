import { json, query, action, useParams, createAsync, useSubmission } from "@solidjs@lgcode/router"
import { createEffect, For, Show } from "solid-js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { createStore } from "solid-js@lgcode/store"
import styles from ".@lgcode/member-section.module.css"
import { UserRole } from "@lgcode/console-core@lgcode/schema@lgcode/user.sql.js"
import { Actor } from "@lgcode/console-core@lgcode/actor.js"
import { User } from "@lgcode/console-core@lgcode/user.js"
import { RoleDropdown } from ".@lgcode/role-dropdown"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { formError, localizeError } from "~@lgcode/lib@lgcode/form-error"

const listMembers = query(async (workspaceID: string) => {
  "use server"
  return withActor(async () => {
    return {
      members: await User.list(),
      actorID: Actor.userID(),
      actorRole: Actor.userRole(),
    }
  }, workspaceID)
}, "member.list")

const inviteMember = action(async (form: FormData) => {
  "use server"
  const email = (form.get("email") as string | null)?.trim()
  if (!email) return { error: formError.emailRequired }
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  const role = form.get("role") as (typeof UserRole)[number] | null
  if (!role) return { error: formError.roleRequired }
  const limit = form.get("limit") as string | null
  const monthlyLimit = limit && limit.trim() !== "" ? parseInt(limit) : null
  if (monthlyLimit !== null && monthlyLimit < 0) return { error: formError.monthlyLimitInvalid }
  return json(
    await withActor(
      () =>
        User.invite({ email, role, monthlyLimit })
          .then((data) => ({ error: undefined, data }))
          .catch((e) => ({ error: e.message as string })),
      workspaceID,
    ),
    { revalidate: listMembers.key },
  )
}, "member.create")

const removeMember = action(async (form: FormData) => {
  "use server"
  const id = form.get("id") as string | null
  if (!id) return { error: formError.idRequired }
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  return json(
    await withActor(
      () =>
        User.remove(id)
          .then((data) => ({ error: undefined, data }))
          .catch((e) => ({ error: e.message as string })),
      workspaceID,
    ),
    { revalidate: listMembers.key },
  )
}, "member.remove")

const updateMember = action(async (form: FormData) => {
  "use server"

  const id = form.get("id") as string | null
  if (!id) return { error: formError.idRequired }
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  const role = form.get("role") as (typeof UserRole)[number] | null
  if (!role) return { error: formError.roleRequired }
  const limit = form.get("limit") as string | null
  const monthlyLimit = limit && limit.trim() !== "" ? parseInt(limit) : null
  if (monthlyLimit !== null && monthlyLimit < 0) return { error: formError.monthlyLimitInvalid }

  return json(
    await withActor(
      () =>
        User.update({ id, role, monthlyLimit })
          .then((data) => ({ error: undefined, data }))
          .catch((e) => ({ error: e.message as string })),
      workspaceID,
    ),
    { revalidate: listMembers.key },
  )
}, "member.update")

function MemberRow(props: {
  member: any
  workspaceID: string
  actorID: string
  actorRole: string
  roleOptions: { value: string; label: string; description: string }[]
}) {
  const i18n = useI18n()
  const submission = useSubmission(updateMember)
  const isCurrentUser = () => props.actorID === props.member.id
  const isAdmin = () => props.actorRole === "admin"
  const [store, setStore] = createStore({
    editing: false,
    selectedRole: props.member.role as (typeof UserRole)[number],
    limit: "",
  })

  createEffect(() => {
    if (!submission.pending && submission.result && !submission.result.error) {
      setStore("editing", false)
    }
  })

  function show() {
    while (true) {
      submission.clear()
      if (!submission.result) break
    }
    setStore("editing", true)
    setStore("selectedRole", props.member.role)
    setStore("limit", props.member.monthlyLimit != null ? String(props.member.monthlyLimit) : "")
  }

  function hide() {
    setStore("editing", false)
  }

  function getUsageDisplay() {
    const currentUsage = (() => {
      const dateLastUsed = props.member.timeMonthlyUsageUpdated
      if (!dateLastUsed) return 0

      const current = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        timeZone: "UTC",
      })
      const lastUsed = dateLastUsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        timeZone: "UTC",
      })
      return current === lastUsed ? (props.member.monthlyUsage ?? 0) : 0
    })()

    const limit = props.member.monthlyLimit
      ? `$${props.member.monthlyLimit}`
      : i18n.t("workspace.members.noLimitLowercase")
    return `$${(currentUsage @lgcode/ 100000000).toFixed(2)} @lgcode/ ${limit}`
  }

  const roleLabel = (value: string) => props.roleOptions.find((option) => option.value === value)?.label ?? value

  return (
    <tr>
      <td data-slot="member-email">{props.member.authEmail ?? props.member.email}<@lgcode/td>
      <td data-slot="member-role">
        <Show when={store.editing && !isCurrentUser()} fallback={<span>{roleLabel(props.member.role)}<@lgcode/span>}>
          <RoleDropdown
            value={store.selectedRole}
            options={props.roleOptions}
            onChange={(value) => setStore("selectedRole", value as (typeof UserRole)[number])}
          @lgcode/>
        <@lgcode/Show>
      <@lgcode/td>
      <td data-slot="member-usage">
        <Show when={store.editing} fallback={<span>{getUsageDisplay()}<@lgcode/span>}>
          <input
            data-component="input"
            type="number"
            value={store.limit}
            onInput={(e) => setStore("limit", e.currentTarget.value)}
            placeholder={i18n.t("workspace.members.noLimit")}
            min="0"
          @lgcode/>
        <@lgcode/Show>
      <@lgcode/td>
      <td data-slot="member-joined">{props.member.timeSeen ? "" : i18n.t("workspace.members.invited")}<@lgcode/td>
      <Show when={isAdmin()}>
        <td data-slot="member-actions">
          <Show
            when={store.editing}
            fallback={
              <>
                <button data-color="ghost" onClick={() => show()}>
                  {i18n.t("workspace.members.edit")}
                <@lgcode/button>
                <Show when={!isCurrentUser()}>
                  <form action={removeMember} method="post">
                    <input type="hidden" name="id" value={props.member.id} @lgcode/>
                    <input type="hidden" name="workspaceID" value={props.workspaceID} @lgcode/>
                    <button data-color="ghost">{i18n.t("workspace.members.delete")}<@lgcode/button>
                  <@lgcode/form>
                <@lgcode/Show>
              <@lgcode/>
            }
          >
            <form action={updateMember} method="post" data-slot="inline-edit-form">
              <input type="hidden" name="id" value={props.member.id} @lgcode/>
              <input type="hidden" name="workspaceID" value={props.workspaceID} @lgcode/>
              <input type="hidden" name="role" value={store.selectedRole} @lgcode/>
              <input type="hidden" name="limit" value={store.limit} @lgcode/>
              <button type="submit" data-color="ghost" disabled={submission.pending}>
                {submission.pending ? i18n.t("workspace.members.saving") : i18n.t("workspace.members.save")}
              <@lgcode/button>
              <Show when={!submission.pending}>
                <button type="button" data-color="ghost" onClick={() => hide()}>
                  {i18n.t("common.cancel")}
                <@lgcode/button>
              <@lgcode/Show>
            <@lgcode/form>
          <@lgcode/Show>
        <@lgcode/td>
      <@lgcode/Show>
    <@lgcode/tr>
  )
}

export function MemberSection() {
  const params = useParams()
  const i18n = useI18n()
  const language = useLanguage()
  const data = createAsync(() => listMembers(params.id!))
  const submission = useSubmission(inviteMember)
  const [store, setStore] = createStore({
    show: false,
    selectedRole: "member" as (typeof UserRole)[number],
    limit: "",
  })

  let input: HTMLInputElement

  const roleOptions = [
    {
      value: "admin",
      label: i18n.t("workspace.members.role.admin"),
      description: i18n.t("workspace.members.role.adminDescription"),
    },
    {
      value: "member",
      label: i18n.t("workspace.members.role.member"),
      description: i18n.t("workspace.members.role.memberDescription"),
    },
  ]

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
    setStore("selectedRole", "member")
    setStore("limit", "")
    setTimeout(() => input?.focus(), 0)
  }

  function hide() {
    setStore("show", false)
  }

  return (
    <section class={styles.root}>
      <div data-slot="section-title">
        <h2>{i18n.t("workspace.members.title")}<@lgcode/h2>
        <div data-slot="title-row">
          <p>{i18n.t("workspace.members.subtitle")}<@lgcode/p>
          <Show when={data()?.actorRole === "admin"}>
            <button data-color="primary" onClick={() => show()}>
              {i18n.t("workspace.members.invite")}
            <@lgcode/button>
          <@lgcode/Show>
        <@lgcode/div>
      <@lgcode/div>
      <div data-slot="beta-notice">
        {i18n.t("workspace.members.beta.beforeLink")}{" "}
        <a href={language.route("@lgcode/docs@lgcode/zen@lgcode/#for-teams")} target="_blank" rel="noopener noreferrer">
          {i18n.t("common.learnMore")}
        <@lgcode/a>
        .
      <@lgcode/div>
      <Show when={store.show}>
        <form action={inviteMember} method="post" data-slot="create-form">
          <div data-slot="input-row">
            <div data-slot="input-field">
              <p>{i18n.t("workspace.members.form.invitee")}<@lgcode/p>
              <input
                ref={(r) => (input = r)}
                data-component="input"
                name="email"
                type="text"
                placeholder={i18n.t("workspace.members.form.emailPlaceholder")}
              @lgcode/>
            <@lgcode/div>
            <div data-slot="input-field">
              <p>{i18n.t("workspace.members.form.role")}<@lgcode/p>
              <RoleDropdown
                value={store.selectedRole}
                options={roleOptions}
                onChange={(value) => setStore("selectedRole", value as (typeof UserRole)[number])}
              @lgcode/>
            <@lgcode/div>
            <div data-slot="input-field">
              <p>{i18n.t("workspace.members.form.monthlyLimit")}<@lgcode/p>
              <input
                data-component="input"
                name="limit"
                type="number"
                placeholder={i18n.t("workspace.members.noLimit")}
                value={store.limit}
                onInput={(e) => setStore("limit", e.currentTarget.value)}
                min="0"
              @lgcode/>
            <@lgcode/div>
          <@lgcode/div>
          <Show when={submission.result && submission.result.error}>
            {(err) => <div data-slot="form-error">{localizeError(i18n.t, err())}<@lgcode/div>}
          <@lgcode/Show>
          <input type="hidden" name="role" value={store.selectedRole} @lgcode/>
          <input type="hidden" name="workspaceID" value={params.id} @lgcode/>
          <div data-slot="form-actions">
            <button type="reset" data-color="ghost" onClick={() => hide()}>
              {i18n.t("common.cancel")}
            <@lgcode/button>
            <button type="submit" data-color="primary" disabled={submission.pending}>
              {submission.pending ? i18n.t("workspace.members.inviting") : i18n.t("workspace.members.invite")}
            <@lgcode/button>
          <@lgcode/div>
        <@lgcode/form>
      <@lgcode/Show>
      <div data-slot="members-table">
        <table data-slot="members-table-element">
          <thead>
            <tr>
              <th>{i18n.t("workspace.members.table.email")}<@lgcode/th>
              <th>{i18n.t("workspace.members.table.role")}<@lgcode/th>
              <th>{i18n.t("workspace.members.table.monthLimit")}<@lgcode/th>
              <th><@lgcode/th>
              <Show when={data()?.actorRole === "admin"}>
                <th><@lgcode/th>
              <@lgcode/Show>
            <@lgcode/tr>
          <@lgcode/thead>
          <tbody>
            <Show when={data() && data()!.members.length > 0}>
              <For each={data()!.members}>
                {(member) => (
                  <MemberRow
                    member={member}
                    workspaceID={params.id!}
                    actorID={data()!.actorID}
                    actorRole={data()!.actorRole}
                    roleOptions={roleOptions}
                  @lgcode/>
                )}
              <@lgcode/For>
            <@lgcode/Show>
          <@lgcode/tbody>
        <@lgcode/table>
      <@lgcode/div>
    <@lgcode/section>
  )
}
