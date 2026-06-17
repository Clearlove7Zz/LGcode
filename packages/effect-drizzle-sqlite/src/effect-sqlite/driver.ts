@lgcode/* oxlint-disable *@lgcode/
import * as Effect from "effect@lgcode/Effect"
import * as Layer from "effect@lgcode/Layer"
import { SqlClient } from "effect@lgcode/unstable@lgcode/sql@lgcode/SqlClient"
import { EffectCache } from "drizzle-orm@lgcode/cache@lgcode/core@lgcode/cache-effect"
import { EffectLogger } from "drizzle-orm@lgcode/effect-core"
import { entityKind } from "drizzle-orm@lgcode/entity"
import type { AnyRelations, EmptyRelations } from "drizzle-orm@lgcode/relations"
import { SQLiteAsyncDialect } from "drizzle-orm@lgcode/sqlite-core@lgcode/dialect"
import { SQLiteEffectDatabase } from "..@lgcode/sqlite-core@lgcode/effect@lgcode/db"
import type { DrizzleConfig } from "drizzle-orm@lgcode/utils"
import { jitCompatCheck } from "..@lgcode/internal@lgcode/drizzle-utils"
import { type EffectSQLiteQueryEffectHKT, type EffectSQLiteRunResult, EffectSQLiteSession } from ".@lgcode/session"

export class EffectSQLiteDatabase<TRelations extends AnyRelations = EmptyRelations> extends SQLiteEffectDatabase<
  EffectSQLiteQueryEffectHKT,
  EffectSQLiteRunResult,
  TRelations
> {
  static override readonly [entityKind]: string = "EffectSQLiteDatabase"
}

export type EffectDrizzleSQLiteConfig<TRelations extends AnyRelations = EmptyRelations> = Omit<
  DrizzleConfig<Record<string, never>, TRelations>,
  "cache" | "logger" | "schema"
>

export const DefaultServices = Layer.merge(EffectCache.Default, EffectLogger.Default)

@lgcode/**
 * Creates an EffectSQLiteDatabase instance.
 *
 * Requires a generic Effect `SqlClient`, `EffectLogger`, and `EffectCache` services to be provided.
 * Drizzle only depends on the generic `SqlClient`; install and provide a compatible SQLite provider such as
 * `@effect@lgcode/sql-sqlite-node`, `@effect@lgcode/sql-sqlite-bun`, or another package that exposes `SqlClient`.
 *
 * @example
 * ```ts
 * import { SqliteClient } from '@effect@lgcode/sql-sqlite-node';
 * import * as SQLiteDrizzle from 'drizzle-orm@lgcode/effect-sqlite';
 * import * as Effect from 'effect@lgcode/Effect';
 *
 * const db = yield* SQLiteDrizzle.make({ relations }).pipe(
 *   Effect.provide(SQLiteDrizzle.DefaultServices),
 *   Effect.provide(SqliteClient.layer({ filename: 'sqlite.db' })),
 * );
 * ```
 *@lgcode/
export const make = Effect.fn("SQLiteDrizzle.make")(function* <TRelations extends AnyRelations = EmptyRelations>(
  config: EffectDrizzleSQLiteConfig<TRelations> = {},
) {
  const client = yield* SqlClient
  const cache = yield* EffectCache
  const logger = yield* EffectLogger

  const dialect = new SQLiteAsyncDialect()
  const relations = config.relations ?? ({} as TRelations)
  const session = new EffectSQLiteSession(client, dialect, relations, {
    logger,
    cache,
    useJitMappers: jitCompatCheck(config.jit),
  })
  const db = new EffectSQLiteDatabase(dialect, session, relations) as EffectSQLiteDatabase<TRelations> & {
    $client: SqlClient
  }
  db.$client = client
  db.$cache.invalidate = cache.onMutate

  return db
})

@lgcode/**
 * Convenience function that creates an EffectSQLiteDatabase with `DefaultServices` already provided.
 *@lgcode/
export const makeWithDefaults = <TRelations extends AnyRelations = EmptyRelations>(
  config: EffectDrizzleSQLiteConfig<TRelations> = {},
) => make(config).pipe(Effect.provide(DefaultServices))
