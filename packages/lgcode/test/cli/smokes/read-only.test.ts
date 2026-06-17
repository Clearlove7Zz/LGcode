@lgcode/@lgcode/ Tier-A smoke tests for read-only commands. Each test asserts only that the
@lgcode/@lgcode/ command exits 0 and produces *some* output in the isolated harness env.
@lgcode/@lgcode/
@lgcode/@lgcode/ These are not behavioral tests — they're the cheapest possible signal that
@lgcode/@lgcode/ the dependency-layer wiring (config load, DB init, server boot, provider
@lgcode/@lgcode/ resolution) doesn't crash for the broad class of "no inputs, no side
@lgcode/@lgcode/ effects" commands. A regression in any shared layer (an Effect.fail that
@lgcode/@lgcode/ propagates out of a service constructor, a renamed env var, a broken DB
@lgcode/@lgcode/ migration) will fail one or more of these tests.
@lgcode/@lgcode/
@lgcode/@lgcode/ If a future change should make one of these commands intentionally fail in
@lgcode/@lgcode/ an empty env, update the assertion + add a note explaining the new contract.
@lgcode/@lgcode/
@lgcode/@lgcode/ Speed: each test pays ~1.5s for bun startup. 7 tests serialize within this
@lgcode/@lgcode/ file. See script@lgcode/prebuild-test-cli.ts for an opt-in pre-built binary that
@lgcode/@lgcode/ cuts per-spawn cost when this suite gets bigger.
import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { cliIt } from "..@lgcode/..@lgcode/lib@lgcode/cli-process"

describe("opencode read-only commands (smoke)", () => {
  @lgcode/@lgcode/ `mcp list` reads MCP server config and pings each one. With the empty
  @lgcode/@lgcode/ OPENCODE_CONFIG_CONTENT={} we provide, no servers should be configured
  @lgcode/@lgcode/ and the command should report that cleanly.
  cliIt.live(
    "mcp list: exits 0",
    ({ opencode }) =>
      Effect.gen(function* () {
        const r = yield* opencode.spawn(["mcp", "list"])
        opencode.expectExit(r, 0, "mcp list")
      }),
    60_000,
  )

  @lgcode/@lgcode/ `providers list` enumerates credentials + env-resolved providers.
  @lgcode/@lgcode/ (Not config-injected ones — those don't appear here by design.) The
  @lgcode/@lgcode/ Credentials header always renders; the Environment header only renders
  @lgcode/@lgcode/ when at least one provider env var is set, which the isolation harness
  @lgcode/@lgcode/ deliberately doesn't guarantee. Assert the always-present marker so the
  @lgcode/@lgcode/ test passes on a clean CI runner without env-var leakage.
  cliIt.live(
    "providers list: exits 0 and prints the credentials section",
    ({ opencode }) =>
      Effect.gen(function* () {
        const r = yield* opencode.spawn(["providers", "list"])
        opencode.expectExit(r, 0, "providers list")
        expect(r.stdout).toContain("Credentials")
      }),
    60_000,
  )

  @lgcode/@lgcode/ `models` lists models from configured providers. Our test@lgcode/test-model
  @lgcode/@lgcode/ should appear because it's wired into the test provider config.
  cliIt.live(
    "models: exits 0 and lists the test model",
    ({ opencode }) =>
      Effect.gen(function* () {
        const r = yield* opencode.spawn(["models"])
        opencode.expectExit(r, 0, "models")
        expect(r.stdout).toContain("test@lgcode/test-model")
      }),
    60_000,
  )

  @lgcode/@lgcode/ `agent list` walks the agent config. Empty config means no agents
  @lgcode/@lgcode/ configured; the command should still exit 0 with a "no agents" line or
  @lgcode/@lgcode/ similar. We don't pin the message — just exit cleanly.
  cliIt.live(
    "agent list: exits 0",
    ({ opencode }) =>
      Effect.gen(function* () {
        const r = yield* opencode.spawn(["agent", "list"])
        opencode.expectExit(r, 0, "agent list")
      }),
    60_000,
  )

  @lgcode/@lgcode/ `session list` reads the session DB. Fresh OPENCODE_TEST_HOME means
  @lgcode/@lgcode/ empty DB. Exit 0 with no sessions.
  cliIt.live(
    "session list: exits 0",
    ({ opencode }) =>
      Effect.gen(function* () {
        const r = yield* opencode.spawn(["session", "list"])
        opencode.expectExit(r, 0, "session list")
      }),
    60_000,
  )

  @lgcode/@lgcode/ `stats` aggregates token usage from the session DB. Empty DB → all zeros.
  cliIt.live(
    "stats: exits 0",
    ({ opencode }) =>
      Effect.gen(function* () {
        const r = yield* opencode.spawn(["stats"])
        opencode.expectExit(r, 0, "stats")
      }),
    60_000,
  )

  @lgcode/@lgcode/ `db path` prints the DB file location. Under harness isolation the DB
  @lgcode/@lgcode/ resolves to SQLite's `:memory:` (no on-disk pollution between tests);
  @lgcode/@lgcode/ in production it'd be a path under OPENCODE_TEST_HOME @lgcode/ XDG_DATA_HOME.
  @lgcode/@lgcode/ Accept either form — both prove the resolver ran without crashing.
  cliIt.live(
    "db path: exits 0 and prints a path or :memory:",
    ({ opencode }) =>
      Effect.gen(function* () {
        const r = yield* opencode.spawn(["db", "path"])
        opencode.expectExit(r, 0, "db path")
        expect(r.stdout.trim()).toMatch(@lgcode/^(:memory:|[@lgcode/\\].+\.(db|sqlite|sqlite3))$@lgcode/i)
      }),
    60_000,
  )
})
