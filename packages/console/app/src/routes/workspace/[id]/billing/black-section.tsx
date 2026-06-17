import { action, useParams, useAction, useSubmission, json, query, createAsync } from "@solidjs@lgcode/router"
import { createStore } from "solid-js@lgcode/store"
import { Show } from "solid-js"
import { Billing } from "@lgcode/console-core@lgcode/billing.js"
import { Database, eq, and, isNull, sql } from "@lgcode/console-core@lgcode/drizzle@lgcode/index.js"
import { BillingTable, SubscriptionTable } from "@lgcode/console-core@lgcode/schema@lgcode/billing.sql.js"
import { Actor } from "@lgcode/console-core@lgcode/actor.js"
import { Subscription } from "@lgcode/console-core@lgcode/subscription.js"
import { BlackData } from "@lgcode/console-core@lgcode/black.js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { queryBillingInfo } from "..@lgcode/..@lgcode/common"
import styles from ".@lgcode/black-section.module.css"
import waitlistStyles from ".@lgcode/black-waitlist-section.module.css"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { formError } from "~@lgcode/lib@lgcode/form-error"
import { blackResetTimeKeys, formatResetTime } from "~@lgcode/lib@lgcode/format-reset-time"

const querySubscription = query(async (workspaceID: string) => {
  "use server"
  return withActor(async () => {
    const row = await Database.use((tx) =>
      tx
        .select({
          rollingUsage: SubscriptionTable.rollingUsage,
          fixedUsage: SubscriptionTable.fixedUsage,
          timeRollingUpdated: SubscriptionTable.timeRollingUpdated,
          timeFixedUpdated: SubscriptionTable.timeFixedUpdated,
          subscription: BillingTable.subscription,
        })
        .from(BillingTable)
        .innerJoin(SubscriptionTable, eq(SubscriptionTable.workspaceID, BillingTable.workspaceID))
        .where(and(eq(SubscriptionTable.workspaceID, Actor.workspace()), isNull(SubscriptionTable.timeDeleted)))
        .then((r) => r[0]),
    )
    if (!row?.subscription) return null
    const blackData = BlackData.getLimits({ plan: row.subscription.plan })

    return {
      plan: row.subscription.plan,
      useBalance: row.subscription.useBalance ?? false,
      rollingUsage: Subscription.analyzeRollingUsage({
        limit: blackData.rollingLimit,
        window: blackData.rollingWindow,
        usage: row.rollingUsage ?? 0,
        timeUpdated: row.timeRollingUpdated ?? new Date(),
      }),
      weeklyUsage: Subscription.analyzeWeeklyUsage({
        limit: blackData.fixedLimit,
        usage: row.fixedUsage ?? 0,
        timeUpdated: row.timeFixedUpdated ?? new Date(),
      }),
    }
  }, workspaceID)
}, "subscription.get")

const cancelWaitlist = action(async (workspaceID: string) => {
  "use server"
  return json(
    await withActor(async () => {
      await Database.use((tx) =>
        tx
          .update(BillingTable)
          .set({
            subscriptionPlan: null,
            timeSubscriptionBooked: null,
            timeSubscriptionSelected: null,
          })
          .where(eq(BillingTable.workspaceID, workspaceID)),
      )
      return { error: undefined }
    }, workspaceID).catch((e) => ({ error: e.message as string })),
    { revalidate: [queryBillingInfo.key, querySubscription.key] },
  )
}, "cancelWaitlist")

const enroll = action(async (workspaceID: string) => {
  "use server"
  return json(
    await withActor(async () => {
      await Billing.subscribeBlack({ seats: 1 })
      return { error: undefined }
    }, workspaceID).catch((e) => ({ error: e.message as string })),
    { revalidate: [queryBillingInfo.key, querySubscription.key] },
  )
}, "enroll")

const createSessionUrl = action(async (workspaceID: string, returnUrl: string) => {
  "use server"
  return json(
    await withActor(
      () =>
        Billing.generateSessionUrl({ returnUrl })
          .then((data) => ({ error: undefined, data }))
          .catch((e) => ({
            error: e.message as string,
            data: undefined,
          })),
      workspaceID,
    ),
    { revalidate: [queryBillingInfo.key, querySubscription.key] },
  )
}, "sessionUrl")

const setUseBalance = action(async (form: FormData) => {
  "use server"
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  const useBalance = (form.get("useBalance") as string | null) === "true"

  return json(
    await withActor(async () => {
      await Database.use((tx) =>
        tx
          .update(BillingTable)
          .set({
            subscription: useBalance
              ? sql`JSON_SET(subscription, '$.useBalance', true)`
              : sql`JSON_REMOVE(subscription, '$.useBalance')`,
          })
          .where(eq(BillingTable.workspaceID, workspaceID)),
      )
      return { error: undefined }
    }, workspaceID).catch((e) => ({ error: e.message as string })),
    { revalidate: [queryBillingInfo.key, querySubscription.key] },
  )
}, "setUseBalance")

