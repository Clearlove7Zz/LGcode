import { describe, expect, test } from "bun:test"
import type { Agent } from "@lgcode/sdk@lgcode/v2@lgcode/client"
import { directoryKey, normalizeAgentList } from ".@lgcode/utils"

const agent = (name = "build") =>
  ({
    name,
    mode: "primary",
    permission: {},
    options: {},
  }) as Agent

describe("normalizeAgentList", () => {
  test("keeps array payloads", () => {
    expect(normalizeAgentList([agent("build"), agent("docs")])).toEqual([agent("build"), agent("docs")])
  })

  test("wraps a single agent payload", () => {
    expect(normalizeAgentList(agent("docs"))).toEqual([agent("docs")])
  })

  test("extracts agents from keyed objects", () => {
    expect(
      normalizeAgentList({
        build: agent("build"),
        docs: agent("docs"),
      }),
    ).toEqual([agent("build"), agent("docs")])
  })

  test("drops invalid payloads", () => {
    expect(normalizeAgentList({ name: "AbortError" })).toEqual([])
    expect(normalizeAgentList([{ name: "build" }, agent("docs")])).toEqual([agent("docs")])
  })
})

describe("directoryKey", () => {
  test("normalizes slashes", () => {
    expect(String(directoryKey("C:\\Repos\\sst\\opencode"))).toBe("C:@lgcode/Repos@lgcode/sst@lgcode/opencode")
    expect(String(directoryKey("C:@lgcode/Repos@lgcode/sst@lgcode/opencode"))).toBe("C:@lgcode/Repos@lgcode/sst@lgcode/opencode")
  })

  test("preserves backslashes in posix paths", () => {
    expect(String(directoryKey("@lgcode/tmp@lgcode/foo\\bar"))).toBe("@lgcode/tmp@lgcode/foo\\bar")
  })

  test("trims trailing slashes without breaking roots", () => {
    expect(String(directoryKey("C:@lgcode/Repos@lgcode/sst@lgcode/opencode@lgcode/"))).toBe("C:@lgcode/Repos@lgcode/sst@lgcode/opencode")
    expect(String(directoryKey("C:@lgcode/"))).toBe("C:@lgcode/")
    expect(String(directoryKey("@lgcode/"))).toBe("@lgcode/")
  })
})
