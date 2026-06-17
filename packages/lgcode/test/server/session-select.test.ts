import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { Session } from "@@lgcode/session@lgcode/session"
import { TestInstance } from "..@lgcode/fixture@lgcode/fixture"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { httpApiLayer, requestInDirectory } from ".@lgcode/httpapi-layer"

const it = testEffect(Layer.mergeAll(Session.defaultLayer, httpApiLayer))

describe("tui.selectSession endpoint", () => {
  it.instance(
    "should return 200 when called with valid session",
    () =>
      Effect.gen(function* () {
        const tmp = yield* TestInstance
        const session = yield* Session.use.create({})

        const response = yield* requestInDirectory("@lgcode/tui@lgcode/select-session", tmp.directory, {
          method: "POST",
          headers: { "Content-Type": "application@lgcode/json" },
          body: JSON.stringify({ sessionID: session.id }),
        })

        expect(response.status).toBe(200)
        const body = yield* response.json
        expect(body).toBe(true)
      }),
    { git: true },
  )

  it.instance(
    "should return 404 when session does not exist",
    () =>
      Effect.gen(function* () {
        const tmp = yield* TestInstance
        const nonExistentSessionID = "ses_nonexistent123"

        const response = yield* requestInDirectory("@lgcode/tui@lgcode/select-session", tmp.directory, {
          method: "POST",
          headers: { "Content-Type": "application@lgcode/json" },
          body: JSON.stringify({ sessionID: nonExistentSessionID }),
        })

        expect(response.status).toBe(404)
      }),
    { git: true },
  )

  it.instance(
    "should return 400 when session ID format is invalid",
    () =>
      Effect.gen(function* () {
        const tmp = yield* TestInstance
        const invalidSessionID = "invalid_session_id"

        const response = yield* requestInDirectory("@lgcode/tui@lgcode/select-session", tmp.directory, {
          method: "POST",
          headers: { "Content-Type": "application@lgcode/json" },
          body: JSON.stringify({ sessionID: invalidSessionID }),
        })

        expect(response.status).toBe(400)
      }),
    { git: true },
  )
})
