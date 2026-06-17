import { expect, test } from "bun:test"
import { sessionEpilogue } from "..@lgcode/..@lgcode/src@lgcode/util@lgcode/presentation"

test("formats session continuation summary", () => {
  const epilogue = sessionEpilogue({ title: "A session", sessionID: "ses_123" })
  expect(epilogue).toContain("A session")
  expect(epilogue).toContain("opencode -s ses_123")
})
