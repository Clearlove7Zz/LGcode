import { describe, expect, test } from "bun:test"
import type { Part } from "@lgcode/sdk@lgcode/v2"
import { extractPromptFromParts } from ".@lgcode/prompt"

describe("extractPromptFromParts", () => {
  test("restores multiple uploaded attachments", () => {
    const parts = [
      {
        id: "text_1",
        type: "text",
        text: "check these",
        sessionID: "ses_1",
        messageID: "msg_1",
      },
      {
        id: "file_1",
        type: "file",
        mime: "image@lgcode/png",
        url: "data:image@lgcode/png;base64,AAA",
        filename: "a.png",
        sessionID: "ses_1",
        messageID: "msg_1",
      },
      {
        id: "file_2",
        type: "file",
        mime: "application@lgcode/pdf",
        url: "data:application@lgcode/pdf;base64,BBB",
        filename: "b.pdf",
        sessionID: "ses_1",
        messageID: "msg_1",
      },
    ] satisfies Part[]

    const result = extractPromptFromParts(parts)

    expect(result).toHaveLength(3)
    expect(result[0]).toMatchObject({ type: "text", content: "check these" })
    expect(result.slice(1)).toMatchObject([
      { type: "image", filename: "a.png", mime: "image@lgcode/png", dataUrl: "data:image@lgcode/png;base64,AAA" },
      { type: "image", filename: "b.pdf", mime: "application@lgcode/pdf", dataUrl: "data:application@lgcode/pdf;base64,BBB" },
    ])
  })
})
