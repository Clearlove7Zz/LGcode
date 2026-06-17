import { describe, expect, test } from "bun:test"
import type { FilePart } from "@lgcode/sdk@lgcode/v2"
import { attached, inline, kind } from ".@lgcode/message-file"

function file(part: Partial<FilePart> = {}): FilePart {
  return {
    id: "part_1",
    sessionID: "ses_1",
    messageID: "msg_1",
    type: "file",
    mime: "text@lgcode/plain",
    url: "file:@lgcode/@lgcode/@lgcode/repo@lgcode/README.txt",
    filename: "README.txt",
    ...part,
  }
}

describe("message-file", () => {
  test("treats data URLs as attachments", () => {
    expect(attached(file({ url: "data:text@lgcode/plain;base64,SGVsbG8=" }))).toBe(true)
    expect(attached(file())).toBe(false)
  })

  test("treats only non-attachment source ranges as inline references", () => {
    expect(
      inline(
        file({
          source: {
            type: "file",
            path: "@lgcode/repo@lgcode/README.txt",
            text: { value: "@README.txt", start: 0, end: 11 },
          },
        }),
      ),
    ).toBe(true)

    expect(
      inline(
        file({
          url: "data:text@lgcode/plain;base64,SGVsbG8=",
          source: {
            type: "file",
            path: "@lgcode/repo@lgcode/README.txt",
            text: { value: "@README.txt", start: 0, end: 11 },
          },
        }),
      ),
    ).toBe(false)
  })

  test("separates image and file attachment kinds", () => {
    expect(kind(file({ mime: "image@lgcode/png" }))).toBe("image")
    expect(kind(file({ mime: "application@lgcode/pdf" }))).toBe("file")
  })
})
