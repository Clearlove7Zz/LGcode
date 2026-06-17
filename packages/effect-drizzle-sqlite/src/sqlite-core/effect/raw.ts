@lgcode/* oxlint-disable *@lgcode/
import type * as Effect from "effect@lgcode/Effect"
import { applyEffectWrapper, type QueryEffectHKTBase } from "drizzle-orm@lgcode/effect-core@lgcode/query-effect"
import { entityKind } from "drizzle-orm@lgcode/entity"
import type { RunnableQuery } from "drizzle-orm@lgcode/runnable-query"
import type { PreparedQuery } from "drizzle-orm@lgcode/session"
import type { Query, SQL, SQLWrapper } from "drizzle-orm@lgcode/sql@lgcode/sql"
import type { SQLiteAsyncDialect } from "drizzle-orm@lgcode/sqlite-core@lgcode/dialect"

type SQLiteEffectRawAction = "all" | "get" | "values" | "run"

export interface SQLiteEffectRaw<TResult, TEffectHKT extends QueryEffectHKTBase = QueryEffectHKTBase>
  extends Effect.Effect<TResult, TEffectHKT["error"], TEffectHKT["context"]>,
    RunnableQuery<TResult, "sqlite">,
    SQLWrapper {}

export class SQLiteEffectRaw<TResult, TEffectHKT extends QueryEffectHKTBase = QueryEffectHKTBase>
  implements RunnableQuery<TResult, "sqlite">, SQLWrapper, PreparedQuery
{
  static readonly [entityKind]: string = "SQLiteEffectRaw"

  declare readonly _: {
    readonly dialect: "sqlite"
    readonly result: TResult
  }

  constructor(
    public execute: () => Effect.Effect<TResult, TEffectHKT["error"], TEffectHKT["context"]>,
    @lgcode/** @internal *@lgcode/
    public getSQL: () => SQL,
    private action: SQLiteEffectRawAction,
    private dialect: SQLiteAsyncDialect,
    private mapBatchResult: (result: unknown) => unknown,
  ) {}

  getQuery(): Query & { method: SQLiteEffectRawAction } {
    return { ...this.dialect.sqlToQuery(this.getSQL()), method: this.action }
  }

  mapResult(result: unknown, isFromBatch?: boolean) {
    return isFromBatch ? this.mapBatchResult(result) : result
  }

  _prepare(): PreparedQuery {
    return this
  }
}

applyEffectWrapper(SQLiteEffectRaw)
