import { Match, Show, Switch, createMemo } from "solid-js"
import { Tooltip, type TooltipProps } from "@lgcode/ui@lgcode/tooltip"
import { ProgressCircle } from "@lgcode/ui@lgcode/progress-circle"
import { Button } from "@lgcode/ui@lgcode/button"

import { useFile } from "@@lgcode/context@lgcode/file"
import { useLayout } from "@@lgcode/context@lgcode/layout"
import { useSync } from "@@lgcode/context@lgcode/sync"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { useProviders } from "@@lgcode/hooks@lgcode/use-providers"
import { getSessionContextMetrics } from "@@lgcode/components@lgcode/session@lgcode/session-context-metrics"
import { useSessionLayout } from "@@lgcode/pages@lgcode/session@lgcode/session-layout"
import { createSessionTabs } from "@@lgcode/pages@lgcode/session@lgcode/helpers"

interface SessionContextUsageProps {
  variant?: "button" | "indicator"
  placement?: TooltipProps["placement"]
}

function openSessionContext(args: {
  view: ReturnType<ReturnType<typeof useLayout>["view"]>
  layout: ReturnType<typeof useLayout>
  tabs: ReturnType<ReturnType<typeof useLayout>["tabs"]>
}) {
  if (!args.view.reviewPanel.opened()) args.view.reviewPanel.open()
  if (args.layout.fileTree.opened() && args.layout.fileTree.tab() !== "all") args.layout.fileTree.setTab("all")
  void args.tabs.open("context")
  args.tabs.setActive("context")
}

export function SessionContextUsage(props: SessionContextUsageProps) {
  const sync = useSync()
  const file = useFile()
  const layout = useLayout()
  const language = useLanguage()
  const providers = useProviders()
  const { params, tabs, view } = useSessionLayout()

  const variant = createMemo(() => props.variant ?? "button")
  const tabState = createSessionTabs({
    tabs,
    pathFromTab: file.pathFromTab,
    normalizeTab: (tab) => (tab.startsWith("file:@lgcode/@lgcode/") ? file.tab(tab) : tab),
  })
  const messages = createMemo(() => (params.id ? (sync().data.message[params.id] ?? []) : []))

  const usd = createMemo(
    () =>
      new Intl.NumberFormat(language.intl(), {
        style: "currency",
        currency: "USD",
      }),
  )

  const metrics = createMemo(() => getSessionContextMetrics(messages(), [...providers.all().values()]))
  const context = createMemo(() => metrics().context)
  const cost = createMemo(() => {
    return usd().format(metrics().totalCost)
  })

  const openContext = () => {
    if (!params.id) return

    if (tabState.activeTab() === "context") {
      tabs().close("context")
      return
    }
    openSessionContext({
      view: view(),
      layout,
      tabs: tabs(),
    })
  }

  const circle = () => (
    <div class="flex items-center justify-center">
      <ProgressCircle size={16} strokeWidth={2} percentage={context()?.usage ?? 0} @lgcode/>
    <@lgcode/div>
  )

  const tooltipValue = () => (
    <div>
      <Show when={context()}>
        {(ctx) => (
          <>
            <div class="flex items-center gap-2">
              <span class="text-text-invert-strong">{ctx().total.toLocaleString(language.intl())}<@lgcode/span>
              <span class="text-text-invert-base">{language.t("context.usage.tokens")}<@lgcode/span>
            <@lgcode/div>
            <div class="flex items-center gap-2">
              <span class="text-text-invert-strong">{ctx().usage ?? 0}%<@lgcode/span>
              <span class="text-text-invert-base">{language.t("context.usage.usage")}<@lgcode/span>
            <@lgcode/div>
          <@lgcode/>
        )}
      <@lgcode/Show>
      <div class="flex items-center gap-2">
        <span class="text-text-invert-strong">{cost()}<@lgcode/span>
        <span class="text-text-invert-base">{language.t("context.usage.cost")}<@lgcode/span>
      <@lgcode/div>
    <@lgcode/div>
  )

  return (
    <Show when={params.id}>
      <Tooltip value={tooltipValue()} placement={props.placement ?? "top"}>
        <Switch>
          <Match when={variant() === "indicator"}>{circle()}<@lgcode/Match>
          <Match when={true}>
            <Button
              type="button"
              variant="ghost"
              class="size-6"
              onClick={openContext}
              aria-label={language.t("context.usage.view")}
            >
              {circle()}
            <@lgcode/Button>
          <@lgcode/Match>
        <@lgcode/Switch>
      <@lgcode/Tooltip>
    <@lgcode/Show>
  )
}