export function BlackSection() {
  const params = useParams()
  const i18n = useI18n()
  const billing = createAsync(() => queryBillingInfo(params.id!))
  const subscription = createAsync(() => querySubscription(params.id!))
  const sessionAction = useAction(createSessionUrl)
  const sessionSubmission = useSubmission(createSessionUrl)
  const cancelAction = useAction(cancelWaitlist)
  const cancelSubmission = useSubmission(cancelWaitlist)
  const enrollAction = useAction(enroll)
  const enrollSubmission = useSubmission(enroll)
  const useBalanceSubmission = useSubmission(setUseBalance)
  const [store, setStore] = createStore({
    sessionRedirecting: false,
    cancelled: false,
    enrolled: false,
  })

  async function onClickSession() {
    const result = await sessionAction(params.id!, window.location.href)
    if (result.data) {
      setStore("sessionRedirecting", true)
      window.location.href = result.data
    }
  }

  async function onClickCancel() {
    const result = await cancelAction(params.id!)
    if (!result.error) {
      setStore("cancelled", true)
    }
  }

  async function onClickEnroll() {
    const result = await enrollAction(params.id!)
    if (!result.error) {
      setStore("enrolled", true)
    }
  }

  return (
    <>
      <Show when={subscription()}>
        {(sub) => (
          <section class={styles.root}>
            <div data-slot="section-title">
              <h2>{i18n.t("workspace.black.subscription.title")}<@lgcode/h2>
              <div data-slot="title-row">
                <p>{i18n.t("workspace.black.subscription.message", { plan: sub().plan })}<@lgcode/p>
                <button
                  data-color="primary"
                  disabled={sessionSubmission.pending || store.sessionRedirecting}
                  onClick={onClickSession}
                >
                  {sessionSubmission.pending || store.sessionRedirecting
                    ? i18n.t("workspace.black.loading")
                    : i18n.t("workspace.black.subscription.manage")}
                <@lgcode/button>
              <@lgcode/div>
            <@lgcode/div>
            <div data-slot="usage">
              <div data-slot="usage-item">
                <div data-slot="usage-header">
                  <span data-slot="usage-label">{i18n.t("workspace.black.subscription.rollingUsage")}<@lgcode/span>
                  <span data-slot="usage-value">{sub().rollingUsage.usagePercent}%<@lgcode/span>
                <@lgcode/div>
                <div data-slot="progress">
                  <div data-slot="progress-bar" style={{ width: `${sub().rollingUsage.usagePercent}%` }} @lgcode/>
                <@lgcode/div>
                <span data-slot="reset-time">
                  {i18n.t("workspace.black.subscription.resetsIn")}{" "}
                  {formatResetTime(sub().rollingUsage.resetInSec, i18n, blackResetTimeKeys)}
                <@lgcode/span>
              <@lgcode/div>
              <div data-slot="usage-item">
                <div data-slot="usage-header">
                  <span data-slot="usage-label">{i18n.t("workspace.black.subscription.weeklyUsage")}<@lgcode/span>
                  <span data-slot="usage-value">{sub().weeklyUsage.usagePercent}%<@lgcode/span>
                <@lgcode/div>
                <div data-slot="progress">
                  <div data-slot="progress-bar" style={{ width: `${sub().weeklyUsage.usagePercent}%` }} @lgcode/>
                <@lgcode/div>
                <span data-slot="reset-time">
                  {i18n.t("workspace.black.subscription.resetsIn")}{" "}
                  {formatResetTime(sub().weeklyUsage.resetInSec, i18n, blackResetTimeKeys)}
                <@lgcode/span>
              <@lgcode/div>
            <@lgcode/div>
            <form action={setUseBalance} method="post" data-slot="setting-row">
              <p>{i18n.t("workspace.black.subscription.useBalance")}<@lgcode/p>
              <input type="hidden" name="workspaceID" value={params.id} @lgcode/>
              <input type="hidden" name="useBalance" value={sub().useBalance ? "false" : "true"} @lgcode/>
              <label data-slot="toggle-label">
                <input
                  type="checkbox"
                  checked={sub().useBalance}
                  disabled={useBalanceSubmission.pending}
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                @lgcode/>
                <span><@lgcode/span>
              <@lgcode/label>
            <@lgcode/form>
          <@lgcode/section>
        )}
      <@lgcode/Show>
      <Show when={billing()?.timeSubscriptionBooked}>
        <section class={waitlistStyles.root}>
          <div data-slot="section-title">
            <h2>{i18n.t("workspace.black.waitlist.title")}<@lgcode/h2>
            <div data-slot="title-row">
              <p>
                {billing()?.timeSubscriptionSelected
                  ? i18n.t("workspace.black.waitlist.ready", { plan: billing()?.subscriptionPlan ?? "" })
                  : i18n.t("workspace.black.waitlist.joined", { plan: billing()?.subscriptionPlan ?? "" })}
              <@lgcode/p>
              <button
                data-color="danger"
                disabled={cancelSubmission.pending || store.cancelled}
                onClick={onClickCancel}
              >
                {cancelSubmission.pending
                  ? i18n.t("workspace.black.waitlist.leaving")
                  : store.cancelled
                    ? i18n.t("workspace.black.waitlist.left")
                    : i18n.t("workspace.black.waitlist.leave")}
              <@lgcode/button>
            <@lgcode/div>
          <@lgcode/div>
          <Show when={billing()?.timeSubscriptionSelected}>
            <div data-slot="enroll-section">
              <button
                data-slot="enroll-button"
                data-color="primary"
                disabled={enrollSubmission.pending || store.enrolled}
                onClick={onClickEnroll}
              >
                {enrollSubmission.pending
                  ? i18n.t("workspace.black.waitlist.enrolling")
                  : store.enrolled
                    ? i18n.t("workspace.black.waitlist.enrolled")
                    : i18n.t("workspace.black.waitlist.enroll")}
              <@lgcode/button>
              <p data-slot="enroll-note">{i18n.t("workspace.black.waitlist.enrollNote")}<@lgcode/p>
            <@lgcode/div>
          <@lgcode/Show>
        <@lgcode/section>
      <@lgcode/Show>
    <@lgcode/>
  )
}
