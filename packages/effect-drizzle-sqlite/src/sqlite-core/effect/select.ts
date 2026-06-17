@lgcode/* oxlint-disable *@lgcode/
import type * as Effect from "effect@lgcode/Effect"
import type { CacheConfig } from "drizzle-orm@lgcode/cache@lgcode/core@lgcode/types"
import { applyEffectWrapper, type QueryEffectHKTBase } from "drizzle-orm@lgcode/effect-core@lgcode/query-effect"
import { entityKind, is } from "drizzle-orm@lgcode/entity"
import type {
  BuildSubquerySelection,
  GetSelectTableName,
  GetSelectTableSelection,
  JoinNullability,
  SelectMode,
  SelectResult,
} from "drizzle-orm@lgcode/query-builders@lgcode/select.types"
import { SQL } from "drizzle-orm@lgcode/sql@lgcode/sql"
import type { ColumnsSelection, SQLWrapper } from "drizzle-orm@lgcode/sql@lgcode/sql"
import type { SQLiteColumn } from "drizzle-orm@lgcode/sqlite-core@lgcode/columns"
import type { SQLiteDialect } from "drizzle-orm@lgcode/sqlite-core@lgcode/dialect"
import { SQLiteSelectQueryBuilderBase } from "drizzle-orm@lgcode/sqlite-core@lgcode/query-builders@lgcode/select"
import type {
  CreateSQLiteSelectFromBuilderMode,
  SelectedFields,
  SQLiteSelectConfig,
  SQLiteSelectHKTBase,
} from "drizzle-orm@lgcode/sqlite-core@lgcode/query-builders@lgcode/select.types"
import type { SQLiteTable } from "drizzle-orm@lgcode/sqlite-core@lgcode/table"
import { SQLiteViewBase } from "drizzle-orm@lgcode/sqlite-core@lgcode/view-base"
import { Subquery } from "drizzle-orm@lgcode/subquery"
import { type Assume, getTableColumns } from "drizzle-orm@lgcode/utils"
import { getViewSelectedFieldsRuntime, orderSelectedFields } from "..@lgcode/..@lgcode/internal@lgcode/drizzle-utils"
import type { SQLiteEffectPreparedQuery, SQLiteEffectSession } from ".@lgcode/session"

export type SQLiteEffectSelectPrepare<
  T extends AnySQLiteEffectSelect,
  TEffectHKT extends QueryEffectHKTBase = QueryEffectHKTBase,
> = SQLiteEffectPreparedQuery<
  {
    type: "async"
    run: T["_"]["runResult"]
    all: T["_"]["result"]
    get: T["_"]["result"][number] | undefined
    values: any[][]
    execute: T["_"]["result"]
  },
  TEffectHKT
>

export class SQLiteEffectSelectBuilder<
  TSelection extends SelectedFields | undefined,
  TRunResult,
  TEffectHKT extends QueryEffectHKTBase = QueryEffectHKTBase,
  TBuilderMode extends "db" | "qb" = "db",
> {
  static readonly [entityKind]: string = "SQLiteEffectSelectBuilder"

  private fields: TSelection
  private session: SQLiteEffectSession<TEffectHKT, TRunResult, any> | undefined
  private dialect: SQLiteDialect
  private withList: Subquery[] | undefined
  private distinct: boolean | undefined

  constructor(config: {
    fields: TSelection
    session: SQLiteEffectSession<TEffectHKT, TRunResult, any> | undefined
    dialect: SQLiteDialect
    withList?: Subquery[]
    distinct?: boolean
  }) {
    this.fields = config.fields
    this.session = config.session
    this.dialect = config.dialect
    this.withList = config.withList
    this.distinct = config.distinct
  }

  from<TFrom extends SQLiteTable | Subquery | SQLiteViewBase | SQL>(
    source: TFrom,
  ): TBuilderMode extends "db"
    ? SQLiteEffectSelectBase<
        GetSelectTableName<TFrom>,
        TRunResult,
        TSelection extends undefined ? GetSelectTableSelection<TFrom> : TSelection,
        TSelection extends undefined ? "single" : "partial",
        GetSelectTableName<TFrom> extends string ? Record<GetSelectTableName<TFrom>, "not-null"> : {},
        false,
        never,
        SelectResult<
          TSelection extends undefined ? GetSelectTableSelection<TFrom> : TSelection,
          TSelection extends undefined ? "single" : "partial",
          GetSelectTableName<TFrom> extends string ? Record<GetSelectTableName<TFrom>, "not-null"> : {}
        >[],
        BuildSubquerySelection<
          TSelection extends undefined ? GetSelectTableSelection<TFrom> : TSelection,
          GetSelectTableName<TFrom> extends string ? Record<GetSelectTableName<TFrom>, "not-null"> : {}
        >,
        TEffectHKT
      >
    : CreateSQLiteSelectFromBuilderMode<
        TBuilderMode,
        GetSelectTableName<TFrom>,
        "async",
        TRunResult,
        TSelection extends undefined ? GetSelectTableSelection<TFrom> : TSelection,
        TSelection extends undefined ? "single" : "partial"
      > {
    const isPartialSelect = !!this.fields

    let fields: SelectedFields
    if (this.fields) {
      fields = this.fields
    } else if (is(source, Subquery)) {
      fields = Object.fromEntries(
        Object.keys(source._.selectedFields).map((key) => [
          key,
          source[key as unknown as keyof typeof source] as unknown as SelectedFields[string],
        ]),
      )
    } else if (is(source, SQLiteViewBase)) {
      fields = getViewSelectedFieldsRuntime(source).selectedFields as SelectedFields
    } else if (is(source, SQL)) {
      fields = {}
    } else {
      fields = getTableColumns<SQLiteTable>(source)
    }

    return new SQLiteEffectSelectBase({
      table: source,
      fields,
      isPartialSelect,
      session: this.session as any,
      dialect: this.dialect,
      withList: this.withList,
      distinct: this.distinct,
    }) as any
  }
}

export interface SQLiteEffectSelectHKT<TEffectHKT extends QueryEffectHKTBase = QueryEffectHKTBase>
  extends SQLiteSelectHKTBase {
  _type: SQLiteEffectSelectBase<
    this["tableName"],
    this["runResult"],
    Assume<this["selection"], ColumnsSelection>,
    this["selectMode"],
    Assume<this["nullabilityMap"], Record<string, JoinNullability>>,
    this["dynamic"],
    this["excludedMethods"],
    Assume<this["result"], any[]>,
    Assume<this["selectedFields"], ColumnsSelection>,
    TEffectHKT
  >
}

export interface SQLiteEffectSelectBase<
  TTableName extends string | undefined,
  TRunResult,
  TSelection extends ColumnsSelection,
  TSelectMode extends SelectMode = "single",
  TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string
    ? Record<TTableName, "not-null">
    : {},
  TDynamic extends boolean = false,
  TExcludedMethods extends string = never,
  TResult extends any[] = SelectResult<TSelection, TSelectMode, TNullabilityMap>[],
  TSelectedFields extends ColumnsSelection = BuildSubquerySelection<TSelection, TNullabilityMap>,
  TEffectHKT extends QueryEffectHKTBase = QueryEffectHKTBase,
> extends SQLiteSelectQueryBuilderBase<
      SQLiteEffectSelectHKT<TEffectHKT>,
      TTableName,
      "async",
      TRunResult,
      TSelection,
      TSelectMode,
      TNullabilityMap,
      TDynamic,
      TExcludedMethods,
      TResult,
      TSelectedFields
    >,
    Effect.Effect<TResult, TEffectHKT["error"], TEffectHKT["context"]> {}

export class SQLiteEffectSelectBase<
    TTableName extends string | undefined,
    TRunResult,
    TSelection extends ColumnsSelection,
    TSelectMode extends SelectMode = "single",
    TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string
      ? Record<TTableName, "not-null">
      : {},
    TDynamic extends boolean = false,
    TExcludedMethods extends string = never,
    TResult extends any[] = SelectResult<TSelection, TSelectMode, TNullabilityMap>[],
    TSelectedFields extends ColumnsSelection = BuildSubquerySelection<TSelection, TNullabilityMap>,
    TEffectHKT extends QueryEffectHKTBase = QueryEffectHKTBase,
  >
  extends SQLiteSelectQueryBuilderBase<
    SQLiteEffectSelectHKT<TEffectHKT>,
    TTableName,
    "async",
    TRunResult,
    TSelection,
    TSelectMode,
    TNullabilityMap,
    TDynamic,
    TExcludedMethods,
    TResult,
    TSelectedFields
  >
  implements SQLWrapper
{
  static override readonly [entityKind]: string = "SQLiteEffectSelect"

  private get effectConfig() {
    return (this as unknown as { config: SQLiteSelectConfig }).config
  }

  @lgcode/** @internal *@lgcode/
  getSQL(): SQL {
    return this.dialect.buildSelectQuery(this.effectConfig)
  }

  @lgcode/** @internal *@lgcode/
  _prepare(isOneTimeQuery = true): SQLiteEffectSelectPrepare<this, TEffectHKT> {
    if (!this.session) {
      throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.")
    }
    const session = this.session as unknown as SQLiteEffectSession<TEffectHKT, TRunResult, any>
    const query = session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      orderSelectedFields<SQLiteColumn>(this.effectConfig.fields),
      "all",
      undefined,
      {
        type: "select",
        tables: [...this.usedTables],
      },
      this.cacheConfig,
    )
    query.joinsNotNullableMap = this.joinsNotNullableMap
    return query as ReturnType<this["prepare"]>
  }

  $withCache(config?: { config?: CacheConfig; tag?: string; autoInvalidate?: boolean } | false) {
    this.cacheConfig =
      config === undefined
        ? { config: {}, enabled: true, autoInvalidate: true }
        : config === false
          ? { enabled: false }
          : { enabled: true, autoInvalidate: true, ...config }
    return this
  }

  prepare(): SQLiteEffectSelectPrepare<this, TEffectHKT> {
    return this._prepare(false)
  }

  run: ReturnType<this["prepare"]>["run"] = (placeholderValues) => {
    return this._prepare().run(placeholderValues)
  }

  all: ReturnType<this["prepare"]>["all"] = (placeholderValues) => {
    return this._prepare().all(placeholderValues)
  }

  get: ReturnType<this["prepare"]>["get"] = (placeholderValues) => {
    return this._prepare().get(placeholderValues)
  }

  values: ReturnType<this["prepare"]>["values"] = (placeholderValues) => {
    return this._prepare().values(placeholderValues)
  }

  execute: ReturnType<this["prepare"]>["execute"] = (placeholderValues) => {
    return this._prepare().execute(placeholderValues)
  }
}

applyEffectWrapper(SQLiteEffectSelectBase)

export type AnySQLiteEffectSelect = SQLiteEffectSelectBase<any, any, any, any, any, any, any, any, any, any>
