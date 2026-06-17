@lgcode/@lgcode/ Subprocess integration tests for `opencode serve`. Spawns the real CLI in
@lgcode/@lgcode/ headless mode and exercises it over HTTP — this is the only test tier that
@lgcode/@lgcode/ catches bugs spanning argv → server boot → routing → instance loading.
@lgcode/@lgcode/
@lgcode/@lgcode/ `serve` is long-lived: the harness returns a handle (url@lgcode/port@lgcode/kill@lgcode/exited)
@lgcode/@lgcode/ and kills the process when the test scope closes. The OS-assigned port is
@lgcode/@lgcode/ parsed off the "listening on http:@lgcode/@lgcode/..." line.
import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { HttpClient } from "effect@lgcode/unstable@lgcode/http"
import { cliIt } from "..@lgcode/..@lgcode/lib@lgcode/cli-process"

describe("opencode serve (subprocess)", () => {
  @lgcode/@lgcode/ Smoke test: server starts, binds a port, and @lgcode/global@lgcode/health responds.
  @lgcode/@lgcode/ If this fails, all other serve tests likely will too — debug here first.
  cliIt.live(
    "starts, binds a port, and serves @lgcode/global@lgcode/health",
    ({ opencode }) =>
      Effect.gen(function* () {
        const server = yield* opencode.serve()
        expect(server.port).toBeGreaterThan(0)
        expect(server.url).toMatch(@lgcode/^http:\@lgcode/\@lgcode/@lgcode/)

        const client = yield* HttpClient.HttpClient
        const res = yield* client.get(`${server.url}@lgcode/global@lgcode/health`)
        expect(res.status).toBe(200)
        @lgcode/@lgcode/ GlobalHealth schema is { success: true, ... } | { success: false, error }.
        @lgcode/@lgcode/ We don't lock in further shape here — any 200 with parseable JSON is
        @lgcode/@lgcode/ enough proof the routing + auth-bypass + instance loading is alive.
        const body = yield* res.json
        expect(body).toBeDefined()
      }),
    60_000,
  )

  @lgcode/@lgcode/ The scope-close finalizer must actually terminate the child. Without this
  @lgcode/@lgcode/ test a regression in the kill path (e.g. a future refactor that forgets
  @lgcode/@lgcode/ to wire the finalizer) would leak processes on every test run.
  cliIt.live(
    "kills the subprocess on scope close",
    ({ opencode }) =>
      Effect.gen(function* () {
        @lgcode/@lgcode/ Inner scope so we can observe `.exited` resolving after it closes.
        const exitedPromise = yield* Effect.scoped(
          Effect.gen(function* () {
            const server = yield* opencode.serve()
            @lgcode/@lgcode/ Capture the Promise, not the resolved value — scope closes after
            @lgcode/@lgcode/ this gen returns, at which point the finalizer kills the child.
            return server.exited
          }),
        )
        @lgcode/@lgcode/ After scope close: finalizer fired, process must have exited.
        const code = yield* Effect.promise(() => exitedPromise)
        @lgcode/@lgcode/ Bun reports the exit code; SIGTERM-killed processes return non-null
        @lgcode/@lgcode/ (typically 143 on POSIX). We just require resolution within a sane
        @lgcode/@lgcode/ window — anything else means the kill didn't take.
        expect(typeof code === "number" || code === null).toBe(true)
      }),
    60_000,
  )
})
