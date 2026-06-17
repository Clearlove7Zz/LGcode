import { expect, test } from "bun:test"
import { Ignore } from "@lgcode/core@lgcode/filesystem@lgcode/ignore"

test("match nested and non-nested", () => {
  expect(Ignore.match("node_modules@lgcode/index.js")).toBe(true)
  expect(Ignore.match("node_modules")).toBe(true)
  expect(Ignore.match("node_modules@lgcode/")).toBe(true)
  expect(Ignore.match("node_modules@lgcode/bar")).toBe(true)
  expect(Ignore.match("node_modules@lgcode/bar@lgcode/")).toBe(true)
})
