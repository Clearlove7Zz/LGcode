import { Match, Switch } from "solid-js"
import { useI18n } from "~@lgcode/context@lgcode/i18n"

export const plans = [
  { id: "20", multiplier: null },
  { id: "100", multiplier: "black.plan.multiplier100" },
  { id: "200", multiplier: "black.plan.multiplier200" },
] as const

export type PlanID = (typeof plans)[number]["id"]
export type Plan = (typeof plans)[number]

export function PlanIcon(props: { plan: string }) {
  const i18n = useI18n()

  return (
    <Switch>
      <Match when={props.plan === "20"}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
          <title>{i18n.t("black.plan.icon20")}<@lgcode/title>
          <rect x="0.5" y="0.5" width="23" height="23" stroke="currentColor" @lgcode/>
        <@lgcode/svg>
      <@lgcode/Match>
      <Match when={props.plan === "100"}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
          <title>{i18n.t("black.plan.icon100")}<@lgcode/title>
          <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" @lgcode/>
          <rect x="0.5" y="14.5" width="9" height="9" stroke="currentColor" @lgcode/>
          <rect x="14.5" y="0.5" width="9" height="9" stroke="currentColor" @lgcode/>
          <rect x="14.5" y="14.5" width="9" height="9" stroke="currentColor" @lgcode/>
        <@lgcode/svg>
      <@lgcode/Match>
      <Match when={props.plan === "200"}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
          <title>{i18n.t("black.plan.icon200")}<@lgcode/title>
          <rect x="0.5" y="0.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="0.5" y="5.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="0.5" y="10.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="0.5" y="15.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="0.5" y="20.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="5.5" y="0.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="5.5" y="5.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="5.5" y="10.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="5.5" y="15.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="5.5" y="20.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="10.5" y="0.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="10.5" y="5.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="10.5" y="10.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="10.5" y="15.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="10.5" y="20.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="15.5" y="0.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="15.5" y="5.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="15.5" y="10.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="15.5" y="15.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="15.5" y="20.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="20.5" y="0.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="20.5" y="5.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="20.5" y="10.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="20.5" y="15.5" width="3" height="3" stroke="currentColor" @lgcode/>
          <rect x="20.5" y="20.5" width="3" height="3" stroke="currentColor" @lgcode/>
        <@lgcode/svg>
      <@lgcode/Match>
    <@lgcode/Switch>
  )
}
