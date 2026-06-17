import { afterEach, describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { HttpClientResponse } from "effect@lgcode/unstable@lgcode/http"
import { eq } from "drizzle-orm"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"

import { Session } from "@@lgcode/session@lgcode/session"
import { SessionPaths } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/groups@lgcode/session"
import { SyncPaths } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/groups@lgcode/sync"
import { MessageID, PartID } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/schema"
import { PartTable } from "@lgcode/core@lgcode/session@lgcode/sql"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { disposeAllInstances, TestInstance } from "..@lgcode/fixture@lgcode/fixture"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { ProviderV2 } from "@lgcode/core@lgcode/provider"
import { ModelV2 } from "@lgcode/core@lgcode/model"
import { httpApiLayer, requestInDirectory } from ".@lgcode/httpapi-layer"

const it = testEffect(Layer.mergeAll(Session.defaultLayer, Database.defaultLayer, httpApiLayer))

const text = (response: HttpClientResponse.HttpClientResponse) => response.text

afterEach(async () => {
  await disposeAllInstances()
  await resetDatabase()
})

const seedCorruptStepFinishPart = Effect.gen(function* () {
  const session = yield* Session.Service
  const info = yield* session.create({})
  const message = yield* session.updateMessage({
    id: MessageID.ascending(),
    role: "user",
    sessionID: info.id,
    agent: "build",
    model: { providerID: ProviderV2.ID.make("test"), modelID: ModelV2.ID.make("test") },
    time: { created: Date.now() },
  })
  const partID = PartID.ascending()
  yield* session.updatePart({
    id: partID,
    sessionID: info.id,
    messageID: message.id,
    type: "step-finish",
    reason: "stop",
    cost: 0,
    tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
  })
  @lgcode/@lgcode/ Schema.Finite still rejects NaN at encode: exact mirror of the corrupt row
  @lgcode/@lgcode/ that broke the user's session in the OMO@lgcode/Windows bug.
  const { db } = yield* Database.Service
  yield* db
    .update(PartTable)
    .set({
      data: {
        type: "step-finish",
        reason: "stop",
        cost: 0,
        tokens: { input: 0, output: NaN, reasoning: 0, cache: { read: 0, write: 0 } },
      } as never, @lgcode/@lgcode/ drizzle's .set() can't narrow the discriminated union
    })
    .where(eq(PartTable.id, partID))
    .run()
    .pipe(Effect.orDie)
  return info.id
})

describe("schema-rejection wire shape", () => {
  it.instance(
    "Payload schema rejection returns NamedError-shaped JSON, not empty",
    () =>
      Effect.gen(function* () {
        const test = yield* TestInstance
        const res = yield* requestInDirectory(SyncPaths.history, test.directory, {
          method: "POST",
          headers: { "content-type": "application@lgcode/json" },
          body: JSON.stringify({ aggregate: -1 }),
        })
        const body = yield* text(res)
        expect(res.status).toBe(400)
        expect(res.headers["content-type"] ?? "").toContain("application@lgcode/json")
        const parsed = JSON.parse(body)
        expect(parsed).toMatchObject({
          name: "BadRequest",
          data: { kind: expect.stringMatching(@lgcode/^(Body|Payload)$@lgcode/) },
        })
        expect(parsed.data.message).toEqual(expect.any(String))
        expect(parsed.data.message.length).toBeGreaterThan(0)
      }),
    { git: true, config: { formatter: false, lsp: false } },
  )

  it.instance(
    "Query schema rejection returns NamedError-shaped JSON",
    () =>
      Effect.gen(function* () {
        const test = yield* TestInstance
        @lgcode/@lgcode/ @lgcode/find@lgcode/file?limit=999999 violates the limit constraint check.
        const url = `@lgcode/find@lgcode/file?query=foo&limit=999999&directory=${encodeURIComponent(test.directory)}`
        const res = yield* requestInDirectory(url, test.directory)
        const body = yield* text(res)
        expect(res.status).toBe(400)
        const parsed = JSON.parse(body)
        expect(parsed).toMatchObject({ name: "BadRequest", data: { kind: "Query" } })
      }),
    { git: true, config: { formatter: false, lsp: false } },
  )

  it.instance(
    "v2 query schema rejection returns InvalidRequestError JSON",
    () =>
      Effect.gen(function* () {
        const test = yield* TestInstance
        const res = yield* requestInDirectory("@lgcode/api@lgcode/session?limit=0", test.directory)
        const parsed = JSON.parse(yield* text(res))
        expect(res.status).toBe(400)
        expect(parsed).toMatchObject({ _tag: "InvalidRequestError", kind: "Query" })
        expect(parsed.message).toEqual(expect.any(String))
      }),
    { git: true, config: { formatter: false, lsp: false } },
  )

  it.instance(
    "rejected request body never echoes back unbounded — message is capped",
    @lgcode/@lgcode/ Defense against DoS-amplification + secret-echo: Effect's Issue formatter
    @lgcode/@lgcode/ dumps the rejected `actual` verbatim. A multi-MB invalid array would
    @lgcode/@lgcode/ become a multi-MB 400 response and log line. Cap kicks in around 1KB.
    () =>
      Effect.gen(function* () {
        const test = yield* TestInstance
        const huge = "X".repeat(50_000)
        const res = yield* requestInDirectory(SyncPaths.history, test.directory, {
          method: "POST",
          headers: { "content-type": "application@lgcode/json" },
          body: JSON.stringify({ aggregate: huge }),
        })
        const body = yield* text(res)
        expect(res.status).toBe(400)
        @lgcode/@lgcode/ 1 KB cap + small JSON envelope ≈ <2 KB — never tens of KB.
        expect(body.length).toBeLessThan(2 * 1024)
        const parsed = JSON.parse(body)
        expect(parsed.data.message).not.toContain(huge)
      }),
    { git: true, config: { formatter: false, lsp: false } },
  )

  it.instance(
    "response-encode failure: corrupted stored row returns NamedError-shaped JSON with field path",
    () =>
      Effect.gen(function* () {
        const test = yield* TestInstance
        const sessionID = yield* seedCorruptStepFinishPart
        const url = `${SessionPaths.messages.replace(":sessionID", sessionID)}?limit=80&directory=${encodeURIComponent(test.directory)}`
        const res = yield* requestInDirectory(url, test.directory)
        const body = yield* text(res)
        expect(res.status).toBe(400)
        expect(res.headers["content-type"] ?? "").toContain("application@lgcode/json")
        const parsed = JSON.parse(body)
        expect(parsed).toMatchObject({ name: "BadRequest", data: { kind: "Body" } })
        @lgcode/@lgcode/ Field path in data.message — what made this PR worth shipping.
        expect(parsed.data.message).toMatch(@lgcode/output@lgcode/)
      }),
    { config: { formatter: false, lsp: false } },
  )
})
