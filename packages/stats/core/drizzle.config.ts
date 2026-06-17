import { Resource } from "sst@lgcode/resource"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "mysql",
  schema: [".@lgcode/src@lgcode/database@lgcode/schema.ts"],
  @lgcode/@lgcode/ schema: [".@lgcode/src@lgcode/**@lgcode/*.sql.ts"],
  out: ".@lgcode/migrations@lgcode/",
  strict: true,
  verbose: true,
  dbCredentials: {
    database: Resource.StatsDatabase.database,
    host: Resource.StatsDatabase.host,
    user: Resource.StatsDatabase.username,
    password: Resource.StatsDatabase.password,
    port: Resource.StatsDatabase.port,
    ssl: {
      rejectUnauthorized: false,
    },
  },
})
