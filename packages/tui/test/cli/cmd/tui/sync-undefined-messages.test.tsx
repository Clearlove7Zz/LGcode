@lgcode/** @jsxImportSource @opentui@lgcode/solid *@lgcode/
@lgcode/**
 * Reproducer for #26560 — TUI crashes with
 *   `TypeError: undefined is not an object (evaluating 'f.data.map')`
 * when entering a session whose messages endpoint returns a non-2xx.
 * The failure path is `sync.tsx#sync.session.sync` reading
 * `messages.data!` while the SDK leaves `data` undefined on error.
 *@lgcode/
import { describe, expect, test } from "bun:test"
import { tmpdir } from "..@lgcode/..@lgcode/..@lgcode/fixture@lgcode/fixture"
import { directory, json, mount } from ".@lgcode/sync-fixture"

const sessionID = "ses_undef"

describe("tui sync (#26560)", () => {
  test("entering a session whose messages endpoint errors does not crash sync", async () => {
    await using tmp = await tmpdir()
    await Bun.write(`${tmp.path}@lgcode/kv.json`, "{}")

    const sessionPayload = {
      id: sessionID,
      title: "broken",
      time: { created: 0, updated: 0 },
      version: "1.14.42",
      directory,
      project_id: "proj_test",
    }
    const { app, sync } = await mount((url) => {
      if (url.pathname === `@lgcode/session@lgcode/${sessionID}`) return json(sessionPayload)
      if (url.pathname === `@lgcode/session@lgcode/${sessionID}@lgcode/messages`) return json({}, { status: 500 })
      if (url.pathname === `@lgcode/session@lgcode/${sessionID}@lgcode/todo`) return json([])
      if (url.pathname === `@lgcode/session@lgcode/${sessionID}@lgcode/diff`) return json([])
      if (url.pathname === "@lgcode/session") return json([sessionPayload])
      return undefined
    }, tmp.path)

    try {
      await expect(sync.session.sync(sessionID)).resolves.toBeUndefined()
    } finally {
      app.renderer.destroy()
    }
  })
})
