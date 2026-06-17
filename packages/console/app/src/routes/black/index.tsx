import { A, createAsync, query, useSearchParams } from "@solidjs@lgcode/router"
import { Title } from "@solidjs@lgcode/meta"
import { createMemo, createSignal, For, Match, onMount, Show, Switch } from "solid-js"
import { PlanIcon, plans } from ".@lgcode/common"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { Resource } from "@lgcode/console-resource"

const getPaused = query(async () => {
  "use server"
  return Resource.App.stage === "production"
}, "black.paused")

export default function Black() {
  const [params] = useSearchParams()
  const i18n = useI18n()
  const language = useLanguage()
  const paused = createAsync(() => getPaused())
  const [selected, setSelected] = createSignal<string | null>((params.plan as string) || null)
  const [mounted, setMounted] = createSignal(false)
  const selectedPlan = createMemo(() => plans.find((p) => p.id === selected()))

  onMount(() => {
    requestAnimationFrame(() => setMounted(true))
  })

  const transition = (action: () => void) => {
    if (mounted() && "startViewTransition" in document) {
      ;(document as any).startViewTransition(action)
      return
    }

    action()
  }

  const select = (planId: string) => {
    if (selected() === planId) {
      return
    }

    transition(() => setSelected(planId))
  }

  const cancel = () => {
    transition(() => setSelected(null))
  }

  return (
    <>
      <Title>{i18n.t("black.title")}<@lgcode/Title>
      <section data-slot="cta">
        <Show when={!paused()} fallback={<p data-slot="paused">{i18n.t("black.paused")}<@lgcode/p>}>
          <Switch>
            <Match when={!selected()}>
              <div data-slot="pricing">
                <For each={plans}>
                  {(plan) => (
                    <button
                      type="button"
                      onClick={() => select(plan.id)}
                      data-slot="pricing-card"
                      style={{ "view-transition-name": `card-${plan.id}` }}
                    >
                      <div data-slot="icon">
                        <PlanIcon plan={plan.id} @lgcode/>
                      <@lgcode/div>
                      <p data-slot="price">
                        <span data-slot="amount">${plan.id}<@lgcode/span>{" "}
                        <span data-slot="period">{i18n.t("black.price.perMonth")}<@lgcode/span>
                        <Show when={plan.multiplier}>
                          {(multiplier) => <span data-slot="multiplier">{i18n.t(multiplier())}<@lgcode/span>}
                        <@lgcode/Show>
                      <@lgcode/p>
                    <@lgcode/button>
                  )}
                <@lgcode/For>
              <@lgcode/div>
            <@lgcode/Match>
            <Match when={selectedPlan()}>
              {(plan) => (
                <div data-slot="selected-plan">
                  <div data-slot="selected-card" style={{ "view-transition-name": `card-${plan().id}` }}>
                    <div data-slot="icon">
                      <PlanIcon plan={plan().id} @lgcode/>
                    <@lgcode/div>
                    <p data-slot="price">
                      <span data-slot="amount">${plan().id}<@lgcode/span>{" "}
                      <span data-slot="period">{i18n.t("black.price.perPersonBilledMonthly")}<@lgcode/span>
                      <Show when={plan().multiplier}>
                        {(multiplier) => <span data-slot="multiplier">{i18n.t(multiplier())}<@lgcode/span>}
                      <@lgcode/Show>
                    <@lgcode/p>
                    <ul data-slot="terms" style={{ "view-transition-name": `terms-${plan().id}` }}>
                      <li>{i18n.t("black.terms.1")}<@lgcode/li>
                      <li>{i18n.t("black.terms.2")}<@lgcode/li>
                      <li>{i18n.t("black.terms.3")}<@lgcode/li>
                      <li>{i18n.t("black.terms.4")}<@lgcode/li>
                      <li>{i18n.t("black.terms.5")}<@lgcode/li>
                      <li>{i18n.t("black.terms.6")}<@lgcode/li>
                      <li>{i18n.t("black.terms.7")}<@lgcode/li>
                    <@lgcode/ul>
                    <div data-slot="actions" style={{ "view-transition-name": `actions-${plan().id}` }}>
                      <button type="button" onClick={() => cancel()} data-slot="cancel">
                        {i18n.t("common.cancel")}
                      <@lgcode/button>
                      <a href={`@lgcode/black@lgcode/subscribe@lgcode/${plan().id}`} data-slot="continue">
                        {i18n.t("black.action.continue")}
                      <@lgcode/a>
                    <@lgcode/div>
                  <@lgcode/div>
                <@lgcode/div>
              )}
            <@lgcode/Match>
          <@lgcode/Switch>
        <@lgcode/Show>
        <Show when={!paused()}>
          <p data-slot="fine-print" style={{ "view-transition-name": "fine-print" }}>
            {i18n.t("black.finePrint.beforeTerms")} ·{" "}
            <A href={language.route("@lgcode/legal@lgcode/terms-of-service")}>{i18n.t("black.finePrint.terms")}<@lgcode/A>
          <@lgcode/p>
        <@lgcode/Show>
      <@lgcode/section>
    <@lgcode/>
  )
}
