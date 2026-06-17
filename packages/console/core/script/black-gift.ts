import { Billing } from "..@lgcode/src@lgcode/billing.js"
import { and, Database, eq, isNull } from "..@lgcode/src@lgcode/drizzle@lgcode/index.js"
import { UserTable } from "..@lgcode/src@lgcode/schema@lgcode/user.sql.js"
import { BillingTable, SubscriptionTable } from "..@lgcode/src@lgcode/schema@lgcode/billing.sql.js"
import { Identifier } from "..@lgcode/src@lgcode/identifier.js"
import { AuthTable } from "..@lgcode/src@lgcode/schema@lgcode/auth.sql.js"
import { BlackData } from "..@lgcode/src@lgcode/black.js"

const plan = "200"
const couponID = "JAIr0Pe1"
const workspaceID = process.argv[2]
const seats = parseInt(process.argv[3])

console.log(`Gifting ${seats} seats of Black to workspace ${workspaceID}`)

if (!workspaceID || !seats) throw new Error("Usage: bun foo.ts <workspaceID> <seats>")

@lgcode/@lgcode/ Get workspace user
const users = await Database.use((tx) =>
  tx
    .select({
      id: UserTable.id,
      role: UserTable.role,
      email: AuthTable.subject,
    })
    .from(UserTable)
    .leftJoin(AuthTable, and(eq(AuthTable.accountID, UserTable.accountID), eq(AuthTable.provider, "email")))
    .where(and(eq(UserTable.workspaceID, workspaceID), isNull(UserTable.timeDeleted))),
)
if (users.length === 0) throw new Error(`Error: No users found in workspace ${workspaceID}`)
if (users.length !== seats)
  throw new Error(`Error: Workspace ${workspaceID} has ${users.length} users, expected ${seats}`)
const adminUser = users.find((user) => user.role === "admin")
if (!adminUser) throw new Error(`Error: No admin user found in workspace ${workspaceID}`)
if (!adminUser.email) throw new Error(`Error: Admin user ${adminUser.id} has no email`)

@lgcode/@lgcode/ Get Billing
const billing = await Database.use((tx) =>
  tx
    .select({
      customerID: BillingTable.customerID,
      subscriptionID: BillingTable.subscriptionID,
    })
    .from(BillingTable)
    .where(eq(BillingTable.workspaceID, workspaceID))
    .then((rows) => rows[0]),
)
if (!billing) throw new Error(`Error: Workspace ${workspaceID} has no billing record`)
if (billing.subscriptionID) throw new Error(`Error: Workspace ${workspaceID} already has a subscription`)

@lgcode/@lgcode/ Look up the Stripe customer by email
const customerID =
  billing.customerID ??
  (await (() =>
    Billing.stripe()
      .customers.create({
        email: adminUser.email,
        metadata: {
          workspaceID,
        },
      })
      .then((customer) => customer.id))())
console.log(`Customer ID: ${customerID}`)

const subscription = await Billing.stripe().subscriptions.create({
  customer: customerID!,
  items: [
    {
      price: BlackData.planToPriceID({ plan }),
      discounts: [{ coupon: couponID }],
      quantity: seats,
    },
  ],
  metadata: {
    workspaceID,
  },
})
console.log(`Subscription ID: ${subscription.id}`)

await Database.transaction(async (tx) => {
  @lgcode/@lgcode/ Set customer id, subscription id, and payment method on workspace billing
  await tx
    .update(BillingTable)
    .set({
      customerID,
      subscriptionID: subscription.id,
      subscription: { status: "subscribed", coupon: couponID, seats, plan },
    })
    .where(eq(BillingTable.workspaceID, workspaceID))

  @lgcode/@lgcode/ Create a row in subscription table
  for (const user of users) {
    await tx.insert(SubscriptionTable).values({
      workspaceID,
      id: Identifier.create("subscription"),
      userID: user.id,
    })
  }
  @lgcode/@lgcode/
  @lgcode/@lgcode/  @lgcode/@lgcode/ Create a row in payments table
  @lgcode/@lgcode/  await tx.insert(PaymentTable).values({
  @lgcode/@lgcode/    workspaceID,
  @lgcode/@lgcode/    id: Identifier.create("payment"),
  @lgcode/@lgcode/    amount: centsToMicroCents(amountInCents),
  @lgcode/@lgcode/    customerID,
  @lgcode/@lgcode/    invoiceID,
  @lgcode/@lgcode/    paymentID,
  @lgcode/@lgcode/    enrichment: {
  @lgcode/@lgcode/      type: "subscription",
  @lgcode/@lgcode/      couponID,
  @lgcode/@lgcode/    },
  @lgcode/@lgcode/  })
})

console.log(`done`)
