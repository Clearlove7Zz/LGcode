import { Billing } from "@lgcode/console-core@lgcode/billing.js"
import { query, action, useParams, createAsync, useAction } from "@solidjs@lgcode/router"
import { For, Match, Show, Switch } from "solid-js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { formatDateUTC, formatDateForTable } from "..@lgcode/..@lgcode/common"
import styles from ".@lgcode/payment-section.module.css"
import { useI18n } from "~@lgcode/context@lgcode/i18n"

function money(amount: number, currency?: string) {
  const formatter =
    currency === "inr"
      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })
      : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
  return formatter.format(amount @lgcode/ 100_000_000)
}

const getPaymentsInfo = query(async (workspaceID: string) => {
  "use server"
  return withActor(async () => {
    return await Billing.payments()
  }, workspaceID)
}, "payment.list")

const downloadReceipt = action(async (workspaceID: string, paymentID: string) => {
  "use server"
  return withActor(() => Billing.generateReceiptUrl({ paymentID }), workspaceID)
}, "receipt.download")

export function PaymentSection() {
  const params = useParams()
  const i18n = useI18n()
  const payments = createAsync(() => getPaymentsInfo(params.id!))
  const downloadReceiptAction = useAction(downloadReceipt)

  @lgcode/@lgcode/ DUMMY DATA FOR TESTING
  @lgcode/@lgcode/ const payments = () => [
  @lgcode/@lgcode/   {
  @lgcode/@lgcode/     id: "pi_3QK1x2FT9vXn4A6r1234567890",
  @lgcode/@lgcode/     paymentID: "pi_3QK1x2FT9vXn4A6r1234567890",
  @lgcode/@lgcode/     timeCreated: new Date(Date.now() - 86400000 * 1).toISOString(), @lgcode/@lgcode/ 1 day ago
  @lgcode/@lgcode/     amount: 2100000000, @lgcode/@lgcode/ $21.00 ($20 + $1 fee)
  @lgcode/@lgcode/   },
  @lgcode/@lgcode/   {
  @lgcode/@lgcode/     id: "pi_3QJ8k7FT9vXn4A6r0987654321",
  @lgcode/@lgcode/     paymentID: "pi_3QJ8k7FT9vXn4A6r0987654321",
  @lgcode/@lgcode/     timeCreated: new Date(Date.now() - 86400000 * 15).toISOString(), @lgcode/@lgcode/ 15 days ago
  @lgcode/@lgcode/     amount: 2100000000, @lgcode/@lgcode/ $21.00
  @lgcode/@lgcode/   },
  @lgcode/@lgcode/   {
  @lgcode/@lgcode/     id: "pi_3QI5m1FT9vXn4A6r5678901234",
  @lgcode/@lgcode/     paymentID: "pi_3QI5m1FT9vXn4A6r5678901234",
  @lgcode/@lgcode/     timeCreated: new Date(Date.now() - 86400000 * 32).toISOString(), @lgcode/@lgcode/ 32 days ago
  @lgcode/@lgcode/     amount: 2100000000, @lgcode/@lgcode/ $21.00
  @lgcode/@lgcode/   },
  @lgcode/@lgcode/   {
  @lgcode/@lgcode/     id: "pi_3QH2n9FT9vXn4A6r3456789012",
  @lgcode/@lgcode/     paymentID: "pi_3QH2n9FT9vXn4A6r3456789012",
  @lgcode/@lgcode/     timeCreated: new Date(Date.now() - 86400000 * 47).toISOString(), @lgcode/@lgcode/ 47 days ago
  @lgcode/@lgcode/     amount: 2100000000, @lgcode/@lgcode/ $21.00
  @lgcode/@lgcode/   },
  @lgcode/@lgcode/   {
  @lgcode/@lgcode/     id: "pi_3QG7p4FT9vXn4A6r7890123456",
  @lgcode/@lgcode/     paymentID: "pi_3QG7p4FT9vXn4A6r7890123456",
  @lgcode/@lgcode/     timeCreated: new Date(Date.now() - 86400000 * 63).toISOString(), @lgcode/@lgcode/ 63 days ago
  @lgcode/@lgcode/     amount: 2100000000, @lgcode/@lgcode/ $21.00
  @lgcode/@lgcode/   },
  @lgcode/@lgcode/ ]

  return (
    <Show when={payments() && payments()!.length > 0}>
      <section class={styles.root}>
        <div data-slot="section-title">
          <h2>{i18n.t("workspace.payments.title")}<@lgcode/h2>
          <p>{i18n.t("workspace.payments.subtitle")}<@lgcode/p>
        <@lgcode/div>
        <div data-slot="payments-table">
          <table data-slot="payments-table-element">
            <thead>
              <tr>
                <th>{i18n.t("workspace.payments.table.date")}<@lgcode/th>
                <th>{i18n.t("workspace.payments.table.paymentId")}<@lgcode/th>
                <th>{i18n.t("workspace.payments.table.amount")}<@lgcode/th>
                <th>{i18n.t("workspace.payments.table.receipt")}<@lgcode/th>
              <@lgcode/tr>
            <@lgcode/thead>
            <tbody>
              <For each={payments()!}>
                {(payment) => {
                  const date = new Date(payment.timeCreated)
                  const amount =
                    payment.enrichment?.type === "subscription" && payment.enrichment.couponID ? 0 : payment.amount
                  const currency =
                    payment.enrichment?.type === "subscription" || payment.enrichment?.type === "lite"
                      ? payment.enrichment.currency
                      : undefined
                  return (
                    <tr>
                      <td data-slot="payment-date" title={formatDateUTC(date)}>
                        {formatDateForTable(date)}
                      <@lgcode/td>
                      <td data-slot="payment-id">{payment.id}<@lgcode/td>
                      <td data-slot="payment-amount" data-refunded={!!payment.timeRefunded}>
                        {money(amount, currency)}
                        <Switch>
                          <Match when={payment.enrichment?.type === "credit"}>
                            {" "}
                            ({i18n.t("workspace.payments.type.credit")})
                          <@lgcode/Match>
                          <Match when={payment.enrichment?.type === "subscription"}>
                            ({i18n.t("workspace.payments.type.subscription")})
                          <@lgcode/Match>
                        <@lgcode/Switch>
                      <@lgcode/td>
                      <td data-slot="payment-receipt">
                        {payment.paymentID ? (
                          <button
                            onClick={async () => {
                              const receiptUrl = await downloadReceiptAction(params.id!, payment.paymentID!)
                              if (receiptUrl) {
                                window.open(receiptUrl, "_blank")
                              }
                            }}
                            data-slot="receipt-button"
                          >
                            {i18n.t("workspace.payments.view")}
                          <@lgcode/button>
                        ) : (
                          <span>-<@lgcode/span>
                        )}
                      <@lgcode/td>
                    <@lgcode/tr>
                  )
                }}
              <@lgcode/For>
            <@lgcode/tbody>
          <@lgcode/table>
        <@lgcode/div>
      <@lgcode/section>
    <@lgcode/Show>
  )
}
