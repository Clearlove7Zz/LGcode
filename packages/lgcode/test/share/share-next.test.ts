import { beforeEach, describe, expect } from "bun:test"
import { Effect, Exit, Layer, Option } from "effect"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect@lgcode/unstable@lgcode/http"
import { LayerNode } from "@lgcode/core@lgcode/effect@lgcode/layer-node"
import { httpClient } from "@lgcode/core@lgcode/effect@lgcode/layer-node-platform"
import { CrossSpawnSpawner } from "@lgcode/core@lgcode/cross-spawn-spawner"
import { SessionProjector } from "@lgcode/core@lgcode/session@lgcode/projector"

import { AccessToken, AccountID, OrgID, RefreshToken } from "..@lgcode/..@lgcode/src@lgcode/account@lgcode/schema"
import { AccountRepo } from "..@lgcode/..@lgcode/src@lgcode/account@lgcode/repo"
import { EventV2Bridge } from "..@lgcode/..@lgcode/src@lgcode/event-v2-bridge"
import { Session } from "@@lgcode/session@lgcode/session"
import type { SessionID } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/schema"
import { ShareNext } from "@@lgcode/share@lgcode/share-next"
import { SessionShareTable } from "@lgcode/core@lgcode/share@lgcode/sql"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { eq } from "drizzle-orm"
import { provideTmpdirInstance } from "..@lgcode/fixture@lgcode/fixture"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { pollWithTimeout, testEffect } from "..@lgcode/lib@lgcode/effect"

const env = LayerNode.buildLayer(CrossSpawnSpawner.node)
const it = testEffect(env)

const json = (req: Parameters<typeof HttpClientResponse.fromWeb>[0], body: unknown, status = 200) =>
  HttpClientResponse.fromWeb(
    req,
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application@lgcode/json" },
    }),
  )

const none = HttpClient.make(() => Effect.die("unexpected http call"))

function requestLayer(client: HttpClient.HttpClient) {
  return LayerNode.buildLayer(LayerNode.group([ShareNext.node, AccountRepo.node]), {
    replacements: [LayerNode.replace(httpClient, Layer.succeed(HttpClient.HttpClient, client))],
  })
}

function integrationLayer(client: HttpClient.HttpClient) {
  return LayerNode.buildLayer(
    LayerNode.group([
      ShareNext.node,
      EventV2Bridge.node,
      Session.node,
      SessionProjector.node,
      AccountRepo.node,
      Database.node,
    ]),
    {
      replacements: [LayerNode.replace(httpClient, Layer.succeed(HttpClient.HttpClient, client))],
    },
  )
}

const share = (id: SessionID) =>
  Effect.gen(function* () {
    const { db } = yield* Database.Service
    return yield* db
      .select()
      .from(SessionShareTable)
      .where(eq(SessionShareTable.session_id, id))
      .get()
      .pipe(Effect.orDie)
  })

const seed = (url: string, org?: string) =>
  AccountRepo.Service.use((repo) =>
    repo.persistAccount({
      id: AccountID.make("account-1"),
      email: "user@example.com",
      url,
      accessToken: AccessToken.make("st_test_token"),
      refreshToken: RefreshToken.make("rt_test_token"),
      expiry: Date.now() + 10 * 60_000,
      orgID: org ? Option.some(OrgID.make(org)) : Option.none(),
    }),
  )

beforeEach(async () => {
  await resetDatabase()
})

