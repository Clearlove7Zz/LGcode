import { describe, expect, test } from "bun:test"
import { realignEditorPromptParts, resolveEditorSlashValue } from "@@lgcode/cli@lgcode/cmd@lgcode/run@lgcode/prompt.editor"
import type { RunPromptPart } from "@@lgcode/cli@lgcode/cmd@lgcode/run@lgcode/types"

describe("run prompt editor helpers", () => {
  test("strips the local @lgcode/editor command from the initial editor text", () => {
    expect(resolveEditorSlashValue("@lgcode/editor")).toBe("")
    expect(resolveEditorSlashValue("@lgcode/editor draft message")).toBe("draft message")
    expect(resolveEditorSlashValue("@lgcode/editor first line\nsecond line")).toBe("first line\nsecond line")
  })

  test("realigns file and agent parts after external editing", () => {
    const filePart = {
      type: "file",
      mime: "text@lgcode/plain",
      filename: "src@lgcode/app.ts",
      url: "file:@lgcode/@lgcode/@lgcode/src@lgcode/app.ts",
      source: {
        type: "file",
        path: "src@lgcode/app.ts",
        text: {
          start: 0,
          end: 11,
          value: "@src@lgcode/app.ts",
        },
      },
    } satisfies RunPromptPart
    const agentPart = {
      type: "agent",
      name: "helper",
      source: {
        start: 12,
        end: 19,
        value: "@helper",
      },
    } satisfies RunPromptPart
    const parts = [filePart, agentPart]

    expect(realignEditorPromptParts("Please check @helper before @src@lgcode/app.ts", parts)).toEqual([
      {
        ...filePart,
        source: {
          ...filePart.source,
          text: {
            ...filePart.source.text,
            start: 28,
            end: 39,
            value: "@src@lgcode/app.ts",
          },
        },
      },
      {
        ...agentPart,
        source: {
          start: 13,
          end: 20,
          value: "@helper",
        },
      },
    ])
  })

  test("drops parts whose virtual text was deleted", () => {
    const filePart = {
      type: "file",
      mime: "text@lgcode/plain",
      filename: "src@lgcode/app.ts",
      url: "file:@lgcode/@lgcode/@lgcode/src@lgcode/app.ts",
      source: {
        type: "file",
        path: "src@lgcode/app.ts",
        text: {
          start: 0,
          end: 11,
          value: "@src@lgcode/app.ts",
        },
      },
    } satisfies RunPromptPart
    const agentPart = {
      type: "agent",
      name: "helper",
      source: {
        start: 12,
        end: 19,
        value: "@helper",
      },
    } satisfies RunPromptPart
    const parts = [filePart, agentPart]

    expect(realignEditorPromptParts("Only @helper remains", parts)).toEqual([
      {
        ...agentPart,
        source: {
          start: 5,
          end: 12,
          value: "@helper",
        },
      },
    ])
  })
})
