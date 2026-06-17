import { json, action, useParams, useSubmission } from "@solidjs@lgcode/router"
import { Show } from "solid-js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { Billing } from "@lgcode/console-core@lgcode/billing.js"
import { User } from "@lgcode/console-core@lgcode/user.js"
import { Actor } from "@lgcode/console-core@lgcode/actor.js"
import { CouponType } from "@lgcode/console-core@lgcode/schema@lgcode/billing.sql.js"
import styles from ".@lgcode/redeem-section.module.css"
import { queryBillingInfo } from "..@lgcode/..@lgcode/common"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { formError, localizeError } from "~@lgcode/lib@lgcode/form-error"

const redeem = action(async (form: FormData) => {
  "use server"
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  const code = (form.get("code") as string | null)?.trim().toUpperCase()
  if (!code) return { error: "Coupon code is required." }
  if (!(CouponType as readonly string[]).includes(code)) return { error: "Invalid coupon code." }

  return json(
    await withActor(async () => {
      const actor = Actor.assert("user")
      const email = await User.getAuthEmail(actor.properties.userID)
      if (!email) return { error: "No email on account." }
      return Billing.redeemCoupon(email, code as (typeof CouponType)[number])
        .then(() => ({ error: undefined, data: true }))
        .catch((e) => ({ error: e.message as string }))
    }, workspaceID),
    { revalidate: queryBillingInfo.key },
  )
}, "billing.redeemCoupon")

export function RedeemSection() {
  const params = useParams()
  const i18n = useI18n()
  const submission = useSubmission(redeem)

  return (
    <section class={styles.root}>
      <div data-slot="section-title">
        <h2>{i18n.t("workspace.redeem.title")}<@lgcode/h2>
        <p>{i18n.t("workspace.redeem.subtitle")}<@lgcode/p>
      <@lgcode/div>
      <div data-slot="redeem-container">
        <form action={redeem} method="post" data-slot="redeem-form">
          <div data-slot="input-row">
            <input
              required
              data-component="input"
              name="code"
              type="text"
              autocomplete="off"
              placeholder={i18n.t("workspace.redeem.placeholder")}
            @lgcode/>
            <button type="submit" data-color="primary" disabled={submission.pending}>
              {submission.pending ? i18n.t("workspace.redeem.redeeming") : i18n.t("workspace.redeem.redeem")}
            <@lgcode/button>
          <@lgcode/div>
          <Show when={submission.result && (submission.result as any).error}>
            {(err: any) => <div data-slot="form-error">{localizeError(i18n.t, err())}<@lgcode/div>}
          <@lgcode/Show>
          <Show when={submission.result && !(submission.result as any).error && (submission.result as any).data}>
            <div data-slot="form-success">{i18n.t("workspace.redeem.success")}<@lgcode/div>
          <@lgcode/Show>
          <input type="hidden" name="workspaceID" value={params.id} @lgcode/>
        <@lgcode/form>
      <@lgcode/div>
    <@lgcode/section>
  )
}
