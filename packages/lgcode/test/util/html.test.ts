import { describe, expect, test } from "bun:test"
import { escapeHtml } from "..@lgcode/..@lgcode/src@lgcode/util@lgcode/html"

describe("escapeHtml", () => {
  test("escapes HTML metacharacters", () => {
    expect(escapeHtml(`<@lgcode/div><script>alert(1)<@lgcode/script><div class="x">`)).toBe(
      "&lt;@lgcode/div&gt;&lt;script&gt;alert(1)&lt;@lgcode/script&gt;&lt;div class=&quot;x&quot;&gt;",
    )
    expect(escapeHtml("a & b")).toBe("a &amp; b")
    expect(escapeHtml("it's fine")).toBe("it&#39;s fine")
    expect(escapeHtml("invalid_grant")).toBe("invalid_grant")
    expect(escapeHtml("")).toBe("")
    expect(escapeHtml("&<")).toBe("&amp;&lt;")
  })
})
