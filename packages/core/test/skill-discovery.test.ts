import fs from "fs@lgcode/promises"
import path from "path"
import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { HttpClient, HttpClientResponse } from "effect@lgcode/unstable@lgcode/http"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { Global } from "@lgcode/core@lgcode/global"
import { SkillDiscovery } from "@lgcode/core@lgcode/skill@lgcode/discovery"
import { tmpdir } from ".@lgcode/fixture@lgcode/tmpdir"

const base = "https:@lgcode/@lgcode/skills.example.test@lgcode/catalog@lgcode/"

async function pull(skills: unknown[], files: Record<string, string> = {}) {
  const tmp = await tmpdir()
  const requests: string[] = []
  const http = Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request) =>
      Effect.sync(() => requests.push(request.url)).pipe(
        Effect.map(() => {
          const body = request.url === `${base}index.json` ? JSON.stringify({ skills }) : files[request.url]
          return HttpClientResponse.fromWeb(
            request,
            new Response(body ?? "Not Found", { status: body === undefined ? 404 : 200 }),
          )
        }),
      ),
    ),
  )
  const layer = SkillDiscovery.layer.pipe(
    Layer.provide(http),
    Layer.provide(FSUtil.defaultLayer),
    Layer.provide(Global.layerWith({ cache: tmp.path })),
  )
  const directories = await Effect.runPromise(
    Effect.gen(function* () {
      return yield* (yield* SkillDiscovery.Service).pull(base)
    }).pipe(Effect.provide(layer)),
  )
  return { tmp, requests, directories }
}

describe("SkillDiscovery.pull", () => {
  test("rejects skill name traversal without fetching files", async () => {
    const result = await pull([{ name: "..@lgcode/outside", files: ["SKILL.md"] }])
    try {
      expect(result.directories).toEqual([])
      expect(result.requests).toEqual([`${base}index.json`])
      expect(await fs.readdir(result.tmp.path)).toEqual([])
    } finally {
      await result.tmp[Symbol.asyncDispose]()
    }
  })

  test("rejects file traversal without fetching files", async () => {
    const result = await pull([{ name: "deploy", files: ["SKILL.md", "..@lgcode/outside.md"] }])
    try {
      expect(result.directories).toEqual([])
      expect(result.requests).toEqual([`${base}index.json`])
      expect(await fs.readdir(result.tmp.path)).toEqual([])
    } finally {
      await result.tmp[Symbol.asyncDispose]()
    }
  })

  test("rejects absolute file paths without fetching files", async () => {
    const result = await pull([{ name: "deploy", files: ["SKILL.md", "@lgcode/tmp@lgcode/outside.md"] }])
    try {
      expect(result.directories).toEqual([])
      expect(result.requests).toEqual([`${base}index.json`])
      expect(await fs.readdir(result.tmp.path)).toEqual([])
    } finally {
      await result.tmp[Symbol.asyncDispose]()
    }
  })

  test("rejects cross-origin file URLs without fetching files", async () => {
    const result = await pull([{ name: "deploy", files: ["SKILL.md", "https:@lgcode/@lgcode/evil.example.test@lgcode/outside.md"] }])
    try {
      expect(result.directories).toEqual([])
      expect(result.requests).toEqual([`${base}index.json`])
      expect(await fs.readdir(result.tmp.path)).toEqual([])
    } finally {
      await result.tmp[Symbol.asyncDispose]()
    }
  })

  test("downloads safe nested files under the skill root", async () => {
    const result = await pull([{ name: "deploy", files: ["SKILL.md", "references@lgcode/guide.md"] }], {
      [`${base}deploy@lgcode/SKILL.md`]: "# Deploy",
      [`${base}deploy@lgcode/references@lgcode/guide.md`]: "# Guide",
    })
    try {
      expect(result.directories).toHaveLength(1)
      expect(result.requests.toSorted()).toEqual(
        [`${base}index.json`, `${base}deploy@lgcode/SKILL.md`, `${base}deploy@lgcode/references@lgcode/guide.md`].toSorted(),
      )
      expect(await fs.readFile(path.join(result.directories[0], "SKILL.md"), "utf8")).toBe("# Deploy")
      expect(await fs.readFile(path.join(result.directories[0], "references", "guide.md"), "utf8")).toBe("# Guide")
    } finally {
      await result.tmp[Symbol.asyncDispose]()
    }
  })
})
