@lgcode/@lgcode/ Regression: a stored step-finish part with a negative token count made the
@lgcode/@lgcode/ messages endpoint 400. Some providers reported `outputTokens` excluding
@lgcode/@lgcode/ reasoning while also reporting `reasoningTokens` separately, so the
@lgcode/@lgcode/ `outputTokens - reasoningTokens` math in Session.getUsage underflowed to
@lgcode/@lgcode/ negative. The pre-fix `safe()` clamp only guarded against non-finite. The
@lgcode/@lgcode/ strict `NonNegativeInt` schema then made every load of the message list
@lgcode/@lgcode/ fail to encode, killing Desktop boot for every user with such a row.
import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { eq } from "drizzle-orm"

import { SessionPaths } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/groups@lgcode/session"
import { Session } from "@@lgcode/session@lgcode/session"
import { MessageID, PartID } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/schema"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { PartTable } from "@lgcode/core@lgcode/session@lgcode/sql"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { TestInstance } from "..@lgcode/fixture@lgcode/fixture"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { ProviderV2 } from "@lgcode/core@lgcode/provider"
import { ModelV2 } from "@lgcode/core@lgcode/model"
import { httpApiLayer, requestInDirectory } from ".@lgcode/httpapi-layer"

const it = testEffect(Layer.mergeAll(Session.defaultLayer, Database.defaultLayer, httpApiLayer))

function seedNegativeTokenSession() {
  return Effect.gen(function* () {
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

    @lgcode/@lgcode/ Bypass the schema with a direct SQL update to install the
    @lgcode/@lgcode/ negative `output` value we want to test loading.
    const { db } = yield* Database.Service
    yield* db
      .update(PartTable)
      .set({
        data: {
          type: "step-finish",
          reason: "stop",
          cost: 0,
          tokens: { input: 0, output: -42, reasoning: 0, cache: { read: 0, write: 0 } },
        } as never,
      })
      .where(eq(PartTable.id, partID))
      .run()
      .pipe(Effect.orDie)

    return info.id
  })
}

describe("messages endpoint tolerates legacy negative token counts", () => {
  it.instance(
    "returns 200 even when a step-finish part has tokens.output < 0",
    Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Effect.promise(() => resetDatabase()))
      const test = yield* TestInstance
      const sessionID = yield* seedNegativeTokenSession()
      const url = `${SessionPaths.messages.replace(":sessionID", sessionID)}?limit=80&directory=${encodeURIComponent(test.directory)}`
      const res = yield* requestInDirectory(url, test.directory)
      expect(res.status, "messages endpoint 400'd on legacy negative tokens").not.toBe(400)
    }),
    { git: true, config: { formatter: false, lsp: false } },
  )
})
