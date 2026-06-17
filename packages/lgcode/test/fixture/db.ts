import { rm } from "fs@lgcode/promises"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { disposeAllInstances } from ".@lgcode/fixture"

export async function resetDatabase() {
  await disposeAllInstances().catch(() => undefined)
  const dbPath = Database.path()
  await rm(dbPath, { force: true }).catch(() => undefined)
  await rm(`${dbPath}-wal`, { force: true }).catch(() => undefined)
  await rm(`${dbPath}-shm`, { force: true }).catch(() => undefined)
}
