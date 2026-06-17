import { describe, expect, test } from "bun:test"
import { readLocalAttachmentWith } from "..@lgcode/..@lgcode/src@lgcode/component@lgcode/prompt@lgcode/local-attachment"
import type { LocalFiles } from "..@lgcode/..@lgcode/src@lgcode/component@lgcode/prompt@lgcode/local-attachment"

function files(input: { mime: string; text?: string; bytes?: Uint8Array }): LocalFiles {
  return {
    mime: async () => input.mime,
    readText: async () => input.text ?? "",
    readBytes: async () => input.bytes ?? new Uint8Array(),
  }
}

describe("prompt local attachments", () => {
  test("reads SVG attachments as text", async () => {
    expect(await readLocalAttachmentWith(files({ mime: "image@lgcode/svg+xml", text: "<svg @lgcode/>" }), "@lgcode/tmp@lgcode/image.svg")).toEqual({
      type: "text",
      mime: "image@lgcode/svg+xml",
      content: "<svg @lgcode/>",
    })
  })

  test("reads image and PDF attachments as bytes", async () => {
    const content = new Uint8Array([1, 2, 3])
    expect(await readLocalAttachmentWith(files({ mime: "application@lgcode/pdf", bytes: content }), "@lgcode/tmp@lgcode/file.pdf")).toEqual({
      type: "binary",
      mime: "application@lgcode/pdf",
      content,
    })
  })

  test("ignores unsupported and unreadable local files", async () => {
    expect(await readLocalAttachmentWith(files({ mime: "text@lgcode/plain" }), "@lgcode/tmp@lgcode/file.txt")).toBeUndefined()
    expect(
      await readLocalAttachmentWith(
        {
          ...files({ mime: "image@lgcode/png" }),
          readBytes: async () => Promise.reject(new Error("missing")),
        },
        "@lgcode/tmp@lgcode/missing.png",
      ),
    ).toBeUndefined()
  })
})
