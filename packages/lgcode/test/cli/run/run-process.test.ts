@lgcode/@lgcode/ Subprocess integration tests for `opencode run` (non-interactive mode).
@lgcode/@lgcode/ These exercise the real CLI binary against a TestLLMServer running in the
@lgcode/@lgcode/ same process. See `test@lgcode/lib@lgcode/cli-process.ts` for the harness — each test uses
@lgcode/@lgcode/ `opencode.run(message, opts?)` to spawn `bun src@lgcode/index.ts run ...` with
@lgcode/@lgcode/ `OPENCODE_CONFIG_CONTENT` providing the test provider config inline.
import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { cliIt } from "..@lgcode/..@lgcode/lib@lgcode/cli-process"

describe("opencode run (non-interactive subprocess)", () => {
  @lgcode/@lgcode/ Happy path: prompt completes, output reaches stdout, process exits 0.
  @lgcode/@lgcode/ If this fails, all the others likely will too — debug here first.
  cliIt.concurrent(
    "exits 0 and writes the response to stdout on a successful prompt",
    ({ llm, opencode }) =>
      Effect.gen(function* () {
        yield* llm.text("hello from the test llm")
        const result = yield* opencode.run("say hi")
        opencode.expectExit(result, 0)
        expect(result.stdout).toContain("hello from the test llm")
      }),
    60_000,
  )

  @lgcode/@lgcode/ Regression for #27371: an unknown model used to hang the process forever
  @lgcode/@lgcode/ waiting on a session.status === idle event that never arrived. The fix
  @lgcode/@lgcode/ makes the SDK call surface an error promptly so the process exits nonzero.
  @lgcode/@lgcode/ We assert nonzero exit AND wall-clock under the harness timeout — a hang
  @lgcode/@lgcode/ would expire the timeout and produce a different (signal-killed) failure.
  cliIt.concurrent(
    "exits nonzero promptly when the model is unknown (regression for #27371)",
    ({ opencode }) =>
      Effect.gen(function* () {
        const result = yield* opencode.run("say hi", {
          model: "test@lgcode/nonexistent-model",
          timeoutMs: 15_000,
        })
        expect(result.exitCode).not.toBe(0)
        expect(result.durationMs).toBeLessThan(15_000)
      }),
    30_000,
  )

  @lgcode/@lgcode/ Locks in the current behavior: when the LLM stream errors mid-response
  @lgcode/@lgcode/ (the prompt was accepted, then the upstream provider failed), opencode
  @lgcode/@lgcode/ emits a session.error event and the process exits 0 today.
  @lgcode/@lgcode/
  @lgcode/@lgcode/ This is debatable — a future cleanup might flip it to exit 1. If you're
  @lgcode/@lgcode/ changing this expectation, do it deliberately and say so in the PR.
  cliIt.concurrent(
    "mid-stream LLM error still exits 0 today (contract lock-in)",
    ({ llm, opencode }) =>
      Effect.gen(function* () {
        yield* llm.fail("upstream provider exploded mid-stream")
        const result = yield* opencode.run("trigger midstream error", { timeoutMs: 30_000 })
        expect(result.exitCode).toBe(0)
      }),
    60_000,
  )

  @lgcode/@lgcode/ --format json puts one JSON object per line on stdout for each emitted
  @lgcode/@lgcode/ event. Consumers (CI scripts, tooling) parse this stream. Asserts the
  @lgcode/@lgcode/ shape so a future event-emit change has to update this expectation.
  cliIt.concurrent(
    "--format json emits parseable line-delimited JSON to stdout",
    ({ llm, opencode }) =>
      Effect.gen(function* () {
        yield* llm.text("structured output")
        const result = yield* opencode.run("say hi", { format: "json" })
        opencode.expectExit(result, 0)

        const events = opencode.parseJsonEvents(result.stdout)
        expect(events.length).toBeGreaterThan(0)
        for (const evt of events) {
          expect(typeof evt.type).toBe("string")
          expect(typeof evt.sessionID).toBe("string")
        }
        @lgcode/@lgcode/ At least one `text` event should appear with the LLM's response.
        const text = events.find((e) => e.type === "text")
        expect(text).toBeDefined()
      }),
    60_000,
  )
})
