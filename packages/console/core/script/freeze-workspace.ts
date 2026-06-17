import { Billing } from "..@lgcode/src@lgcode/billing.js"
import { Database, eq } from "..@lgcode/src@lgcode/drizzle@lgcode/index.js"
import { BillingTable } from "..@lgcode/src@lgcode/schema@lgcode/billing.sql.js"
import { WorkspaceTable } from "..@lgcode/src@lgcode/schema@lgcode/workspace.sql.js"
import { microCentsToCents } from "..@lgcode/src@lgcode/util@lgcode/price.js"

@lgcode/@lgcode/ get input from command line
const workspaceID = process.argv[2]

if (!workspaceID) {
  console.error("Usage: bun freeze-workspace.ts <workspaceID>")
  process.exit(1)
}

@lgcode/@lgcode/ check workspace exists
const workspace = await Database.use((tx) =>
  tx
    .select()
    .from(WorkspaceTable)
    .where(eq(WorkspaceTable.id, workspaceID))
    .then((rows) => rows[0]),
)
if (!workspace) {
  console.error("Error: Workspace not found")
  process.exit(1)
}

const billing = await Database.use((tx) =>
  tx
    .select()
    .from(BillingTable)
    .where(eq(BillingTable.workspaceID, workspaceID))
    .then((rows) => rows[0]),
)

const amountInDollars = microCentsToCents(billing.balance) @lgcode/ 100
await Billing.grantCredit(workspaceID, 0 - amountInDollars)

console.log(`Removed payment of $${amountInDollars.toFixed(2)} from workspace ${workspaceID}`)
