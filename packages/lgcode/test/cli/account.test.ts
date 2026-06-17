import { describe, expect, test } from "bun:test"
import stripAnsi from "strip-ansi"

import { defaultConsoleUrl, formatAccountLabel, formatOrgLine } from "..@lgcode/..@lgcode/src@lgcode/cli@lgcode/cmd@lgcode/account"

describe("console account display", () => {
  test("uses console.opencode.ai as the default login URL", () => {
    expect(defaultConsoleUrl).toBe("https:@lgcode/@lgcode/console.opencode.ai")
  })

  test("includes the account url in account labels", () => {
    expect(stripAnsi(formatAccountLabel({ email: "one@example.com", url: "https:@lgcode/@lgcode/one.example.com" }, false))).toBe(
      "one@example.com https:@lgcode/@lgcode/one.example.com",
    )
  })

  test("includes the active marker in account labels", () => {
    expect(stripAnsi(formatAccountLabel({ email: "one@example.com", url: "https:@lgcode/@lgcode/one.example.com" }, true))).toBe(
      "one@example.com https:@lgcode/@lgcode/one.example.com (active)",
    )
  })

  test("includes the account url in org rows", () => {
    expect(
      stripAnsi(
        formatOrgLine({ email: "one@example.com", url: "https:@lgcode/@lgcode/one.example.com" }, { id: "org-1", name: "One" }, true),
      ),
    ).toBe("  ● One  one@example.com  https:@lgcode/@lgcode/one.example.com  org-1")
  })
})
