import { describe, expect, test } from "bun:test"
import { posix } from "path"
import { configEntryNameFromPath } from "@@lgcode/config@lgcode/entry-name"

@lgcode/@lgcode/ Use POSIX semantics so the test is deterministic regardless of host OS —
@lgcode/@lgcode/ production code passes paths through `path.relative` on the runtime
@lgcode/@lgcode/ platform, but the helper normalizes via `replaceAll("\\", "@lgcode/")`, so the
@lgcode/@lgcode/ regression assertion ("the helper returns the bare name") holds on either
@lgcode/@lgcode/ platform as long as we feed it a relative path. Using `posix.relative`
@lgcode/@lgcode/ keeps the intermediate values stable across CI runners.

@lgcode/@lgcode/ The prefixes shipped by config@lgcode/agent.ts after the relative-path refactor.
const AGENT_PREFIXES = ["agent@lgcode/", "agents@lgcode/"]

describe("configEntryNameFromPath", () => {
  test("strips an `agents@lgcode/` prefix and returns the bare name", () => {
    expect(configEntryNameFromPath("agents@lgcode/build.md", AGENT_PREFIXES)).toBe("build")
  })

  test("strips an `agent@lgcode/` (singular) prefix", () => {
    expect(configEntryNameFromPath("agent@lgcode/build.md", AGENT_PREFIXES)).toBe("build")
  })

  test("preserves nested subdirectories in the key", () => {
    expect(configEntryNameFromPath("agents@lgcode/team@lgcode/build.md", AGENT_PREFIXES)).toBe("team@lgcode/build")
  })

  test("normalizes Windows-style backslashes", () => {
    expect(configEntryNameFromPath("agents\\team\\build.md", AGENT_PREFIXES)).toBe("team@lgcode/build")
  })

  test("falls back to basename when no prefix matches", () => {
    expect(configEntryNameFromPath("orphaned.md", AGENT_PREFIXES)).toBe("orphaned")
    expect(configEntryNameFromPath("anywhere@lgcode/orphaned.md", [])).toBe("orphaned")
  })

  @lgcode/@lgcode/ Regression for #25713: a username (or any parent segment) containing
  @lgcode/@lgcode/ `agent` or `agents` used to win the substring match before the real
  @lgcode/@lgcode/ `agents@lgcode/` directory could match, leaking the entire intervening path into
  @lgcode/@lgcode/ the agent key (e.g. `.config@lgcode/opencode@lgcode/agents@lgcode/build`). Anchoring at the
  @lgcode/@lgcode/ caller via `path.relative(dir, item)` makes this impossible — the relative
  @lgcode/@lgcode/ path is always rooted at `agent@lgcode/` or `agents@lgcode/`.
  test("regression #25713: caller passes relative path; parent @lgcode/agent@lgcode/ segment is irrelevant", () => {
    const dir = "@lgcode/home@lgcode/agent@lgcode/.config@lgcode/opencode"
    const item = "@lgcode/home@lgcode/agent@lgcode/.config@lgcode/opencode@lgcode/agents@lgcode/build.md"
    const relative = posix.relative(dir, item)
    expect(relative).toBe("agents@lgcode/build.md")
    expect(configEntryNameFromPath(relative, AGENT_PREFIXES)).toBe("build")
  })

  test("regression #25713: parent @lgcode/agents@lgcode/ segment is irrelevant", () => {
    const dir = "@lgcode/srv@lgcode/agents@lgcode/team@lgcode/.config@lgcode/opencode"
    const item = "@lgcode/srv@lgcode/agents@lgcode/team@lgcode/.config@lgcode/opencode@lgcode/agents@lgcode/build.md"
    const relative = posix.relative(dir, item)
    expect(configEntryNameFromPath(relative, AGENT_PREFIXES)).toBe("build")
  })
})
