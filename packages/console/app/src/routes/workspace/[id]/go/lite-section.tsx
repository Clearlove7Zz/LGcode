import { action, useParams, useAction, useSubmission, json, query, createAsync } from "@solidjs@lgcode/router"
import { createStore } from "solid-js@lgcode/store"
import { createMemo, For, Show } from "solid-js"
import { Modal } from "~@lgcode/component@lgcode/modal"
import { Billing } from "@lgcode/console-core@lgcode/billing.js"
import { Database, eq, and, isNull } from "@lgcode/console-core@lgcode/drizzle@lgcode/index.js"
import { BillingTable, LiteTable } from "@lgcode/console-core@lgcode/schema@lgcode/billing.sql.js"
import { Actor } from "@lgcode/console-core@lgcode/actor.js"
import { Subscription } from "@lgcode/console-core@lgcode/subscription.js"
import { LiteData } from "@lgcode/console-core@lgcode/lite.js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { queryBillingInfo } from "..@lgcode/..@lgcode/common"
import styles from ".@lgcode/lite-section.module.css"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { formError } from "~@lgcode/lib@lgcode/form-error"
import { formatResetTime, liteResetTimeKeys } from "~@lgcode/lib@lgcode/format-reset-time"
import { createReferralFromCookie } from "~@lgcode/lib@lgcode/referral-invite"

import { IconAlipay, IconUpi } from "~@lgcode/component@lgcode/icon"

export const queryLiteSubscription = query(async (workspaceID: string) => {
  "use server"
  return withActor(async () => {
    const row = await Database.use((tx) =>
      tx
        .select({
          userID: LiteTable.userID,
          rollingUsage: LiteTable.rollingUsage,
          weeklyUsage: LiteTable.weeklyUsage,
          monthlyUsage: LiteTable.monthlyUsage,
          timeRollingUpdated: LiteTable.timeRollingUpdated,
          timeWeeklyUpdated: LiteTable.timeWeeklyUpdated,
          timeMonthlyUpdated: LiteTable.timeMonthlyUpdated,
          timeCreated: LiteTable.timeCreated,
          lite: BillingTable.lite,
        })
        .from(BillingTable)
        .innerJoin(LiteTable, eq(LiteTable.workspaceID, BillingTable.workspaceID))
        .where(and(eq(LiteTable.workspaceID, Actor.workspace()), isNull(LiteTable.timeDeleted)))
        .then((r) => r[0]),
    )
    if (!row) return null

    const limits = LiteData.getLimits()
    const mine = row.userID === Actor.userID()

    return {
      mine,
      useBalance: row.lite?.useBalance ?? false,
      rollingUsage: Subscription.analyzeRollingUsage({
        limit: limits.rollingLimit,
        window: limits.rollingWindow,
        usage: row.rollingUsage ?? 0,
        timeUpdated: row.timeRollingUpdated ?? new Date(),
      }),
      weeklyUsage: Subscription.analyzeWeeklyUsage({
        limit: limits.weeklyLimit,
        usage: row.weeklyUsage ?? 0,
        timeUpdated: row.timeWeeklyUpdated ?? new Date(),
      }),
      monthlyUsage: Subscription.analyzeMonthlyUsage({
        limit: limits.monthlyLimit,
        usage: row.monthlyUsage ?? 0,
        timeUpdated: row.timeMonthlyUpdated ?? new Date(),
        timeSubscribed: row.timeCreated,
      }),
    }
  }, workspaceID)
}, "lite.subscription.get")

type LiteSubscription = Awaited<ReturnType<typeof queryLiteSubscription>>

const createLiteCheckoutUrl = action(
  async (workspaceID: string, successUrl: string, cancelUrl: string, method?: "alipay" | "upi") => {
    "use server"
    return json(
      await withActor(async () => {
        const data = await Billing.generateLiteCheckoutUrl({ successUrl, cancelUrl, method })
        await createReferralFromCookie()
        return { error: undefined, data }
      }, workspaceID).catch((e) => ({
        error: e.message as string,
        data: undefined,
      })),
      { revalidate: [queryBillingInfo.key, queryLiteSubscription.key] },
    )
  },
  "liteCheckoutUrl",
)

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
    { revalidate: [queryBillingInfo.key, queryLiteSubscription.key] },
  )
}, "liteSessionUrl")

