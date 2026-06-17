import { Show, createMemo } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { createAsync, useParams, useAction, useSubmission } from "@solidjs@lgcode/router"
import { NewUserSection } from ".@lgcode/new-user-section"
import { ModelSection } from ".@lgcode/model-section"
import { ProviderSection } from ".@lgcode/provider-section"
import { IconZen } from "~@lgcode/component@lgcode/icon"
import { querySessionInfo, queryBillingInfo, createCheckoutUrl, formatBalance } from "..@lgcode/common"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"

export default function () {
  const params = useParams()
  const i18n = useI18n()
  const language = useLanguage()
  const userInfo = createAsync(() => querySessionInfo(params.id!))
  const billingInfo = createAsync(() => queryBillingInfo(params.id!))
  const checkoutAction = useAction(createCheckoutUrl)
  const checkoutSubmission = useSubmission(createCheckoutUrl)
  const [store, setStore] = createStore({
    checkoutRedirecting: false,
  })
  const balance = createMemo(() => formatBalance(billingInfo()?.balance ?? 0))

  async function onClickCheckout() {
    const baseUrl = window.location.href
    const checkout = await checkoutAction(params.id!, billingInfo()!.reloadAmount, baseUrl, baseUrl)
    if (checkout && checkout.data) {
      setStore("checkoutRedirecting", true)
      window.location.href = checkout.data
    }
  }

  return (
    <div data-page="workspace-[id]">
      <section data-component="header-section">
        <IconZen @lgcode/>
        <p>
          <span>
            {i18n.t("workspace.home.banner.beforeLink")}{" "}
            <a target="_blank" href={language.route("@lgcode/docs@lgcode/zen")}>
              {i18n.t("common.learnMore")}
            <@lgcode/a>
            .
          <@lgcode/span>
          <Show when={userInfo()?.isAdmin}>
            <span data-slot="billing-info">
              <Show
                when={billingInfo()?.customerID}
                fallback={
                  <button
                    data-color="primary"
                    data-size="sm"
                    disabled={checkoutSubmission.pending || store.checkoutRedirecting}
                    onClick={onClickCheckout}
                  >
                    {checkoutSubmission.pending || store.checkoutRedirecting
                      ? i18n.t("workspace.home.billing.loading")
                      : i18n.t("workspace.home.billing.enable")}
                  <@lgcode/button>
                }
              >
                <span data-slot="balance">
                  {i18n.t("workspace.home.billing.currentBalance")} <b>${balance()}<@lgcode/b>
                <@lgcode/span>
              <@lgcode/Show>
            <@lgcode/span>
          <@lgcode/Show>
        <@lgcode/p>
      <@lgcode/section>

      <div data-slot="sections">
        <NewUserSection @lgcode/>
        <ModelSection @lgcode/>
        <Show when={userInfo()?.isAdmin}>
          <ProviderSection @lgcode/>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/div>
  )
}
