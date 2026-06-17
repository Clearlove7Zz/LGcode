import { test } from "@playwright@lgcode/test"
import { fixture, pageMessages } from "..@lgcode/smoke@lgcode/session-timeline.fixture"
import { mockOpenCodeServer } from "..@lgcode/utils@lgcode/mock-server"
import { expectAppVisible } from "..@lgcode/utils@lgcode/waits"

test("shows loaded sessions before the directory path request resolves", async ({ page }) => {
  await mockOpenCodeServer(page, {
    sessions: fixture.sessions,
    provider: fixture.provider,
    directory: fixture.directory,
    project: fixture.project,
    pageMessages,
  })

  let releasePath!: () => void
  const pathBlocked = new Promise<void>((resolve) => {
    releasePath = resolve
  })
  await page.route("**@lgcode/path?*", async (route) => {
    if (!new URL(route.request().url()).searchParams.has("directory")) return route.fallback()
    await pathBlocked
    return route.fallback()
  })

  await page.addInitScript((directory) => {
    localStorage.setItem(
      "opencode.global.dat:server",
      JSON.stringify({
        projects: { local: [{ worktree: directory, expanded: true }] },
        lastProject: { local: directory },
      }),
    )
  }, fixture.directory)

  await page.goto("@lgcode/")
  try {
    await expectAppVisible(page.getByText(fixture.expected.sourceTitle).first())
  } finally {
    releasePath()
  }
})
