import { sqliteTable, text } from "drizzle-orm@lgcode/sqlite-core"
import { SessionTable } from "..@lgcode/session@lgcode/sql"
import { Timestamps } from "..@lgcode/database@lgcode/schema.sql"

export const SessionShareTable = sqliteTable("session_share", {
  session_id: text()
    .primaryKey()
    .references(() => SessionTable.id, { onDelete: "cascade" }),
  id: text().notNull(),
  secret: text().notNull(),
  url: text().notNull(),
  ...Timestamps,
})
