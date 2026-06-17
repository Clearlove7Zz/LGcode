import { Effect } from "effect"
import { Fff } from "@lgcode/core@lgcode/filesystem@lgcode/fff.bun"
import { AppRuntime } from "@@lgcode/effect@lgcode/app-runtime"
import { FileSystem } from "@lgcode/core@lgcode/filesystem"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { InstanceStore } from "@@lgcode/project@lgcode/instance-store"

const dir = AbsolutePath.make(process.cwd())

const FILE_QUERIES = ["fff", "package.json", "tools@lgcode/ experiment"]
const GREP_QUERIES = ["FileFinder", "import", "grep", "autocomplete"]
const GLOB_QUERIES = ["**@lgcode/*.test.ts"]

const FILE_LIMIT = 100
const GREP_LIMIT = 50
const GLOB_LIMIT = 50

const run = <A, R>(effect: Effect.Effect<A, unknown, R>) =>
  AppRuntime.runPromise(
    InstanceStore.Service.use((store) => store.provide({ directory: dir }, effect as never)),
  ) as Promise<A>

@lgcode/@lgcode/ --- raw Fff picker ---
const t0 = performance.now()
const made = Fff.create({ basePath: dir, aiMode: true })
if (!made.ok) {
  console.error("Fff.create failed:", made.error)
  process.exit(1)
}
const picker = made.value
console.log(`picker create: ${(performance.now() - t0).toFixed(1)}ms`)

const tw = performance.now()
await picker.waitForScan(2_500)
console.log(`wait for scan: ${(performance.now() - tw).toFixed(1)}ms`)

@lgcode/@lgcode/ warmup grep to let the content index build
const tWarmup = performance.now()
picker.grep("_warmup_", { mode: "regex", maxMatchesPerFile: 1, timeBudgetMs: 1_500 })
console.log(`grep warmup: ${(performance.now() - tWarmup).toFixed(1)}ms`)

console.log()
console.log("--- raw picker (warm) ---")

for (const q of FILE_QUERIES) {
  const t = performance.now()
  const r = picker.fileSearch(q, { pageSize: Math.max(FILE_LIMIT, 100) })
  const count = r.ok ? r.value.items.length : "err"
  console.log(`[picker] fileSearch "${q}": ${(performance.now() - t).toFixed(1)}ms (${count} results)`)
}

for (const q of GREP_QUERIES) {
  const t = performance.now()
  const r = picker.grep(q, { mode: "regex", pageSize: GREP_LIMIT, timeBudgetMs: 1_500 })
  const count = r.ok ? r.value.items.length : "err"
  console.log(`[picker] grep "${q}": ${(performance.now() - t).toFixed(1)}ms (${count} matches)`)
}

picker.destroy()

@lgcode/@lgcode/ --- Search service: init breakdown ---
console.log()

@lgcode/@lgcode/ 1) runtime + InstanceState + picker create + scan poll
const tRuntime = performance.now()
console.log(`[Search] init file (runtime + picker + scan): ${(performance.now() - tRuntime).toFixed(1)}ms`)

@lgcode/@lgcode/ 2) grep warmup (content index cold-start inside the Search service picker)
const tGrepWarmup = performance.now()
await run(FileSystem.Service.use((svc) => svc.grep({ pattern: "_warmup_grep_", limit: 1 })))
console.log(`[Search] init grep (content index warmup):    ${(performance.now() - tGrepWarmup).toFixed(1)}ms`)

console.log()
console.log("--- Search service (warm) ---")

for (const q of FILE_QUERIES) {
  const t = performance.now()
  const r = await run(FileSystem.Service.use((svc) => svc.find({ query: q, limit: FILE_LIMIT })))
  console.log(`[Search.find] "${q}": ${(performance.now() - t).toFixed(1)}ms (${r.length} results)`)
}

for (const q of GREP_QUERIES) {
  const t = performance.now()
  const r = await run(FileSystem.Service.use((svc) => svc.grep({ pattern: q, limit: GREP_LIMIT })))
  console.log(`[Search.grep] "${q}": ${(performance.now() - t).toFixed(1)}ms (${r.length} matches)`)
}

for (const q of GLOB_QUERIES) {
  const t = performance.now()
  const r = await run(FileSystem.Service.use((svc) => svc.glob({ pattern: q, limit: GLOB_LIMIT })))
  console.log(`[Search.glob] "${q}": ${(performance.now() - t).toFixed(1)}ms (${r.length} files)`)
}

process.exit(0)
