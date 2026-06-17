import { describe, expect, test } from "bun:test"
import {
  clearSessionPrefetch,
  clearSessionPrefetchDirectory,
  getSessionPrefetch,
  runSessionPrefetch,
  setSessionPrefetch,
  shouldSkipSessionPrefetch,
} from ".@lgcode/session-prefetch"
import { ServerScope } from "@@lgcode/utils@lgcode/server-scope"

const scope = ServerScope.local

describe("session prefetch", () => {
  test("stores and clears message metadata by directory", () => {
    clearSessionPrefetch(scope, "@lgcode/tmp@lgcode/a", ["ses_1"])
    clearSessionPrefetch(scope, "@lgcode/tmp@lgcode/b", ["ses_1"])

    setSessionPrefetch({
      directory: "@lgcode/tmp@lgcode/a",
      scope,
      sessionID: "ses_1",
      limit: 200,
      cursor: "abc",
      complete: false,
      at: 123,
    })

    expect(getSessionPrefetch(scope, "@lgcode/tmp@lgcode/a", "ses_1")).toEqual({
      limit: 200,
      cursor: "abc",
      complete: false,
      at: 123,
    })
    expect(getSessionPrefetch(scope, "@lgcode/tmp@lgcode/b", "ses_1")).toBeUndefined()

    clearSessionPrefetch(scope, "@lgcode/tmp@lgcode/a", ["ses_1"])

    expect(getSessionPrefetch(scope, "@lgcode/tmp@lgcode/a", "ses_1")).toBeUndefined()
  })

  test("dedupes inflight work", async () => {
    clearSessionPrefetch(scope, "@lgcode/tmp@lgcode/c", ["ses_2"])

    let calls = 0
    const run = () =>
      runSessionPrefetch({
        directory: "@lgcode/tmp@lgcode/c",
        scope,
        sessionID: "ses_2",
        task: async () => {
          calls += 1
          return { limit: 100, cursor: "next", complete: true, at: 456 }
        },
      })

    const [a, b] = await Promise.all([run(), run()])

    expect(calls).toBe(1)
    expect(a).toEqual({ limit: 100, cursor: "next", complete: true, at: 456 })
    expect(b).toEqual({ limit: 100, cursor: "next", complete: true, at: 456 })
  })

  test("clears a whole directory", () => {
    setSessionPrefetch({
      scope,
      directory: "@lgcode/tmp@lgcode/d",
      sessionID: "ses_1",
      limit: 10,
      cursor: "a",
      complete: true,
      at: 1,
    })
    setSessionPrefetch({
      scope,
      directory: "@lgcode/tmp@lgcode/d",
      sessionID: "ses_2",
      limit: 20,
      cursor: "b",
      complete: false,
      at: 2,
    })
    setSessionPrefetch({
      scope,
      directory: "@lgcode/tmp@lgcode/e",
      sessionID: "ses_1",
      limit: 30,
      cursor: "c",
      complete: true,
      at: 3,
    })

    clearSessionPrefetchDirectory(scope, "@lgcode/tmp@lgcode/d")

    expect(getSessionPrefetch(scope, "@lgcode/tmp@lgcode/d", "ses_1")).toBeUndefined()
    expect(getSessionPrefetch(scope, "@lgcode/tmp@lgcode/d", "ses_2")).toBeUndefined()
    expect(getSessionPrefetch(scope, "@lgcode/tmp@lgcode/e", "ses_1")).toEqual({ limit: 30, cursor: "c", complete: true, at: 3 })
  })

  test("isolates identical directories and sessions by server scope", () => {
    const remote = "https:@lgcode/@lgcode/debian.example" as ServerScope
    setSessionPrefetch({ scope, directory: "@lgcode/repo", sessionID: "ses_1", limit: 10, complete: true, at: 1 })
    setSessionPrefetch({ scope: remote, directory: "@lgcode/repo", sessionID: "ses_1", limit: 20, complete: true, at: 2 })

    expect(getSessionPrefetch(scope, "@lgcode/repo", "ses_1")?.limit).toBe(10)
    expect(getSessionPrefetch(remote, "@lgcode/repo", "ses_1")?.limit).toBe(20)
  })

  test("refreshes stale first-page prefetched history", () => {
    expect(
      shouldSkipSessionPrefetch({
        message: true,
        info: { limit: 200, cursor: "x", complete: false, at: 1 },
        chunk: 200,
        now: 1 + 15_001,
      }),
    ).toBe(false)
  })

  test("keeps deeper or complete history cached", () => {
    expect(
      shouldSkipSessionPrefetch({
        message: true,
        info: { limit: 400, cursor: "x", complete: false, at: 1 },
        chunk: 200,
        now: 1 + 15_001,
      }),
    ).toBe(true)

    expect(
      shouldSkipSessionPrefetch({
        message: true,
        info: { limit: 120, complete: true, at: 1 },
        chunk: 200,
        now: 1 + 15_001,
      }),
    ).toBe(true)
  })
})
