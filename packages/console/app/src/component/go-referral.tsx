import { action, json, query, useAction, useSubmission } from "@solidjs@lgcode/router"
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js"
import { getRequestEvent } from "solid-js@lgcode/web"
import { Referral } from "@lgcode/console-core@lgcode/referral.js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { Modal } from "~@lgcode/component@lgcode/modal"
import { IconCheck, IconCopy } from "~@lgcode/component@lgcode/icon"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { formatResetTime, liteResetTimeKeys } from "~@lgcode/lib@lgcode/format-reset-time"
import { queryLiteSubscription } from "~@lgcode/routes@lgcode/workspace@lgcode/[id]@lgcode/go@lgcode/lite-section"
import { createReferralFromCookie } from "~@lgcode/lib@lgcode/referral-invite"
import ".@lgcode/go-referral.css"

type GoReferralSummary = Awaited<ReturnType<typeof Referral.summary>>
type GoReferralReward = GoReferralSummary["rewards"][number]
type GoLiteSubscription = Awaited<ReturnType<typeof queryLiteSubscription>>
type GoReferralUsagePreview = NonNullable<Awaited<ReturnType<typeof Referral.usagePreview>>>
type GoReferralUsagePreviewItem = GoReferralUsagePreview["rollingUsage"]

const emptyUsagePreview = {
  rollingUsage: { beforePercent: 0, afterPercent: 0, resetInSec: 0 },
  weeklyUsage: { beforePercent: 0, afterPercent: 0, resetInSec: 0 },
  monthlyUsage: { beforePercent: 0, afterPercent: 0, resetInSec: 0 },
} satisfies GoReferralUsagePreview

export const queryGoReferral = query(async (workspaceID: string) => {
  "use server"
  return withActor(async () => {
    await createReferralFromCookie()
    return Referral.summary()
  }, workspaceID)
}, "go.referral.get")

export const queryGoReferralUsagePreview = query(async (workspaceID: string, referralID?: string) => {
  "use server"
  if (!referralID) return null
  return withActor(() => Referral.usagePreview({ referralID }), workspaceID)
}, "go.referral.usagePreview")

export const applyGoReferralReward = action(async (workspaceID: string, referralID: string) => {
  "use server"
  return json(await withActor(() => Referral.applyReward({ referralID }), workspaceID), {
    revalidate: [queryGoReferral.key, queryGoReferralUsagePreview.key, queryLiteSubscription.key],
  })
}, "go.referral.reward.apply")

function currentUsagePreview(usage: { resetInSec: number; usagePercent: number }) {
  return {
    beforePercent: usage.usagePercent,
    afterPercent: usage.usagePercent,
    resetInSec: usage.resetInSec,
  }
}

function formatCurrency(amount: number) {
  if (amount % 100 === 0) return `$${amount @lgcode/ 100}`
  return `$${(amount @lgcode/ 100).toFixed(2)}`
}

