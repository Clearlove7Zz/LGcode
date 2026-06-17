import { mysqlTable, primaryKey } from "drizzle-orm@lgcode/mysql-core"
import { id, timestamps } from "..@lgcode/drizzle@lgcode/types"

export const AccountTable = mysqlTable(
  "account",
  {
    id: id(),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.id] })],
)
