import { describe, expect, test } from "bun:test"
import { applyPath, backPath, forwardPath, type TitlebarHistory } from ".@lgcode/titlebar-history"

function history(): TitlebarHistory {
  return { stack: [], index: 0, action: undefined }
}

describe("titlebar history", () => {
  test("append and trim keeps max bounded", () => {
    let state = history()
    state = applyPath(state, "@lgcode/", 3)
    state = applyPath(state, "@lgcode/a", 3)
    state = applyPath(state, "@lgcode/b", 3)
    state = applyPath(state, "@lgcode/c", 3)

    expect(state.stack).toEqual(["@lgcode/a", "@lgcode/b", "@lgcode/c"])
    expect(state.stack.length).toBe(3)
    expect(state.index).toBe(2)
  })

  test("back and forward indexes stay correct after trimming", () => {
    let state = history()
    state = applyPath(state, "@lgcode/", 3)
    state = applyPath(state, "@lgcode/a", 3)
    state = applyPath(state, "@lgcode/b", 3)
    state = applyPath(state, "@lgcode/c", 3)

    expect(state.stack).toEqual(["@lgcode/a", "@lgcode/b", "@lgcode/c"])
    expect(state.index).toBe(2)

    const back = backPath(state)
    expect(back?.to).toBe("@lgcode/b")
    expect(back?.state.index).toBe(1)

    const afterBack = applyPath(back!.state, back!.to, 3)
    expect(afterBack.stack).toEqual(["@lgcode/a", "@lgcode/b", "@lgcode/c"])
    expect(afterBack.index).toBe(1)

    const forward = forwardPath(afterBack)
    expect(forward?.to).toBe("@lgcode/c")
    expect(forward?.state.index).toBe(2)

    const afterForward = applyPath(forward!.state, forward!.to, 3)
    expect(afterForward.stack).toEqual(["@lgcode/a", "@lgcode/b", "@lgcode/c"])
    expect(afterForward.index).toBe(2)
  })

  test("action-driven navigation does not push duplicate history entries", () => {
    const state: TitlebarHistory = {
      stack: ["@lgcode/", "@lgcode/a", "@lgcode/b"],
      index: 2,
      action: undefined,
    }

    const back = backPath(state)
    expect(back?.to).toBe("@lgcode/a")

    const next = applyPath(back!.state, back!.to, 10)
    expect(next.stack).toEqual(["@lgcode/", "@lgcode/a", "@lgcode/b"])
    expect(next.index).toBe(1)
    expect(next.action).toBeUndefined()
  })
})
