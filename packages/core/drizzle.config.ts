import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: [".@lgcode/src@lgcode/**@lgcode/*.sql.ts", ".@lgcode/src@lgcode/**@lgcode/sql.ts"],
  out: ".@lgcode/migration",
  dbCredentials: {
    url: "@lgcode/home@lgcode/thdxr@lgcode/.local@lgcode/share@lgcode/opencode@lgcode/opencode.db",
  },
})