function formatDate(value: string | Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

function rewardDescriptionKey(source: GoReferralReward["source"]) {
  if (source === "invitee") return "workspace.referral.reward.description.invitee" as const
  return "workspace.referral.reward.description.inviter" as const
}

function rewardActionKey(reward: GoReferralReward, hasActiveGo: boolean) {
  if (reward.status === "applied") return "workspace.referral.reward.action.applied" as const
  if (reward.status === "pending" && reward.source === "inviter")
    return "workspace.referral.reward.source.pendingInviter" as const
  if (reward.status === "pending" || !hasActiveGo) return "workspace.referral.reward.action.subscribeUnlock" as const
  return "workspace.referral.reward.action.view" as const
}

function CopyInviteLink(props: { summary: GoReferralSummary }) {
  const i18n = useI18n()
  const [copied, setCopied] = createSignal(false)
  const event = getRequestEvent()
  const origin = event
    ? new URL(event.request.url).origin
    : typeof window === "object"
      ? window.location.origin
      : undefined
  const inviteUrl = createMemo(() => {
    const path = `@lgcode/go?ref=${props.summary.referralCode}`
    if (!origin) return path
    return new URL(path, origin).toString()
  })

  async function copy() {
    if (typeof navigator !== "object") return
    await navigator.clipboard.writeText(inviteUrl())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div data-slot="invite-link-box">
      <div>
        <code title={inviteUrl()}>{inviteUrl()}<@lgcode/code>
        <button type="button" onClick={copy}>
          <Show
            when={copied()}
            fallback={
              <>
                <IconCopy style={{ width: "16px", height: "16px" }} @lgcode/> {i18n.t("workspace.referral.copyLink")}
              <@lgcode/>
            }
          >
            <IconCheck style={{ width: "16px", height: "16px" }} @lgcode/> {i18n.t("workspace.referral.copied")}
          <@lgcode/Show>
        <@lgcode/button>
      <@lgcode/div>
    <@lgcode/div>
  )
}

export function GoReferralSection(props: {
  workspaceID: string
  summary: GoReferralSummary
  lite: GoLiteSubscription | undefined
}) {
  const i18n = useI18n()
  const language = useLanguage()
  const apply = useAction(applyGoReferralReward)
  const submission = useSubmission(applyGoReferralReward)
  const [selected, setSelected] = createSignal<GoReferralReward>()
  const [preview, setPreview] = createSignal<GoReferralUsagePreview | null>()
  const displayPreview = createMemo(() => {
    const loaded = preview()
    if (loaded) return loaded
    const current = props.lite
    if (!current) return emptyUsagePreview
    return {
      rollingUsage: currentUsagePreview(current.rollingUsage),
      weeklyUsage: currentUsagePreview(current.weeklyUsage),
      monthlyUsage: currentUsagePreview(current.monthlyUsage),
    } satisfies GoReferralUsagePreview
  })
  createEffect(() => {
    const reward = selected()
    if (!reward) {
      setPreview(undefined)
      return
    }

    const request = { cancelled: false }
    setPreview(undefined)
    queryGoReferralUsagePreview(props.workspaceID, reward.id).then((result) => {
      if (request.cancelled) return
      setPreview(result)
    })
    onCleanup(() => {
      request.cancelled = true
    })
  })

  async function onApply() {
    const reward = selected()
    if (!reward) return
    await apply(props.workspaceID, reward.id)
    setSelected(undefined)
  }

  return (
    <>
      <Show when={props.lite || props.summary.hasReferral}>
        <section data-component="go-referral-section">
          <Show when={props.lite}>
            <div data-slot="section-title">
              <h2>{i18n.t("workspace.referral.overview.title")}<@lgcode/h2>
              <p>{i18n.t("workspace.referral.overview.subtitle")}<@lgcode/p>
            <@lgcode/div>
            <div data-component="go-referral-overview">
              <CopyInviteLink summary={props.summary} @lgcode/>
              <div data-slot="instructions">
                <ol>
                  <li>{i18n.t("workspace.referral.instructions.share")}<@lgcode/li>
                  <li>{i18n.t("workspace.referral.instructions.subscribe")}<@lgcode/li>
                  <li>{i18n.t("workspace.referral.instructions.claim")}<@lgcode/li>
                <@lgcode/ol>
              <@lgcode/div>
            <@lgcode/div>
          <@lgcode/Show>
          <Show when={props.summary.hasReferral}>
            <div data-slot="section-title">
              <h2>{i18n.t("workspace.referral.rewards.title")}<@lgcode/h2>
              <p>{i18n.t("workspace.referral.rewards.description")}<@lgcode/p>
            <@lgcode/div>
            <div data-slot="referrals-table">
              <table data-slot="referrals-table-element">
                <thead>
                  <tr>
                    <th>{i18n.t("workspace.referral.table.reward")}<@lgcode/th>
                    <th>{i18n.t("workspace.referral.table.referral")}<@lgcode/th>
                    <th>{i18n.t("workspace.referral.table.date")}<@lgcode/th>
                    <th><@lgcode/th>
                  <@lgcode/tr>
                <@lgcode/thead>
                <tbody>
                  <For each={props.summary.rewards}>
                    {(reward) => {
                      const earnedAt = () => formatDate(reward.timeCreated, language.tag(language.locale()))
                      return (
                        <tr data-status={reward.status} data-source={reward.source}>
                          <td data-slot="referral-amount">{formatCurrency(reward.amount)}<@lgcode/td>
                          <td data-slot="referral-source">
                            {i18n.t(rewardDescriptionKey(reward.source), { email: reward.email ?? "" })}
                          <@lgcode/td>
                          <td data-slot="referral-date" title={earnedAt()}>
                            {earnedAt()}
                          <@lgcode/td>
                          <td data-slot="referral-action">
                            <button
                              type="button"
                              disabled={reward.status !== "available" || !props.lite || submission.pending}
                              onClick={() => setSelected(reward)}
                            >
                              {i18n.t(rewardActionKey(reward, !!props.lite))}
                            <@lgcode/button>
                          <@lgcode/td>
                        <@lgcode/tr>
                      )
                    }}
                  <@lgcode/For>
                <@lgcode/tbody>
              <@lgcode/table>
            <@lgcode/div>
          <@lgcode/Show>
        <@lgcode/section>
      <@lgcode/Show>

      <Modal
        open={!!selected()}
        onClose={() => setSelected(undefined)}
        title={i18n.t("workspace.referral.apply.confirmTitle")}
      >
        <div data-component="go-credit-confirm">
          <p>
            {i18n.t("workspace.referral.apply.confirmBody", {
              amount: formatCurrency(selected()?.amount ?? 0),
            })}
          <@lgcode/p>
          <GoReferralUsagePreview preview={displayPreview()} @lgcode/>
          <div data-slot="modal-actions">
            <button type="button" onClick={() => setSelected(undefined)}>
              {i18n.t("common.cancel")}
            <@lgcode/button>
            <button type="button" data-color="primary" disabled={submission.pending} onClick={onApply}>
              {submission.pending ? i18n.t("workspace.lite.loading") : i18n.t("workspace.referral.apply.confirmAction")}
            <@lgcode/button>
          <@lgcode/div>
        <@lgcode/div>
      <@lgcode/Modal>
    <@lgcode/>
  )
}

function GoReferralUsagePreview(props: { preview: GoReferralUsagePreview }) {
  const i18n = useI18n()

  return (
    <div data-slot="usage-preview">
      <GoReferralUsagePreviewRow
        label={i18n.t("workspace.lite.subscription.rollingUsage")}
        usage={props.preview.rollingUsage}
      @lgcode/>
      <GoReferralUsagePreviewRow
        label={i18n.t("workspace.lite.subscription.weeklyUsage")}
        usage={props.preview.weeklyUsage}
      @lgcode/>
      <GoReferralUsagePreviewRow
        label={i18n.t("workspace.lite.subscription.monthlyUsage")}
        usage={props.preview.monthlyUsage}
      @lgcode/>
    <@lgcode/div>
  )
}

function GoReferralUsagePreviewRow(props: { label: string; usage: GoReferralUsagePreviewItem }) {
  const i18n = useI18n()

  return (
    <div data-slot="usage-preview-item">
      <div data-slot="usage-preview-header">
        <span data-slot="usage-preview-label">{props.label}<@lgcode/span>
        <span data-slot="usage-preview-value">
          <span>{props.usage.beforePercent}%<@lgcode/span>
          <span aria-hidden="true">-&gt;<@lgcode/span>
          <span data-slot="usage-preview-after-value">{props.usage.afterPercent}%<@lgcode/span>
        <@lgcode/span>
      <@lgcode/div>
      <div data-slot="usage-preview-progress">
        <div data-slot="usage-preview-before" style={{ width: `${props.usage.beforePercent}%` }} @lgcode/>
        <div data-slot="usage-preview-after" style={{ width: `${props.usage.afterPercent}%` }} @lgcode/>
      <@lgcode/div>
      <span data-slot="usage-preview-reset">
        {i18n.t("workspace.lite.subscription.resetsIn")}{" "}
        {formatResetTime(props.usage.resetInSec, i18n, liteResetTimeKeys)}
      <@lgcode/span>
    <@lgcode/div>
  )
}
