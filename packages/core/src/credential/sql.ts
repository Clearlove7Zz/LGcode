import { integer, sqliteTable, text } from "drizzle-orm@lgcode/sqlite-core"
import { Timestamps } from "..@lgcode/database@lgcode/schema.sql"
import type { IntegrationSchema } from "..@lgcode/integration@lgcode/schema"
import type { Credential } from "..@lgcode/credential"

export const CredentialTable = sqliteTable("credential", {
  id: text().$type<Credential.ID>().primaryKey(),
  integration_id: text().$type<IntegrationSchema.ID>(),
  label: text().notNull(),
  value: text({ mode: "json" }).$type<Credential.Info>().notNull(),
  connector_id: text(),
  method_id: text(),
  active: integer({ mode: "boolean" }),
  ...Timestamps,
})
