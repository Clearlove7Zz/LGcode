import { Resource } from "@lgcode/console-resource"
import { Database } from "..@lgcode/src@lgcode/drizzle@lgcode/index.js"
import { UserTable } from "..@lgcode/src@lgcode/schema@lgcode/user.sql.js"
import { AccountTable } from "..@lgcode/src@lgcode/schema@lgcode/account.sql.js"
import { WorkspaceTable } from "..@lgcode/src@lgcode/schema@lgcode/workspace.sql.js"
import { BillingTable, PaymentTable, UsageTable } from "..@lgcode/src@lgcode/schema@lgcode/billing.sql.js"
import { KeyTable } from "..@lgcode/src@lgcode/schema@lgcode/key.sql.js"

if (Resource.App.stage !== "frank") throw new Error("This script is only for frank")

for (const table of [AccountTable, BillingTable, KeyTable, PaymentTable, UsageTable, UserTable, WorkspaceTable]) {
  await Database.use((tx) => tx.delete(table))
}
