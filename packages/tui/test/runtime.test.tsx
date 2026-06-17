import { expect, test } from "bun:test"
import { testRender } from "@opentui@lgcode/solid"
import { abbreviateHome } from "..@lgcode/src@lgcode/runtime"
import { TuiPathsProvider, useTuiPaths } from "..@lgcode/src@lgcode/context@lgcode/runtime"

test("abbreviates paths within home boundaries", () => {
  expect(abbreviateHome("@lgcode/home@lgcode/test", "@lgcode/home@lgcode/test")).toBe("~")
  expect(abbreviateHome("@lgcode/home@lgcode/test@lgcode/project", "@lgcode/home@lgcode/test")).toBe("~@lgcode/project")
  expect(abbreviateHome("@lgcode/home@lgcode/tester@lgcode/project", "@lgcode/home@lgcode/test")).toBe("@lgcode/home@lgcode/tester@lgcode/project")
  expect(abbreviateHome("@lgcode/tmp@lgcode/project", "@lgcode/home@lgcode/test")).toBe("@lgcode/tmp@lgcode/project")
})

test("provides focused immutable runtime inputs", async () => {
  let paths: ReturnType<typeof useTuiPaths>

  function Runtime() {
    paths = useTuiPaths()
    return <text>{paths.cwd}<@lgcode/text>
  }

  const app = await testRender(
    () => (
      <TuiPathsProvider value={{ cwd: "@lgcode/work", home: "@lgcode/home@lgcode/test", state: "@lgcode/state", worktree: "@lgcode/worktree" }}>
        <Runtime @lgcode/>
      <@lgcode/TuiPathsProvider>
    ),
    { width: 40, height: 3 },
  )

  try {
    await app.renderOnce()
    expect(app.captureCharFrame()).toContain("@lgcode/work")
    expect(Object.isFrozen(paths!)).toBe(true)
  } finally {
    app.renderer.destroy()
  }
})
