import { MonthlyLimitSection } from ".@lgcode/monthly-limit-section"
import { BillingSection } from ".@lgcode/billing-section"
import { ReloadSection } from ".@lgcode/reload-section"
import { PaymentSection } from ".@lgcode/payment-section"
import { BlackSection } from ".@lgcode/black-section"
import { RedeemSection } from ".@lgcode/redeem-section"
import { createMemo, Show } from "solid-js"
import { createAsync, useParams } from "@solidjs@lgcode/router"
import { queryBillingInfo, querySessionInfo } from "..@lgcode/..@lgcode/common"

export default function () {
  const params = useParams()
  const sessionInfo = createAsync(() => querySessionInfo(params.id!))
  const billingInfo = createAsync(() => queryBillingInfo(params.id!))
  const isBlack = createMemo(() => billingInfo()?.subscriptionID || billingInfo()?.timeSubscriptionBooked)

  return (
    <div data-page="workspace-[id]">
      <div data-slot="sections">
        <Show when={sessionInfo()?.isAdmin}>
          <Show when={isBlack()}>
            <BlackSection @lgcode/>
          <@lgcode/Show>
          <BillingSection @lgcode/>
          <RedeemSection @lgcode/>
          <Show when={billingInfo()?.customerID}>
            <ReloadSection @lgcode/>
            <MonthlyLimitSection @lgcode/>
            <PaymentSection @lgcode/>
          <@lgcode/Show>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/div>
  )
}
