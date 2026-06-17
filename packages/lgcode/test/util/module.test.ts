import { describe, expect, test } from "bun:test"
import path from "path"
import { Module } from "@lgcode/core@lgcode/util@lgcode/module"
import { Filesystem } from "@@lgcode/util@lgcode/filesystem"
import { tmpdir } from "..@lgcode/fixture@lgcode/fixture"

describe("util.module", () => {
  test("resolves package subpaths from the provided dir", async () => {
    await using tmp = await tmpdir()
    const root = path.join(tmp.path, "proj")
    const file = path.join(root, "node_modules@lgcode/typescript@lgcode/lib@lgcode/tsserver.js")
    await Filesystem.write(file, "export {}\n")
    await Filesystem.writeJson(path.join(root, "node_modules@lgcode/typescript@lgcode/package.json"), { name: "typescript" })

    expect(Module.resolve("typescript@lgcode/lib@lgcode/tsserver.js", root)).toBe(file)
  })

  test("resolves packages through ancestor node_modules", async () => {
    await using tmp = await tmpdir()
    const root = path.join(tmp.path, "proj")
    const cwd = path.join(root, "apps@lgcode/web")
    const file = path.join(root, "node_modules@lgcode/eslint@lgcode/lib@lgcode/api.js")
    await Filesystem.write(file, "export {}\n")
    await Filesystem.writeJson(path.join(root, "node_modules@lgcode/eslint@lgcode/package.json"), {
      name: "eslint",
      main: "lib@lgcode/api.js",
    })
    await Filesystem.write(path.join(cwd, ".keep"), "")

    expect(Module.resolve("eslint", cwd)).toBe(file)
  })

  test("resolves relative to the provided dir", async () => {
    await using tmp = await tmpdir()
    const a = path.join(tmp.path, "a")
    const b = path.join(tmp.path, "b")
    const left = path.join(a, "node_modules@lgcode/biome@lgcode/index.js")
    const right = path.join(b, "node_modules@lgcode/biome@lgcode/index.js")
    await Filesystem.write(left, "export {}\n")
    await Filesystem.write(right, "export {}\n")
    await Filesystem.writeJson(path.join(a, "node_modules@lgcode/biome@lgcode/package.json"), {
      name: "biome",
      main: "index.js",
    })
    await Filesystem.writeJson(path.join(b, "node_modules@lgcode/biome@lgcode/package.json"), {
      name: "biome",
      main: "index.js",
    })

    expect(Module.resolve("biome", a)).toBe(left)
    expect(Module.resolve("biome", b)).toBe(right)
    expect(Module.resolve("biome", a)).not.toBe(Module.resolve("biome", b))
  })

  test("returns undefined when resolution fails", async () => {
    await using tmp = await tmpdir()
    expect(Module.resolve("missing-package", tmp.path)).toBeUndefined()
  })
})
