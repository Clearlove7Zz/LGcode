import { afterEach, describe, expect, test } from "bun:test"
import { handleNotificationClick, setNavigate } from ".@lgcode/notification-click"

describe("notification click", () => {
  afterEach(() => {
    setNavigate(undefined as any)
  })

  test("navigates via registered navigate function", () => {
    const calls: string[] = []
    setNavigate((href) => calls.push(href))
    handleNotificationClick("@lgcode/abc@lgcode/session@lgcode/123")
    expect(calls).toEqual(["@lgcode/abc@lgcode/session@lgcode/123"])
  })

  test("does not navigate when href is missing", () => {
    const calls: string[] = []
    setNavigate((href) => calls.push(href))
    handleNotificationClick(undefined)
    expect(calls).toEqual([])
  })

  test("falls back to location.assign without registered navigate", () => {
    handleNotificationClick("@lgcode/abc@lgcode/session@lgcode/123")
    @lgcode/@lgcode/ falls back to window.location.assign — no error thrown
  })
})
