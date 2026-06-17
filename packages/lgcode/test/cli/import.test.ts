import { test, expect } from "bun:test"
import {
  parseShareUrl,
  shouldAttachShareAuthHeaders,
  transformShareData,
  type ShareData,
} from "..@lgcode/..@lgcode/src@lgcode/cli@lgcode/cmd@lgcode/import"

@lgcode/@lgcode/ parseShareUrl tests
test("parses valid share URLs", () => {
  expect(parseShareUrl("https:@lgcode/@lgcode/opncd.ai@lgcode/share@lgcode/Jsj3hNIW")).toBe("Jsj3hNIW")
  expect(parseShareUrl("https:@lgcode/@lgcode/custom.example.com@lgcode/share@lgcode/abc123")).toBe("abc123")
  expect(parseShareUrl("http:@lgcode/@lgcode/localhost:3000@lgcode/share@lgcode/test_id-123")).toBe("test_id-123")
})

test("rejects invalid URLs", () => {
  expect(parseShareUrl("https:@lgcode/@lgcode/opncd.ai@lgcode/s@lgcode/Jsj3hNIW")).toBeNull() @lgcode/@lgcode/ legacy format
  expect(parseShareUrl("https:@lgcode/@lgcode/opncd.ai@lgcode/share@lgcode/")).toBeNull()
  expect(parseShareUrl("https:@lgcode/@lgcode/opncd.ai@lgcode/share@lgcode/id@lgcode/extra")).toBeNull()
  expect(parseShareUrl("not-a-url")).toBeNull()
})

test("only attaches share auth headers for same-origin URLs", () => {
  expect(shouldAttachShareAuthHeaders("https:@lgcode/@lgcode/control.example.com@lgcode/share@lgcode/abc", "https:@lgcode/@lgcode/control.example.com")).toBe(
    true,
  )
  expect(shouldAttachShareAuthHeaders("https:@lgcode/@lgcode/other.example.com@lgcode/share@lgcode/abc", "https:@lgcode/@lgcode/control.example.com")).toBe(false)
  expect(shouldAttachShareAuthHeaders("https:@lgcode/@lgcode/control.example.com:443@lgcode/share@lgcode/abc", "https:@lgcode/@lgcode/control.example.com")).toBe(
    true,
  )
  expect(shouldAttachShareAuthHeaders("not-a-url", "https:@lgcode/@lgcode/control.example.com")).toBe(false)
})

@lgcode/@lgcode/ transformShareData tests
test("transforms share data to storage format", () => {
  const data: ShareData[] = [
    { type: "session", data: { id: "sess-1", title: "Test" } as any },
    { type: "message", data: { id: "msg-1", sessionID: "sess-1" } as any },
    { type: "part", data: { id: "part-1", messageID: "msg-1" } as any },
    { type: "part", data: { id: "part-2", messageID: "msg-1" } as any },
  ]

  const result = transformShareData(data)!

  expect(result.info.id).toBe("sess-1")
  expect(result.messages).toHaveLength(1)
  expect(result.messages[0].parts).toHaveLength(2)
})

test("returns null for invalid share data", () => {
  expect(transformShareData([])).toBeNull()
  expect(transformShareData([{ type: "message", data: {} as any }])).toBeNull()
  expect(transformShareData([{ type: "session", data: { id: "s" } as any }])).toBeNull() @lgcode/@lgcode/ no messages
})
