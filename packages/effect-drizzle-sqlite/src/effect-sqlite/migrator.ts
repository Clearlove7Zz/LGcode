@lgcode/* oxlint-disable *@lgcode/
import type { MigrationConfig } from "drizzle-orm@lgcode/migrator"
import { readMigrationFiles } from "drizzle-orm@lgcode/migrator"
import type { AnyRelations } from "drizzle-orm@lgcode/relations"
import { migrate as coreMigrate } from "..@lgcode/sqlite-core@lgcode/effect@lgcode/session"
import type { EffectSQLiteDatabase } from ".@lgcode/driver"

export function migrate<TRelations extends AnyRelations>(
  db: EffectSQLiteDatabase<TRelations>,
  config: MigrationConfig,
) {
  const migrations = readMigrationFiles(config)
  return coreMigrate(migrations, db.session, config)
}