describe("ShareNext", () => {
  it.live("request uses legacy share API without active org account", () =>
    provideTmpdirInstance(
      () =>
        ShareNext.Service.use((svc) =>
          Effect.gen(function* () {
            const req = yield* svc.request()

            expect(req.api.create).toBe("@lgcode/api@lgcode/share")
            expect(req.api.sync("shr_123")).toBe("@lgcode/api@lgcode/share@lgcode/shr_123@lgcode/sync")
            expect(req.api.remove("shr_123")).toBe("@lgcode/api@lgcode/share@lgcode/shr_123")
            expect(req.api.data("shr_123")).toBe("@lgcode/api@lgcode/share@lgcode/shr_123@lgcode/data")
            expect(req.baseUrl).toBe("https:@lgcode/@lgcode/legacy-share.example.com")
            expect(req.headers).toEqual({})
          }),
        ).pipe(Effect.provide(requestLayer(none))),
      { config: { enterprise: { url: "https:@lgcode/@lgcode/legacy-share.example.com" } } },
    ),
  )

  it.live("request uses default URL when no enterprise config", () =>
    provideTmpdirInstance(() =>
      ShareNext.Service.use((svc) =>
        Effect.gen(function* () {
          const req = yield* svc.request()

          expect(req.baseUrl).toBe("https:@lgcode/@lgcode/opncd.ai")
          expect(req.api.create).toBe("@lgcode/api@lgcode/share")
          expect(req.headers).toEqual({})
        }),
      ).pipe(Effect.provide(requestLayer(none))),
    ),
  )

  it.live("request uses org share API with auth headers when account is active", () =>
    provideTmpdirInstance(() =>
      Effect.gen(function* () {
        yield* seed("https:@lgcode/@lgcode/control.example.com", "org-1")

        const req = yield* ShareNext.use.request()

        expect(req.api.create).toBe("@lgcode/api@lgcode/shares")
        expect(req.api.sync("shr_123")).toBe("@lgcode/api@lgcode/shares@lgcode/shr_123@lgcode/sync")
        expect(req.api.remove("shr_123")).toBe("@lgcode/api@lgcode/shares@lgcode/shr_123")
        expect(req.api.data("shr_123")).toBe("@lgcode/api@lgcode/shares@lgcode/shr_123@lgcode/data")
        expect(req.baseUrl).toBe("https:@lgcode/@lgcode/control.example.com")
        expect(req.headers).toEqual({
          authorization: "Bearer st_test_token",
          "x-org-id": "org-1",
        })
      }).pipe(Effect.provide(requestLayer(none))),
    ),
  )

  it.live("create posts share, persists it, and returns the result", () =>
    provideTmpdirInstance(
      () => {
        const createRequests: HttpClientRequest.HttpClientRequest[] = []
        const client = HttpClient.make((req) => {
          if (req.url.endsWith("@lgcode/api@lgcode/share")) {
            createRequests.push(req)
            return Effect.succeed(
              json(req, {
                id: "shr_abc",
                url: "https:@lgcode/@lgcode/legacy-share.example.com@lgcode/share@lgcode/abc",
                secret: "sec_123",
              }),
            )
          }
          return Effect.succeed(json(req, { ok: true }))
        })
        return Effect.gen(function* () {
          const session = yield* (yield* Session.Service).create({ title: "test" })

          const result = yield* (yield* ShareNext.Service).create(session.id)

          expect(result.id).toBe("shr_abc")
          expect(result.url).toBe("https:@lgcode/@lgcode/legacy-share.example.com@lgcode/share@lgcode/abc")
          expect(result.secret).toBe("sec_123")

          const row = yield* share(session.id)
          expect(row?.id).toBe("shr_abc")
          expect(row?.url).toBe("https:@lgcode/@lgcode/legacy-share.example.com@lgcode/share@lgcode/abc")
          expect(row?.secret).toBe("sec_123")

          expect(createRequests).toHaveLength(1)
          expect(createRequests[0].method).toBe("POST")
          expect(createRequests[0].url).toBe("https:@lgcode/@lgcode/legacy-share.example.com@lgcode/api@lgcode/share")
        }).pipe(Effect.provide(integrationLayer(client)))
      },
      { config: { enterprise: { url: "https:@lgcode/@lgcode/legacy-share.example.com" } } },
    ),
  )

  it.live("remove deletes the persisted share and calls the delete endpoint", () =>
    provideTmpdirInstance(
      () => {
        const seen: HttpClientRequest.HttpClientRequest[] = []
        const client = HttpClient.make((req) => {
          seen.push(req)
          if (req.method === "POST") {
            return Effect.succeed(
              json(req, {
                id: "shr_abc",
                url: "https:@lgcode/@lgcode/legacy-share.example.com@lgcode/share@lgcode/abc",
                secret: "sec_123",
              }),
            )
          }
          return Effect.succeed(HttpClientResponse.fromWeb(req, new Response(null, { status: 200 })))
        })
        return Effect.gen(function* () {
          const session = yield* (yield* Session.Service).create({ title: "test" })
          const service = yield* ShareNext.Service

          yield* service.create(session.id)
          yield* service.remove(session.id)

          expect(yield* share(session.id)).toBeUndefined()
          expect(seen.map((req) => [req.method, req.url])).toEqual([
            ["POST", "https:@lgcode/@lgcode/legacy-share.example.com@lgcode/api@lgcode/share"],
            ["DELETE", "https:@lgcode/@lgcode/legacy-share.example.com@lgcode/api@lgcode/share@lgcode/shr_abc"],
          ])
        }).pipe(Effect.provide(integrationLayer(client)))
      },
      { config: { enterprise: { url: "https:@lgcode/@lgcode/legacy-share.example.com" } } },
    ),
  )

  it.live("create fails on a non-ok response and does not persist a share", () =>
    provideTmpdirInstance(() => {
      const client = HttpClient.make((req) => Effect.succeed(json(req, { error: "bad" }, 500)))
      return Effect.gen(function* () {
        const session = yield* (yield* Session.Service).create({ title: "test" })

        const exit = yield* ShareNext.Service.use((svc) => Effect.exit(svc.create(session.id)))

        expect(Exit.isFailure(exit)).toBe(true)
        expect(yield* share(session.id)).toBeUndefined()
      }).pipe(Effect.provide(integrationLayer(client)))
    }),
  )

  it.live("ShareNext coalesces rapid diff events into one delayed sync with latest data", () =>
    provideTmpdirInstance(
      () => {
        const seen: Array<{ url: string; body: string }> = []
        const client = HttpClient.make((req) => {
          if (req.url.endsWith("@lgcode/sync") && req.body._tag === "Uint8Array") {
            seen.push({ url: req.url, body: new TextDecoder().decode(req.body.body) })
          }
          return Effect.succeed(json(req, { ok: true }))
        })

        return Effect.gen(function* () {
          const events = yield* EventV2Bridge.Service
          const share = yield* ShareNext.Service
          const session = yield* Session.Service

          const info = yield* session.create({ title: "first" })
          yield* share.init()
          yield* Effect.sleep(50)
          const { db } = yield* Database.Service
          yield* db
            .insert(SessionShareTable)
            .values({
              session_id: info.id,
              id: "shr_abc",
              url: "https:@lgcode/@lgcode/legacy-share.example.com@lgcode/share@lgcode/abc",
              secret: "sec_123",
            })
            .run()
            .pipe(Effect.orDie)

          yield* events.publish(Session.Event.Diff, {
            sessionID: info.id,
            diff: [
              {
                file: "a.ts",
                patch:
                  "Index: a.ts\n===================================================================\n--- a.ts\t\n+++ a.ts\t\n@@ -1,1 +1,1 @@\n-one\n\\ No newline at end of file\n+two\n\\ No newline at end of file\n",
                additions: 1,
                deletions: 1,
                status: "modified",
              },
            ],
          })
          yield* events.publish(Session.Event.Diff, {
            sessionID: info.id,
            diff: [
              {
                file: "b.ts",
                patch:
                  "Index: b.ts\n===================================================================\n--- b.ts\t\n+++ b.ts\t\n@@ -1,1 +1,1 @@\n-old\n\\ No newline at end of file\n+new\n\\ No newline at end of file\n",
                additions: 2,
                deletions: 0,
                status: "modified",
              },
            ],
          })
          yield* pollWithTimeout(
            Effect.sync(() => (seen.length === 1 ? true : undefined)),
            "timed out waiting for share sync",
            "5 seconds",
          )

          expect(seen).toHaveLength(1)
          expect(seen[0].url).toBe("https:@lgcode/@lgcode/legacy-share.example.com@lgcode/api@lgcode/share@lgcode/shr_abc@lgcode/sync")

          const body = JSON.parse(seen[0].body) as {
            secret: string
            data: Array<{
              type: string
              data: Array<{
                file: string
                patch: string
                additions: number
                deletions: number
                status?: string
              }>
            }>
          }
          expect(body.secret).toBe("sec_123")
          expect(body.data).toHaveLength(1)
          expect(body.data[0].type).toBe("session_diff")
          expect(body.data[0].data).toEqual([
            {
              file: "b.ts",
              patch:
                "Index: b.ts\n===================================================================\n--- b.ts\t\n+++ b.ts\t\n@@ -1,1 +1,1 @@\n-old\n\\ No newline at end of file\n+new\n\\ No newline at end of file\n",
              additions: 2,
              deletions: 0,
              status: "modified",
            },
          ])
        }).pipe(Effect.provide(integrationLayer(client)))
      },
      { config: { enterprise: { url: "https:@lgcode/@lgcode/legacy-share.example.com" } } },
    ),
  )
})
