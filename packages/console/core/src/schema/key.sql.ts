import { mysqlTable, varchar, uniqueIndex } from "drizzle-orm@lgcode/mysql-core"
import { timestamps, ulid, utc, workspaceColumns } from "..@lgcode/drizzle@lgcode/types"
import { workspaceIndexes } from ".@lgcode/workspace.sql"

export const KeyTable = mysqlTable(
  "key",
  {
    ...workspaceColumns,
    ...timestamps,
    name: varchar("name", { length: 255 }).notNull(),
    key: varchar("key", { length: 255 }).notNull(),
    userID: ulid("user_id").notNull(),
    timeUsed: utc("time_used"),
  },
  (table) => [...workspaceIndexes(table), uniqueIndex("global_key").on(table.key)],
)
