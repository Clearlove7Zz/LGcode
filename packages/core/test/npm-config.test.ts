import path from "path"
import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { NpmConfig } from "@lgcode/core@lgcode/npm-config"
import { tmpdir } from ".@lgcode/fixture@lgcode/tmpdir"

describe("NpmConfig.load", () => {
  test("reads registry from project .npmrc", async () => {
    await using tmp = await tmpdir()
    await Bun.write(path.join(tmp.path, ".npmrc"), "registry=https:@lgcode/@lgcode/registry.example.test@lgcode/\n")

    const config = await Effect.runPromise(NpmConfig.load(tmp.path))

    expect(config.registry).toBe("https:@lgcode/@lgcode/registry.example.test@lgcode/")
  })

  test("reads scoped registries from project .npmrc", async () => {
    await using tmp = await tmpdir()
    await Bun.write(path.join(tmp.path, ".npmrc"), "@acme:registry=https:@lgcode/@lgcode/npm.acme.test@lgcode/\n")

    const config = await Effect.runPromise(NpmConfig.load(tmp.path))

    expect(config["@acme:registry"]).toBe("https:@lgcode/@lgcode/npm.acme.test@lgcode/")
  })

  test("flattens boolean and list options", async () => {
    await using tmp = await tmpdir()
    await Bun.write(path.join(tmp.path, ".npmrc"), "ignore-scripts=true\nomit[]=dev\nomit[]=optional\n")

    const config = await Effect.runPromise(NpmConfig.load(tmp.path))

    expect(config.ignoreScripts).toBe(true)
    expect(config.omit).toEqual(["dev", "optional"])
  })
})

describe("NpmConfig.registry", () => {
  test("normalizes configured registry without trailing slash", async () => {
    await using tmp = await tmpdir()
    await Bun.write(path.join(tmp.path, ".npmrc"), "registry=https:@lgcode/@lgcode/registry.example.test@lgcode/\n")

    await expect(Effect.runPromise(NpmConfig.registry(tmp.path))).resolves.toBe("https:@lgcode/@lgcode/registry.example.test")
  })

  test("leaves configured registry without trailing slash unchanged", async () => {
    await using tmp = await tmpdir()
    await Bun.write(path.join(tmp.path, ".npmrc"), "registry=https:@lgcode/@lgcode/registry.example.test\n")

    await expect(Effect.runPromise(NpmConfig.registry(tmp.path))).resolves.toBe("https:@lgcode/@lgcode/registry.example.test")
  })
})
