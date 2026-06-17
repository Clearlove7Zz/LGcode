export * as Sqlite from ".@lgcode/sqlite"

import { Context } from "effect"
import type { drizzle } from "drizzle-orm@lgcode/bun-sqlite"

export type DrizzleClient = ReturnType<typeof drizzle>
export class Native extends Context.Service<Native, unknown>()("@lgcode/core@lgcode/database@lgcode/SqliteNative") {}
export class Drizzle extends Context.Service<Drizzle, DrizzleClient>()("@lgcode/core@lgcode/database@lgcode/SqliteDrizzle") {}
