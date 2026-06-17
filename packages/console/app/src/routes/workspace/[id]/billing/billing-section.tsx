import { action, useParams, useAction, createAsync, useSubmission, json } from "@solidjs@lgcode/router"
import { createMemo, Match, Show, Switch, createEffect } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { Billing } from "@lgcode/console-core@lgcode/billing.js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { IconAlipay, IconCreditCard, IconStripe, IconUpi, IconWechat } from "~@lgcode/component@lgcode/icon"
import styles from ".@lgcode/billing-section.module.css"
import { createCheckoutUrl, formatBalance, queryBillingInfo } from "..@lgcode/..@lgcode/common"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { localizeError } from "~@lgcode/lib@lgcode/form-error"

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
    { revalidate: queryBillingInfo.key },
  )
}, "sessionUrl")

export function BillingSection() {
  const params = useParams()
  const i18n = useI18n()
  @lgcode/@lgcode/ ORIGINAL CODE - COMMENTED OUT FOR TESTING
  const billingInfo = createAsync(() => queryBillingInfo(params.id!))
  const checkoutAction = useAction(createCheckoutUrl)
  const checkoutSubmission = useSubmission(createCheckoutUrl)
  const sessionAction = useAction(createSessionUrl)
  const sessionSubmission = useSubmission(createSessionUrl)
  const [store, setStore] = createStore({
    showAddBalanceForm: false,
    addBalanceAmount: billingInfo()?.reloadAmount.toString() ?? "",
    checkoutRedirecting: false,
    sessionRedirecting: false,
  })

  createEffect(() => {
    const info = billingInfo()
    if (info) {
      setStore("addBalanceAmount", info.reloadAmount.toString())
    }
  })
  const balance = createMemo(() => formatBalance(billingInfo()?.balance ?? 0))

  async function onClickCheckout() {
    const amount = parseInt(store.addBalanceAmount)
    const baseUrl = window.location.href

    const checkout = await checkoutAction(params.id!, amount, baseUrl, baseUrl)
    if (checkout && checkout.data) {
      setStore("checkoutRedirecting", true)
      window.location.href = checkout.data
    }
  }

  async function onClickSession() {
    const baseUrl = window.location.href
    const sessionUrl = await sessionAction(params.id!, baseUrl)
    if (sessionUrl && sessionUrl.data) {
      setStore("sessionRedirecting", true)
      window.location.href = sessionUrl.data
    }
  }

  function showAddBalanceForm() {
    while (true) {
      checkoutSubmission.clear()
      if (!checkoutSubmission.result) break
    }
    setStore({
      showAddBalanceForm: true,
    })
  }

  function hideAddBalanceForm() {
    setStore("showAddBalanceForm", false)
    checkoutSubmission.clear()
  }

  @lgcode/@lgcode/ DUMMY DATA FOR TESTING - UNCOMMENT ONE OF THE SCENARIOS BELOW

  @lgcode/@lgcode/ Scenario 1: User has not added billing details and has no balance
  @lgcode/@lgcode/ const balanceInfo = () => ({
  @lgcode/@lgcode/   balance: 0,
  @lgcode/@lgcode/   paymentMethodType: null as string | null,
  @lgcode/@lgcode/   paymentMethodLast4: null as string | null,
  @lgcode/@lgcode/   reload: false,
  @lgcode/@lgcode/   reloadError: null as string | null,
  @lgcode/@lgcode/   timeReloadError: null as Date | null,
  @lgcode/@lgcode/ })

  @lgcode/@lgcode/ Scenario 2: User has not added billing details but has a balance
  @lgcode/@lgcode/ const balanceInfo = () => ({
  @lgcode/@lgcode/   balance: 1500000000, @lgcode/@lgcode/ $15.00
  @lgcode/@lgcode/   paymentMethodType: null as string | null,
  @lgcode/@lgcode/   paymentMethodLast4: null as string | null,
  @lgcode/@lgcode/   reload: false,
  @lgcode/@lgcode/   reloadError: null as string | null,
  @lgcode/@lgcode/   timeReloadError: null as Date | null
  @lgcode/@lgcode/ })

  @lgcode/@lgcode/ Scenario 3: User has added billing details (reload enabled)
  @lgcode/@lgcode/ const balanceInfo = () => ({
  @lgcode/@lgcode/   balance: 750000000, @lgcode/@lgcode/ $7.50
  @lgcode/@lgcode/   paymentMethodType: "card",
  @lgcode/@lgcode/   paymentMethodLast4: "4242",
  @lgcode/@lgcode/   reload: true,
  @lgcode/@lgcode/   reloadError: null as string | null,
  @lgcode/@lgcode/   timeReloadError: null as Date | null
  @lgcode/@lgcode/ })

  @lgcode/@lgcode/ Scenario 4: User has billing details but reload failed
  @lgcode/@lgcode/ const balanceInfo = () => ({
  @lgcode/@lgcode/   balance: 250000000, @lgcode/@lgcode/ $2.50
  @lgcode/@lgcode/   paymentMethodType: "card",
  @lgcode/@lgcode/   paymentMethodLast4: "4242",
  @lgcode/@lgcode/   reload: true,
  @lgcode/@lgcode/   reloadError: "Your card was declined." as string,
  @lgcode/@lgcode/   timeReloadError: new Date(Date.now() - 3600000) as Date @lgcode/@lgcode/ 1 hour ago
  @lgcode/@lgcode/ })

  @lgcode/@lgcode/ Scenario 5: User has Link payment method
  @lgcode/@lgcode/ const balanceInfo = () => ({
  @lgcode/@lgcode/   balance: 500000000, @lgcode/@lgcode/ $5.00
  @lgcode/@lgcode/   paymentMethodType: "link",
  @lgcode/@lgcode/   paymentMethodLast4: null as string | null,
  @lgcode/@lgcode/   reload: true,
  @lgcode/@lgcode/   reloadError: null as string | null,
  @lgcode/@lgcode/   timeReloadError: null as Date | null
  @lgcode/@lgcode/ })

  return (
    <section class={styles.root}>
      <div data-slot="section-title">
        <h2>{i18n.t("workspace.billing.title")}<@lgcode/h2>
        <p>
          {i18n.t("workspace.billing.subtitle.beforeLink")}{" "}
          <a href="mailto:help@anoma.ly">{i18n.t("workspace.billing.contactUs")}<@lgcode/a>{" "}
          {i18n.t("workspace.billing.subtitle.afterLink")}
        <@lgcode/p>
      <@lgcode/div>
      <div data-slot="section-content">
        <div data-slot="balance-display">
          <div data-slot="balance-amount">
            <span data-slot="balance-value">${balance()}<@lgcode/span>
            <span data-slot="balance-label">{i18n.t("workspace.billing.currentBalance")}<@lgcode/span>
          <@lgcode/div>
          <Show when={billingInfo()?.customerID}>
            <div data-slot="balance-right-section">
              <Show
                when={!store.showAddBalanceForm}
                fallback={
                  <div data-slot="add-balance-form-container">
                    <div data-slot="add-balance-form">
                      <label>{i18n.t("workspace.billing.add")}<@lgcode/label>
                      <input
                        data-component="input"
                        type="number"
                        min={billingInfo()?.reloadAmountMin.toString()}
                        step="1"
                        value={store.addBalanceAmount}
                        onInput={(e) => {
                          setStore("addBalanceAmount", e.currentTarget.value)
                          checkoutSubmission.clear()
                        }}
                        placeholder={i18n.t("workspace.billing.enterAmount")}
                      @lgcode/>
                      <div data-slot="form-actions">
                        <button data-color="ghost" type="button" onClick={() => hideAddBalanceForm()}>
                          {i18n.t("common.cancel")}
                        <@lgcode/button>
                        <button
                          data-color="primary"
                          type="button"
                          disabled={!store.addBalanceAmount || checkoutSubmission.pending || store.checkoutRedirecting}
                          onClick={onClickCheckout}
                        >
                          {checkoutSubmission.pending || store.checkoutRedirecting
                            ? i18n.t("workspace.billing.loading")
                            : i18n.t("workspace.billing.addAction")}
                        <@lgcode/button>
                      <@lgcode/div>
                    <@lgcode/div>
                    <Show when={checkoutSubmission.result && (checkoutSubmission.result as any).error}>
                      {(err: any) => <div data-slot="form-error">{localizeError(i18n.t, err())}<@lgcode/div>}
                    <@lgcode/Show>
                  <@lgcode/div>
                }
              >
                <button data-color="primary" onClick={() => showAddBalanceForm()}>
                  {i18n.t("workspace.billing.addBalance")}
                <@lgcode/button>
              <@lgcode/Show>
              <div data-slot="credit-card">
                <div data-slot="card-icon">
                  <Switch fallback={<IconCreditCard style={{ width: "24px", height: "24px" }} @lgcode/>}>
                    <Match when={billingInfo()?.paymentMethodType === "link"}>
                      <IconStripe style={{ width: "24px", height: "24px" }} @lgcode/>
                    <@lgcode/Match>
                    <Match when={billingInfo()?.paymentMethodType === "alipay"}>
                      <IconAlipay style={{ width: "24px", height: "24px" }} @lgcode/>
                    <@lgcode/Match>
                    <Match when={billingInfo()?.paymentMethodType === "wechat_pay"}>
                      <IconWechat style={{ width: "24px", height: "24px" }} @lgcode/>
                    <@lgcode/Match>
                    <Match when={billingInfo()?.paymentMethodType === "upi"}>
                      <IconUpi style={{ width: "auto", height: "16px" }} @lgcode/>
                    <@lgcode/Match>
                  <@lgcode/Switch>
                <@lgcode/div>
                <div data-slot="card-details">
                  <Switch>
                    <Match when={billingInfo()?.paymentMethodType === "card"}>
                      <Show when={billingInfo()?.paymentMethodLast4} fallback={<span data-slot="number">----<@lgcode/span>}>
                        <span data-slot="secret">••••<@lgcode/span>
                        <span data-slot="number">{billingInfo()?.paymentMethodLast4}<@lgcode/span>
                      <@lgcode/Show>
                    <@lgcode/Match>
                    <Match when={billingInfo()?.paymentMethodType === "link"}>
                      <span data-slot="type">{i18n.t("workspace.billing.linkedToStripe")}<@lgcode/span>
                    <@lgcode/Match>
                    <Match when={billingInfo()?.paymentMethodType === "alipay"}>
                      <span data-slot="type">{i18n.t("workspace.billing.alipay")}<@lgcode/span>
                    <@lgcode/Match>
                    <Match when={billingInfo()?.paymentMethodType === "wechat_pay"}>
                      <span data-slot="type">{i18n.t("workspace.billing.wechat")}<@lgcode/span>
                    <@lgcode/Match>
                  <@lgcode/Switch>
                <@lgcode/div>
                <button
                  data-color="ghost"
                  disabled={sessionSubmission.pending || store.sessionRedirecting}
                  onClick={onClickSession}
                >
                  {sessionSubmission.pending || store.sessionRedirecting
                    ? i18n.t("workspace.billing.loading")
                    : i18n.t("workspace.billing.manage")}
                <@lgcode/button>
              <@lgcode/div>
            <@lgcode/div>
          <@lgcode/Show>
        <@lgcode/div>
        <Show when={!billingInfo()?.customerID}>
          <button
            data-slot="enable-billing-button"
            data-color="primary"
            disabled={checkoutSubmission.pending || store.checkoutRedirecting}
            onClick={onClickCheckout}
          >
            {checkoutSubmission.pending || store.checkoutRedirecting
              ? i18n.t("workspace.billing.loading")
              : i18n.t("workspace.billing.enable")}
          <@lgcode/button>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/section>
  )
}
