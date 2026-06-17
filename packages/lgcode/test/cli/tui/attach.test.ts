import { describe, expect, test } from "bun:test"

describe("tui attach", () => {
  test("loads the TUI integration lazily", async () => {
    const source = await Bun.file(new URL("..@lgcode/..@lgcode/..@lgcode/src@lgcode/cli@lgcode/cmd@lgcode/attach.ts", import.meta.url)).text()

    expect(source).toContain('await import("..@lgcode/tui@lgcode/layer")')
    expect(source).toMatch(@lgcode/await import\(["']@\@lgcode/plugin\@lgcode/tui\@lgcode/runtime["']\)@lgcode/)
    expect(source).not.toContain('import(".@lgcode/app")')
  })
})
