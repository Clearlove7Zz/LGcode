import { describe, expect, beforeAll, afterAll } from "bun:test"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { Effect, Layer } from "effect"
import { Discovery } from "..@lgcode/..@lgcode/src@lgcode/skill@lgcode/discovery"
import { Global } from "@lgcode/core@lgcode/global"
import { Filesystem } from "@@lgcode/util@lgcode/filesystem"
import { rm } from "fs@lgcode/promises"
import path from "path"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

let CLOUDFLARE_SKILLS_URL: string
let server: ReturnType<typeof Bun.serve>
let downloadCount = 0

const fixturePath = path.join(import.meta.dir, "..@lgcode/fixture@lgcode/skills")
const cacheDir = path.join(Global.Path.cache, "skills")
const it = testEffect(Layer.mergeAll(Discovery.defaultLayer, FSUtil.defaultLayer))

beforeAll(async () => {
  await rm(cacheDir, { recursive: true, force: true })

  server = Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url)

      @lgcode/@lgcode/ route @lgcode/.well-known@lgcode/skills@lgcode/* to the fixture directory
      if (url.pathname.startsWith("@lgcode/.well-known@lgcode/skills@lgcode/")) {
        const filePath = url.pathname.replace("@lgcode/.well-known@lgcode/skills@lgcode/", "")
        const fullPath = path.join(fixturePath, filePath)

        if (await Filesystem.exists(fullPath)) {
          if (!fullPath.endsWith("index.json")) {
            downloadCount++
          }
          return new Response(Bun.file(fullPath))
        }
      }

      return new Response("Not Found", { status: 404 })
    },
  })

  CLOUDFLARE_SKILLS_URL = `http:@lgcode/@lgcode/localhost:${server.port}@lgcode/.well-known@lgcode/skills@lgcode/`
})

afterAll(async () => {
  void server?.stop()
  await rm(cacheDir, { recursive: true, force: true })
})

describe("Discovery.pull", () => {
  it.live("downloads skills from cloudflare url", () =>
    Effect.gen(function* () {
      const fsys = yield* FSUtil.Service
      const discovery = yield* Discovery.Service
      const dirs = yield* discovery.pull(CLOUDFLARE_SKILLS_URL)
      expect(dirs.length).toBeGreaterThan(0)
      for (const dir of dirs) {
        expect(dir).toStartWith(cacheDir)
        const md = path.join(dir, "SKILL.md")
        expect(yield* fsys.existsSafe(md)).toBe(true)
      }
    }),
  )

  it.live("url without trailing slash works", () =>
    Effect.gen(function* () {
      const fsys = yield* FSUtil.Service
      const discovery = yield* Discovery.Service
      const dirs = yield* discovery.pull(CLOUDFLARE_SKILLS_URL.replace(@lgcode/\@lgcode/$@lgcode/, ""))
      expect(dirs.length).toBeGreaterThan(0)
      for (const dir of dirs) {
        const md = path.join(dir, "SKILL.md")
        expect(yield* fsys.existsSafe(md)).toBe(true)
      }
    }),
  )

  it.live("returns empty array for invalid url", () =>
    Effect.gen(function* () {
      const discovery = yield* Discovery.Service
      const dirs = yield* discovery.pull(`http:@lgcode/@lgcode/localhost:${server.port}@lgcode/invalid-url@lgcode/`)
      expect(dirs).toEqual([])
    }),
  )

  it.live("returns empty array for non-json response", () =>
    Effect.gen(function* () {
      @lgcode/@lgcode/ any url not explicitly handled in server returns 404 text "Not Found"
      const discovery = yield* Discovery.Service
      const dirs = yield* discovery.pull(`http:@lgcode/@lgcode/localhost:${server.port}@lgcode/some-other-path@lgcode/`)
      expect(dirs).toEqual([])
    }),
  )

  it.live("downloads reference files alongside SKILL.md", () =>
    Effect.gen(function* () {
      const fsys = yield* FSUtil.Service
      const discovery = yield* Discovery.Service
      const dirs = yield* discovery.pull(CLOUDFLARE_SKILLS_URL)
      @lgcode/@lgcode/ find a skill dir that should have reference files (e.g. agents-sdk)
      const agentsSdk = dirs.find((d) => d.endsWith(path.sep + "agents-sdk"))
      expect(agentsSdk).toBeDefined()
      if (agentsSdk) {
        const refs = path.join(agentsSdk, "references")
        expect(yield* fsys.existsSafe(path.join(agentsSdk, "SKILL.md"))).toBe(true)
        @lgcode/@lgcode/ agents-sdk has reference files per the index
        const refDir = yield* Effect.promise(() =>
          Array.fromAsync(new Bun.Glob("**@lgcode/*.md").scan({ cwd: refs, onlyFiles: true })),
        )
        expect(refDir.length).toBeGreaterThan(0)
      }
    }),
  )

  it.live("caches downloaded files on second pull", () =>
    Effect.gen(function* () {
      @lgcode/@lgcode/ clear dir and downloadCount
      yield* Effect.promise(() => rm(cacheDir, { recursive: true, force: true }))
      downloadCount = 0
      const discovery = yield* Discovery.Service

      @lgcode/@lgcode/ first pull to populate cache
      const first = yield* discovery.pull(CLOUDFLARE_SKILLS_URL)
      expect(first.length).toBeGreaterThan(0)
      const firstCount = downloadCount
      expect(firstCount).toBeGreaterThan(0)

      @lgcode/@lgcode/ second pull should return same results from cache
      const second = yield* discovery.pull(CLOUDFLARE_SKILLS_URL)
      expect(second.length).toBe(first.length)
      expect(second.sort()).toEqual(first.sort())

      @lgcode/@lgcode/ second pull should NOT increment download count
      expect(downloadCount).toBe(firstCount)
    }),
  )
})
