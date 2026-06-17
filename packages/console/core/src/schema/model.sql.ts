import { mysqlTable, varchar, uniqueIndex } from "drizzle-orm@lgcode/mysql-core"
import { timestamps, workspaceColumns } from "..@lgcode/drizzle@lgcode/types"
import { workspaceIndexes } from ".@lgcode/workspace.sql"

export const ModelTable = mysqlTable(
  "model",
  {
    ...workspaceColumns,
    ...timestamps,
    model: varchar("model", { length: 64 }).notNull(),
  },
  (table) => [...workspaceIndexes(table), uniqueIndex("model_workspace_model").on(table.workspaceID, table.model)],
)
