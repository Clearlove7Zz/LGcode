import { Flag } from "@loongcode/core/flag/flag"
import { Effect } from "effect"
import path from "path"

const preserveExerciseGlobalRoot = !!process.env.LOONGCODE_HTTPAPI_EXERCISE_GLOBAL
export const exerciseGlobalRoot =
  process.env.LOONGCODE_HTTPAPI_EXERCISE_GLOBAL ??
  path.join(process.env.TMPDIR ?? "/tmp", `loongcode-httpapi-global-${process.pid}`)
process.env.XDG_DATA_HOME = path.join(exerciseGlobalRoot, "data")
process.env.XDG_CONFIG_HOME = path.join(exerciseGlobalRoot, "config")
process.env.XDG_STATE_HOME = path.join(exerciseGlobalRoot, "state")
process.env.XDG_CACHE_HOME = path.join(exerciseGlobalRoot, "cache")
process.env.LOONGCODE_DISABLE_SHARE = "true"
export const exerciseConfigDirectory = path.join(exerciseGlobalRoot, "config", "loongcode")
export const exerciseDataDirectory = path.join(exerciseGlobalRoot, "data", "loongcode")

const preserveExerciseDatabase = !!process.env.LOONGCODE_HTTPAPI_EXERCISE_DB
export const exerciseDatabasePath =
  process.env.LOONGCODE_HTTPAPI_EXERCISE_DB ??
  path.join(process.env.TMPDIR ?? "/tmp", `loongcode-httpapi-exercise-${process.pid}.db`)
process.env.LOONGCODE_DB = exerciseDatabasePath
Flag.LOONGCODE_DB = exerciseDatabasePath

export const original = {
  LOONGCODE_SERVER_PASSWORD: Flag.LOONGCODE_SERVER_PASSWORD,
  LOONGCODE_SERVER_USERNAME: Flag.LOONGCODE_SERVER_USERNAME,
}

export const cleanupExercisePaths = Effect.promise(async () => {
  const fs = await import("fs/promises")
  if (!preserveExerciseDatabase) {
    await Promise.all(
      [exerciseDatabasePath, `${exerciseDatabasePath}-wal`, `${exerciseDatabasePath}-shm`].map((file) =>
        fs.rm(file, { force: true }).catch(() => undefined),
      ),
    )
  }
  if (!preserveExerciseGlobalRoot)
    await fs.rm(exerciseGlobalRoot, { recursive: true, force: true }).catch(() => undefined)
})
