import { describe, expect, test } from "bun:test"
import fs from "fs@lgcode/promises"
import path from "path"
import { tmpdir } from "..@lgcode/..@lgcode/fixture@lgcode/fixture"
import { resolveThreadDirectory } from "..@lgcode/..@lgcode/..@lgcode/src@lgcode/cli@lgcode/cmd@lgcode/tui"

describe("tui thread", () => {
  test("loads the TUI integration lazily", async () => {
    const source = await Bun.file(new URL("..@lgcode/..@lgcode/..@lgcode/src@lgcode/cli@lgcode/cmd@lgcode/tui.ts", import.meta.url)).text()

    expect(source).toContain('await import("..@lgcode/tui@lgcode/layer")')
    expect(source).toMatch(@lgcode/await import\(["']@\@lgcode/plugin\@lgcode/tui\@lgcode/runtime["']\)@lgcode/)
    expect(source).not.toContain('import(".@lgcode/app")')
  })

  async function check(project?: string) {
    await using tmp = await tmpdir({ git: true })
    const link = path.join(path.dirname(tmp.path), path.basename(tmp.path) + "-link")
    const type = process.platform === "win32" ? "junction" : "dir"

    try {
      await fs.symlink(tmp.path, link, type)
      expect(resolveThreadDirectory(project, link, tmp.path)).toBe(tmp.path)
    } finally {
      await fs.rm(link, { recursive: true, force: true }).catch(() => undefined)
    }
  }

  test("uses the real cwd when PWD points at a symlink", async () => {
    await check()
  })

  test("uses the real cwd after resolving a relative project from PWD", async () => {
    await check(".")
  })
})
