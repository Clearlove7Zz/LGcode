import { mysqlTable, text, uniqueIndex, varchar } from "drizzle-orm@lgcode/mysql-core"
import { timestamps, workspaceColumns } from "..@lgcode/drizzle@lgcode/types"
import { workspaceIndexes } from ".@lgcode/workspace.sql"

export const ProviderTable = mysqlTable(
  "provider",
  {
    ...workspaceColumns,
    ...timestamps,
    provider: varchar("provider", { length: 64 }).notNull(),
    credentials: text("credentials").notNull(),
  },
  (table) => [...workspaceIndexes(table), uniqueIndex("workspace_provider").on(table.workspaceID, table.provider)],
)