const setLiteUseBalance = action(async (form: FormData) => {
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
            lite: useBalance ? { useBalance: true } : {},
          })
          .where(eq(BillingTable.workspaceID, workspaceID)),
      )
      return { error: undefined }
    }, workspaceID).catch((e) => ({ error: e.message as string })),
    { revalidate: [queryBillingInfo.key, queryLiteSubscription.key] },
  )
}, "setLiteUseBalance")

function LiteUsageItem(props: { label: string; usage: { usagePercent: number; resetInSec: number } }) {
  const i18n = useI18n()

  return (
    <div data-slot="usage-item">
      <div data-slot="usage-header">
        <span data-slot="usage-label">{props.label}<@lgcode/span>
        <span data-slot="usage-value">{props.usage.usagePercent}%<@lgcode/span>
      <@lgcode/div>
      <div data-slot="progress">
        <div data-slot="progress-bar" style={{ width: `${props.usage.usagePercent}%` }} @lgcode/>
      <@lgcode/div>
      <span data-slot="reset-time">
        {i18n.t("workspace.lite.subscription.resetsIn")}{" "}
        {formatResetTime(props.usage.resetInSec, i18n, liteResetTimeKeys)}
      <@lgcode/span>
    <@lgcode/div>
  )
}

export function LiteSection(props: { lite: LiteSubscription | undefined }) {
  const params = useParams()
  const i18n = useI18n()
  const language = useLanguage()
  const billingInfo = createAsync(() => queryBillingInfo(params.id!))
  const isBlack = createMemo(() => billingInfo()?.subscriptionID || billingInfo()?.timeSubscriptionBooked)
  const sessionAction = useAction(createSessionUrl)
  const sessionSubmission = useSubmission(createSessionUrl)
  const checkoutAction = useAction(createLiteCheckoutUrl)
  const checkoutSubmission = useSubmission(createLiteCheckoutUrl)
  const useBalanceSubmission = useSubmission(setLiteUseBalance)
  const [store, setStore] = createStore({
    loading: undefined as undefined | "session" | "checkout" | "alipay" | "upi",
    showModal: false,
  })

  const busy = createMemo(() => !!store.loading)

  async function onClickSession() {
    setStore("loading", "session")
    const result = await sessionAction(params.id!, window.location.href)
    if (result.data) {
      window.location.href = result.data
      return
    }
    setStore("loading", undefined)
  }

  async function onClickSubscribe(method?: "alipay" | "upi") {
    setStore("loading", method ?? "checkout")
    const result = await checkoutAction(params.id!, window.location.href, window.location.href, method)
    if (result.data) {
      window.location.href = result.data
      return
    }
    setStore("loading", undefined)
  }

  return (
    <>
      <Show when={isBlack()}>
        <section class={styles.root}>
          <p data-slot="other-message">{i18n.t("workspace.lite.black.message")}<@lgcode/p>
        <@lgcode/section>
      <@lgcode/Show>
      <Show when={!isBlack() && props.lite && props.lite.mine && props.lite}>
        {(sub) => (
          <section class={styles.root}>
            <div data-slot="section-title">
              <div data-slot="title-row">
                <p>{i18n.t("workspace.lite.subscription.message")}<@lgcode/p>
                <button data-color="primary" disabled={sessionSubmission.pending || busy()} onClick={onClickSession}>
                  {store.loading === "session"
                    ? i18n.t("workspace.lite.loading")
                    : i18n.t("workspace.lite.subscription.manage")}
                <@lgcode/button>
              <@lgcode/div>
            <@lgcode/div>
            <div data-slot="beta-notice">
              {i18n.t("workspace.lite.subscription.selectProvider")}{" "}
              <a href={language.route("@lgcode/docs@lgcode/providers@lgcode/#opencode-go")} target="_blank" rel="noopener noreferrer">
                {i18n.t("common.learnMore")}
              <@lgcode/a>
              .
            <@lgcode/div>
            <div data-slot="usage">
              <LiteUsageItem label={i18n.t("workspace.lite.subscription.rollingUsage")} usage={sub().rollingUsage} @lgcode/>
              <LiteUsageItem label={i18n.t("workspace.lite.subscription.weeklyUsage")} usage={sub().weeklyUsage} @lgcode/>
              <LiteUsageItem label={i18n.t("workspace.lite.subscription.monthlyUsage")} usage={sub().monthlyUsage} @lgcode/>
            <@lgcode/div>
            <form action={setLiteUseBalance} method="post" data-slot="setting-row">
              <p>{i18n.t("workspace.lite.subscription.useBalance")}<@lgcode/p>
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
      <Show when={!isBlack() && props.lite && !props.lite.mine}>
        <section class={styles.root}>
          <p data-slot="other-message">{i18n.t("workspace.lite.other.message")}<@lgcode/p>
        <@lgcode/section>
      <@lgcode/Show>
      <Show when={!isBlack() && props.lite === null}>
        <section class={styles.root}>
          <p data-slot="promo-description">
            <For
              each={i18n
                .t("workspace.lite.promo.description")
                .split(@lgcode/(\{\{price\}\})@lgcode/g)
                .filter(Boolean)}
            >
              {(part) => {
                if (part === "{{price}}") return <strong>{i18n.t("workspace.lite.promo.price")}<@lgcode/strong>
                return part
              }}
            <@lgcode/For>
          <@lgcode/p>
          <h3 data-slot="promo-models-title">{i18n.t("workspace.lite.promo.modelsTitle")}<@lgcode/h3>
          <ul data-slot="promo-models">
            <li>Kimi K2.7 Code<@lgcode/li>
            <li>Kimi K2.6<@lgcode/li>
            <li>GLM-5.1<@lgcode/li>
            <li>GLM-5<@lgcode/li>
            <li>MiniMax M3<@lgcode/li>
            <li>MiniMax M2.7<@lgcode/li>
            <li>Qwen3.7 Max<@lgcode/li>
            <li>Qwen3.7 Plus<@lgcode/li>
            <li>Qwen3.6 Plus<@lgcode/li>
            <li>DeepSeek V4 Pro<@lgcode/li>
            <li>DeepSeek V4 Flash<@lgcode/li>
            <li>MiMo-V2.5<@lgcode/li>
            <li>MiMo-V2.5-Pro<@lgcode/li>
          <@lgcode/ul>
          <p data-slot="promo-description">{i18n.t("workspace.lite.promo.footer")}<@lgcode/p>
          <div data-slot="subscribe-actions">
            <button
              data-slot="subscribe-button"
              data-color="primary"
              disabled={checkoutSubmission.pending || busy()}
              onClick={() => onClickSubscribe()}
            >
              {store.loading === "checkout"
                ? i18n.t("workspace.lite.promo.subscribing")
                : i18n.t("workspace.lite.promo.subscribe")}
            <@lgcode/button>
            <button
              type="button"
              data-slot="other-methods"
              data-color="ghost"
              onClick={() => setStore("showModal", true)}
            >
              <span>{i18n.t("workspace.lite.promo.otherMethods")}<@lgcode/span>
              <span data-slot="other-methods-icons">
                <span> <@lgcode/span>
                <IconAlipay style={{ width: "16px", height: "16px" }} @lgcode/>
                <span> <@lgcode/span>
                <IconUpi style={{ width: "auto", height: "10px" }} @lgcode/>
              <@lgcode/span>
            <@lgcode/button>
          <@lgcode/div>
          <Modal
            open={store.showModal}
            onClose={() => setStore("showModal", false)}
            title={i18n.t("workspace.lite.promo.selectMethod")}
          >
            <div class={styles.paymentMethodModal}>
              <div data-slot="modal-actions">
                <button
                  type="button"
                  data-slot="method-button"
                  data-color="ghost"
                  disabled={checkoutSubmission.pending || busy()}
                  onClick={() => onClickSubscribe("alipay")}
                >
                  <Show when={store.loading !== "alipay"}>
                    <IconAlipay style={{ width: "24px", height: "24px" }} @lgcode/>
                  <@lgcode/Show>
                  {store.loading === "alipay" ? i18n.t("workspace.lite.promo.subscribing") : "Alipay"}
                <@lgcode/button>
                <button
                  type="button"
                  data-slot="method-button"
                  data-color="ghost"
                  disabled={checkoutSubmission.pending || busy()}
                  onClick={() => onClickSubscribe("upi")}
                >
                  <Show when={store.loading !== "upi"}>
                    <IconUpi style={{ width: "auto", height: "16px" }} @lgcode/>
                  <@lgcode/Show>
                  {store.loading === "upi" ? i18n.t("workspace.lite.promo.subscribing") : "UPI"}
                <@lgcode/button>
              <@lgcode/div>
            <@lgcode/div>
          <@lgcode/Modal>
        <@lgcode/section>
      <@lgcode/Show>
    <@lgcode/>
  )
}
