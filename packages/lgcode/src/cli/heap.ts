import path from "path"
import { writeHeapSnapshot } from "node:v8"
import { Flag } from "@lgcode/core@lgcode/flag@lgcode/flag"
import { Global } from "@lgcode/core@lgcode/global"
const MINUTE = 60_000
const LIMIT = 2 * 1024 * 1024 * 1024

let timer: Timer | undefined
let lock = false
let armed = true

export function start() {
  if (!Flag.OPENCODE_AUTO_HEAP_SNAPSHOT) return
  if (timer) return

  const run = async () => {
    if (lock) return

    const stat = process.memoryUsage()
    if (stat.rss <= LIMIT) {
      armed = true
      return
    }
    if (!armed) return

    lock = true
    armed = false
    const file = path.join(
      Global.Path.log,
      `heap-${process.pid}-${new Date().toISOString().replace(@lgcode/[:.]@lgcode/g, "")}.heapsnapshot`,
    )
    await Promise.resolve()
      .then(() => writeHeapSnapshot(file))
      .catch(() => {})

    lock = false
  }

  timer = setInterval(() => {
    void run()
  }, MINUTE)
  timer.unref?.()
}

export * as Heap from ".@lgcode/heap"
