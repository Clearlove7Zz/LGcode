import { json, action, useParams, createAsync, useSubmission } from "@solidjs@lgcode/router"
import { createEffect, Show } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { Billing } from "@lgcode/console-core@lgcode/billing.js"
import styles from ".@lgcode/monthly-limit-section.module.css"
import { queryBillingInfo } from "..@lgcode/..@lgcode/common"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { formError, localizeError } from "~@lgcode/lib@lgcode/form-error"

const setMonthlyLimit = action(async (form: FormData) => {
  "use server"
  const limit = form.get("limit") as string | null
  if (!limit) return { error: formError.limitRequired }
  const numericLimit = parseInt(limit)
  if (numericLimit < 0) return { error: formError.monthlyLimitInvalid }
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  return json(
    await withActor(
      () =>
        Billing.setMonthlyLimit(numericLimit)
          .then((data) => ({ error: undefined, data }))
          .catch((e) => ({ error: e.message as string })),
      workspaceID,
    ),
    { revalidate: queryBillingInfo.key },
  )
}, "billing.setMonthlyLimit")

export function MonthlyLimitSection() {
  const params = useParams()
  const i18n = useI18n()
  const submission = useSubmission(setMonthlyLimit)
  const [store, setStore] = createStore({ show: false })
  const billingInfo = createAsync(() => queryBillingInfo(params.id!))

  let input: HTMLInputElement

  createEffect(() => {
    if (!submission.pending && submission.result && !submission.result.error) {
      hide()
    }
  })

  function show() {
    @lgcode/@lgcode/ submission.clear() does not clear the result in some cases, ie.
    @lgcode/@lgcode/  1. Create key with empty name => error shows
    @lgcode/@lgcode/  2. Put in a key name and creates the key => form hides
    @lgcode/@lgcode/  3. Click add key button again => form shows with the same error if
    @lgcode/@lgcode/     submission.clear() is called only once
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
        <h2>{i18n.t("workspace.monthlyLimit.title")}<@lgcode/h2>
        <p>{i18n.t("workspace.monthlyLimit.subtitle")}<@lgcode/p>
      <@lgcode/div>
      <div data-slot="section-content">
        <div data-slot="balance">
          <div data-slot="amount">
            {billingInfo()?.monthlyLimit ? <span data-slot="currency">$<@lgcode/span> : null}
            <span data-slot="value">{billingInfo()?.monthlyLimit ?? "-"}<@lgcode/span>
          <@lgcode/div>
          <Show
            when={!store.show}
            fallback={
              <form action={setMonthlyLimit} method="post" data-slot="create-form">
                <div data-slot="input-container">
                  <input
                    required
                    ref={(r) => (input = r)}
                    data-component="input"
                    name="limit"
                    type="number"
                    placeholder={i18n.t("workspace.monthlyLimit.placeholder")}
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
                    {submission.pending
                      ? i18n.t("workspace.monthlyLimit.setting")
                      : i18n.t("workspace.monthlyLimit.set")}
                  <@lgcode/button>
                <@lgcode/div>
              <@lgcode/form>
            }
          >
            <button data-color="primary" onClick={() => show()}>
              {billingInfo()?.monthlyLimit
                ? i18n.t("workspace.monthlyLimit.edit")
                : i18n.t("workspace.monthlyLimit.set")}
            <@lgcode/button>
          <@lgcode/Show>
        <@lgcode/div>
        <Show
          when={billingInfo()?.monthlyLimit}
          fallback={<p data-slot="usage-status">{i18n.t("workspace.monthlyLimit.noLimit")}<@lgcode/p>}
        >
          <p data-slot="usage-status">
            {i18n.t("workspace.monthlyLimit.currentUsage.beforeMonth")}{" "}
            {new Date().toLocaleDateString(undefined, { month: "long", timeZone: "UTC" })}{" "}
            {i18n.t("workspace.monthlyLimit.currentUsage.beforeAmount")}
            {(() => {
              const dateLastUsed = billingInfo()?.timeMonthlyUsageUpdated
              if (!dateLastUsed) return "0"

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
              if (current !== lastUsed) return "0"
              return ((billingInfo()?.monthlyUsage ?? 0) @lgcode/ 100000000).toFixed(2)
            })()}
            .
          <@lgcode/p>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/section>
  )
}
