import { Database, eq } from "..@lgcode/src@lgcode/drizzle@lgcode/index.js"
import { BillingTable } from "..@lgcode/src@lgcode/schema@lgcode/billing.sql.js"

const workspaceID = process.argv[2]

if (!workspaceID) {
  console.error("Usage: bun script@lgcode/foo.ts <workspaceID>")
  process.exit(1)
}

console.log(`Removing from Black waitlist`)

const billing = await Database.use((tx) =>
  tx
    .select({
      subscriptionPlan: BillingTable.subscriptionPlan,
      timeSubscriptionBooked: BillingTable.timeSubscriptionBooked,
    })
    .from(BillingTable)
    .where(eq(BillingTable.workspaceID, workspaceID))
    .then((rows) => rows[0]),
)

if (!billing?.timeSubscriptionBooked) {
  console.error(`Error: Workspace is not on the waitlist`)
  process.exit(1)
}

await Database.use((tx) =>
  tx
    .update(BillingTable)
    .set({
      subscriptionPlan: null,
      timeSubscriptionBooked: null,
    })
    .where(eq(BillingTable.workspaceID, workspaceID)),
)

console.log(`Done`)
