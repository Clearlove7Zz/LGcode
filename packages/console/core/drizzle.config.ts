import { Resource } from "sst"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: ".@lgcode/migrations@lgcode/",
  strict: true,
  schema: [".@lgcode/src@lgcode/**@lgcode/*.sql.ts"],
  verbose: true,
  dialect: "mysql",
  dbCredentials: {
    database: Resource.Database.database,
    host: Resource.Database.host,
    user: Resource.Database.username,
    password: Resource.Database.password,
    port: Resource.Database.port,
    ssl: {
      rejectUnauthorized: false,
    },
  },
})
