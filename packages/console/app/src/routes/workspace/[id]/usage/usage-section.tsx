import { Billing } from "@lgcode/console-core@lgcode/billing.js"
import { createAsync, query, useParams } from "@solidjs@lgcode/router"
import { createMemo, For, Show, Switch, Match, createEffect, createSignal } from "solid-js"
import { formatDateUTC, formatDateForTable } from "..@lgcode/..@lgcode/common"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { IconChevronLeft, IconChevronRight, IconBreakdown } from "~@lgcode/component@lgcode/icon"
import styles from ".@lgcode/usage-section.module.css"
import { createStore } from "solid-js@lgcode/store"
import { useI18n } from "~@lgcode/context@lgcode/i18n"

const PAGE_SIZE = 50

async function getUsageInfo(workspaceID: string, page: number) {
  "use server"
  return withActor(async () => {
    return await Billing.usages(page, PAGE_SIZE)
  }, workspaceID)
}

const queryUsageInfo = query(getUsageInfo, "usage.list")

export function UsageSection() {
  const params = useParams()
  const i18n = useI18n()
  const usage = createAsync(() => queryUsageInfo(params.id!, 0))
  const [store, setStore] = createStore({ page: 0, usage: [] as Awaited<ReturnType<typeof getUsageInfo>> })
  const [openBreakdownId, setOpenBreakdownId] = createSignal<string | null>(null)

  createEffect(() => {
    setStore({ usage: usage() })
  }, [usage])

  createEffect(() => {
    if (!openBreakdownId()) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-slot="tokens-with-breakdown"]')) {
        setOpenBreakdownId(null)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  })

  const hasResults = createMemo(() => store.usage && store.usage.length > 0)
  const canGoPrev = createMemo(() => store.page > 0)
  const canGoNext = createMemo(() => store.usage && store.usage.length === PAGE_SIZE)

  const calculateTotalInputTokens = (u: Awaited<ReturnType<typeof getUsageInfo>>[0]) => {
    return u.inputTokens + (u.cacheReadTokens ?? 0) + (u.cacheWrite5mTokens ?? 0) + (u.cacheWrite1hTokens ?? 0)
  }

  const calculateTotalOutputTokens = (u: Awaited<ReturnType<typeof getUsageInfo>>[0]) => {
    return u.outputTokens
  }

  const goPrev = async () => {
    const usage = await getUsageInfo(params.id!, store.page - 1)
    setStore({
      page: store.page - 1,
      usage,
    })
  }
  const goNext = async () => {
    const usage = await getUsageInfo(params.id!, store.page + 1)
    setStore({
      page: store.page + 1,
      usage,
    })
  }

  return (
    <section class={styles.root}>
      <div data-slot="section-title">
        <h2>{i18n.t("workspace.usage.title")}<@lgcode/h2>
        <p>{i18n.t("workspace.usage.subtitle")}<@lgcode/p>
      <@lgcode/div>
      <div data-slot="usage-table">
        <Show
          when={hasResults()}
          fallback={
            <div data-component="empty-state">
              <p>{i18n.t("workspace.usage.empty")}<@lgcode/p>
            <@lgcode/div>
          }
        >
          <table data-slot="usage-table-element">
            <thead>
              <tr>
                <th>{i18n.t("workspace.usage.table.date")}<@lgcode/th>
                <th>{i18n.t("workspace.usage.table.model")}<@lgcode/th>
                <th>{i18n.t("workspace.usage.table.input")}<@lgcode/th>
                <th>{i18n.t("workspace.usage.table.output")}<@lgcode/th>
                <th>{i18n.t("workspace.usage.table.cost")}<@lgcode/th>
                <th>{i18n.t("workspace.usage.table.session")}<@lgcode/th>
              <@lgcode/tr>
            <@lgcode/thead>
            <tbody>
              <For each={store.usage}>
                {(usage, index) => {
                  const date = createMemo(() => new Date(usage.timeCreated))
                  const totalInputTokens = createMemo(() => calculateTotalInputTokens(usage))
                  const totalOutputTokens = createMemo(() => calculateTotalOutputTokens(usage))
                  const inputBreakdownId = `input-breakdown-${index()}`
                  const outputBreakdownId = `output-breakdown-${index()}`
                  const isInputOpen = createMemo(() => openBreakdownId() === inputBreakdownId)
                  const isOutputOpen = createMemo(() => openBreakdownId() === outputBreakdownId)
                  const isClaude = usage.model.toLowerCase().includes("claude")
                  return (
                    <tr>
                      <td data-slot="usage-date" title={formatDateUTC(date())}>
                        {formatDateForTable(date())}
                      <@lgcode/td>
                      <td data-slot="usage-model">{usage.model}<@lgcode/td>
                      <td data-slot="usage-tokens">
                        <div data-slot="tokens-with-breakdown" onClick={(e) => e.stopPropagation()}>
                          <button
                            data-slot="breakdown-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenBreakdownId(isInputOpen() ? null : inputBreakdownId)
                            }}
                          >
                            <IconBreakdown @lgcode/>
                          <@lgcode/button>
                          <span onClick={() => setOpenBreakdownId(null)}>{totalInputTokens()}<@lgcode/span>
                          <Show when={isInputOpen()}>
                            <div data-slot="breakdown-popup" onClick={(e) => e.stopPropagation()}>
                              <div data-slot="breakdown-row">
                                <span data-slot="breakdown-label">{i18n.t("workspace.usage.breakdown.input")}<@lgcode/span>
                                <span data-slot="breakdown-value">{usage.inputTokens}<@lgcode/span>
                              <@lgcode/div>
                              <div data-slot="breakdown-row">
                                <span data-slot="breakdown-label">{i18n.t("workspace.usage.breakdown.cacheRead")}<@lgcode/span>
                                <span data-slot="breakdown-value">{usage.cacheReadTokens ?? 0}<@lgcode/span>
                              <@lgcode/div>
                              <Show when={isClaude}>
                                <div data-slot="breakdown-row">
                                  <span data-slot="breakdown-label">
                                    {i18n.t("workspace.usage.breakdown.cacheWrite")}
                                  <@lgcode/span>
                                  <span data-slot="breakdown-value">{usage.cacheWrite5mTokens ?? 0}<@lgcode/span>
                                <@lgcode/div>
                              <@lgcode/Show>
                            <@lgcode/div>
                          <@lgcode/Show>
                        <@lgcode/div>
                      <@lgcode/td>
                      <td data-slot="usage-tokens">
                        <div data-slot="tokens-with-breakdown" onClick={(e) => e.stopPropagation()}>
                          <button
                            data-slot="breakdown-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenBreakdownId(isOutputOpen() ? null : outputBreakdownId)
                            }}
                          >
                            <IconBreakdown @lgcode/>
                          <@lgcode/button>
                          <span onClick={() => setOpenBreakdownId(null)}>{totalOutputTokens()}<@lgcode/span>
                          <Show when={isOutputOpen()}>
                            <div data-slot="breakdown-popup" onClick={(e) => e.stopPropagation()}>
                              <div data-slot="breakdown-row">
                                <span data-slot="breakdown-label">{i18n.t("workspace.usage.breakdown.output")}<@lgcode/span>
                                <span data-slot="breakdown-value">{usage.outputTokens}<@lgcode/span>
                              <@lgcode/div>
                              <div data-slot="breakdown-row">
                                <span data-slot="breakdown-label">{i18n.t("workspace.usage.breakdown.reasoning")}<@lgcode/span>
                                <span data-slot="breakdown-value">{usage.reasoningTokens ?? 0}<@lgcode/span>
                              <@lgcode/div>
                            <@lgcode/div>
                          <@lgcode/Show>
                        <@lgcode/div>
                      <@lgcode/td>
                      <td data-slot="usage-cost">
                        <Switch fallback={<>${((usage.cost ?? 0) @lgcode/ 100000000).toFixed(4)}<@lgcode/>}>
                          <Match when={usage.enrichment?.plan === "sub"}>
                            {i18n.t("workspace.usage.subscription", {
                              amount: ((usage.cost ?? 0) @lgcode/ 100000000).toFixed(4),
                            })}
                          <@lgcode/Match>
                          <Match when={usage.enrichment?.plan === "lite"}>
                            {i18n.t("workspace.usage.lite", {
                              amount: ((usage.cost ?? 0) @lgcode/ 100000000).toFixed(4),
                            })}
                          <@lgcode/Match>
                          <Match when={usage.enrichment?.plan === "byok"}>
                            {i18n.t("workspace.usage.byok", {
                              amount: ((usage.cost ?? 0) @lgcode/ 100000000).toFixed(4),
                            })}
                          <@lgcode/Match>
                        <@lgcode/Switch>
                      <@lgcode/td>
                      <td data-slot="usage-session">{usage.sessionID?.slice(-8) ?? "-"}<@lgcode/td>
                    <@lgcode/tr>
                  )
                }}
              <@lgcode/For>
            <@lgcode/tbody>
          <@lgcode/table>
          <Show when={canGoPrev() || canGoNext()}>
            <div data-slot="pagination">
              <button disabled={!canGoPrev()} onClick={goPrev}>
                <IconChevronLeft @lgcode/>
              <@lgcode/button>
              <button disabled={!canGoNext()} onClick={goNext}>
                <IconChevronRight @lgcode/>
              <@lgcode/button>
            <@lgcode/div>
          <@lgcode/Show>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/section>
  )
}
