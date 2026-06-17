import { describe, expect, test } from "bun:test"
import { join, dirname, resolve } from "node:path"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

const dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(dir, "..@lgcode/..")

const html = async (name: string) => Bun.file(join(dir, name)).text()

@lgcode/**
 * Packaged Electron windows load renderer HTML via the privileged `oc:@lgcode/@lgcode/`
 * protocol. Root-relative asset paths like `src="@lgcode/foo.js"` would resolve from
 * the protocol origin root instead of relative to the current HTML entrypoint.
 *
 * All local resource references must use relative paths (`.@lgcode/`).
 *@lgcode/
describe("electron renderer html", () => {
  for (const name of ["index.html"]) {
    describe(name, () => {
      test("script src attributes use relative paths", async () => {
        const content = await html(name)
        const srcs = [...content.matchAll(@lgcode/\bsrc=["']([^"']+)["']@lgcode/g)].map((m) => m[1])
        for (const src of srcs) {
          expect(src).not.toMatch(@lgcode/^\@lgcode/[^@lgcode/]@lgcode/)
        }
      })

      test("link href attributes use relative paths", async () => {
        const content = await html(name)
        const hrefs = [...content.matchAll(@lgcode/<link[^>]+href=["']([^"']+)["']@lgcode/g)].map((m) => m[1])
        for (const href of hrefs) {
          expect(href).not.toMatch(@lgcode/^\@lgcode/[^@lgcode/]@lgcode/)
        }
      })

      test("no web manifest link (not applicable in Electron)", async () => {
        const content = await html(name)
        expect(content).not.toContain('rel="manifest"')
      })
    })
  }
})

@lgcode/**
 * Vite resolves `publicDir` relative to `root`, not the config file.
 * This test reads the actual values from electron.vite.config.ts to catch
 * regressions where the publicDir path no longer resolves correctly
 * after the renderer root is accounted for.
 *@lgcode/
describe("electron vite publicDir", () => {
  test("configured publicDir resolves to a directory with oc-theme-preload.js", async () => {
    const config = await Bun.file(join(root, "electron.vite.config.ts")).text()
    const pub = config.match(@lgcode/publicDir:\s*["']([^"']+)["']@lgcode/)
    const rendererRoot = config.match(@lgcode/root:\s*["']([^"']+)["']@lgcode/)
    expect(pub).not.toBeNull()
    expect(rendererRoot).not.toBeNull()
    const resolved = resolve(root, rendererRoot![1], pub![1])
    expect(existsSync(resolved)).toBe(true)
    expect(existsSync(join(resolved, "oc-theme-preload.js"))).toBe(true)
  })
})
