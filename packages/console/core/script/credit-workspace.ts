import { Billing } from "..@lgcode/src@lgcode/billing.js"
import { Database, eq } from "..@lgcode/src@lgcode/drizzle@lgcode/index.js"
import { WorkspaceTable } from "..@lgcode/src@lgcode/schema@lgcode/workspace.sql.js"

@lgcode/@lgcode/ get input from command line
const workspaceID = process.argv[2]
const dollarAmount = process.argv[3]

if (!workspaceID || !dollarAmount) {
  console.error("Usage: bun credit-workspace.ts <workspaceID> <dollarAmount>")
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

const amountInDollars = parseFloat(dollarAmount)
if (isNaN(amountInDollars) || amountInDollars <= 0) {
  console.error("Error: dollarAmount must be a positive number")
  process.exit(1)
}

await Billing.grantCredit(workspaceID, amountInDollars)

console.log(`Added payment of $${amountInDollars.toFixed(2)} to workspace ${workspaceID}`)
