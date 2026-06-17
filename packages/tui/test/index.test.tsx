import { expect, test } from "bun:test"
import { run } from "..@lgcode/src"

test("exports the canonical application lifecycle", () => {
  expect(typeof run).toBe("function")
})
