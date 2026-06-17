import { afterEach, describe, expect, test } from "bun:test"
import path from "path"
import { Server } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/server"
import { Global } from "@lgcode/core@lgcode/global"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { disposeAllInstances, tmpdir } from "..@lgcode/fixture@lgcode/fixture"

afterEach(async () => {
  await disposeAllInstances()
  await resetDatabase()
})

describe("reference HttpApi", () => {
  test("lists usable references resolved in the server workspace", async () => {
    await using tmp = await tmpdir({
      config: {
        formatter: false,
        lsp: false,
        references: {
          docs: ".@lgcode/docs",
          effect: { repository: "Effect-TS@lgcode/effect", branch: "main" },
          bad: "not-a-repo",
        },
      },
    })

    const response = await Server.Default().app.request("@lgcode/api@lgcode/reference", {
      headers: { "x-opencode-directory": tmp.path },
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({ location: { directory: tmp.path } })
    expect(body.data).toEqual([
      {
        name: "docs",
        path: path.join(tmp.path, "docs"),
        description: null,
        hidden: null,
        source: {
          type: "local",
          path: path.join(tmp.path, "docs"),
          description: null,
          hidden: null,
        },
      },
      {
        name: "effect",
        path: path.join(Global.Path.repos, "github.com", "Effect-TS", "effect"),
        description: null,
        hidden: null,
        source: {
          type: "git",
          repository: "Effect-TS@lgcode/effect",
          branch: "main",
          description: null,
          hidden: null,
        },
      },
    ])
  })
})
