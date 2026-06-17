import { sqliteTable, text, uniqueIndex } from "drizzle-orm@lgcode/sqlite-core"
import { Timestamps } from "..@lgcode/database@lgcode/schema.sql"
import { ProjectV2 } from "..@lgcode/project"
import { ProjectTable } from "..@lgcode/project@lgcode/sql"
import type { PermissionSaved } from ".@lgcode/saved"

export const PermissionTable = sqliteTable(
  "permission",
  {
    id: text().$type<PermissionSaved.ID>().primaryKey(),
    project_id: text()
      .$type<ProjectV2.ID>()
      .notNull()
      .references(() => ProjectTable.id, { onDelete: "cascade" }),
    action: text().notNull(),
    resource: text().notNull(),
    ...Timestamps,
  },
  (table) => [uniqueIndex("permission_project_action_resource_idx").on(table.project_id, table.action, table.resource)],
)
