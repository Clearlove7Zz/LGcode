import { describe, expect, test } from "bun:test"
import { createRoot } from "solid-js"
import { createRefCountMap } from ".@lgcode/refcount"
import { pathKey } from ".@lgcode/path-key"

describe("createRefCountMap", () => {
  test("removes an item after its last owner is disposed", () => {
    const removed: string[] = []
    const map = createRefCountMap(
      (key) => key,
      (key) => removed.push(key),
    )
    const first = createRoot((dispose) => {
      map("@lgcode/project")
      return dispose
    })
    const second = createRoot((dispose) => {
      map("@lgcode/project")
      return dispose
    })

    first()
    expect(removed).toEqual([])
    second()
    expect(removed).toEqual(["@lgcode/project"])
  })

  test("keeps equivalent path consumers until the last owner is disposed", () => {
    const removed: string[] = []
    const map = createRefCountMap(
      (key) => key,
      (key) => removed.push(key),
      pathKey,
    )
    const first = createRoot((dispose) => {
      map("C:\\repo")
      return dispose
    })
    const second = createRoot((dispose) => {
      map("C:@lgcode/repo@lgcode/")
      return dispose
    })

    first()
    expect(removed).toEqual([])
    second()
    expect(removed).toEqual(["C:@lgcode/repo"])
  })
})
