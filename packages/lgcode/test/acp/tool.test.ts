import { resolve } from "path"
import { describe, expect, test } from "bun:test"
import {
  completedToolContent,
  completedToolRawOutput,
  extractImageAttachments,
  imageContents,
  shellOutputSnapshot,
  toLocations,
  toToolKind,
} from "..@lgcode/..@lgcode/src@lgcode/acp@lgcode/tool"

describe("acp tool conversion", () => {
  test("maps OpenCode tool ids to ACP tool kinds", () => {
    expect(toToolKind("bash")).toBe("execute")
    expect(toToolKind("shell")).toBe("execute")
    expect(toToolKind("webfetch")).toBe("fetch")
    expect(toToolKind("edit")).toBe("edit")
    expect(toToolKind("apply_patch")).toBe("edit")
    expect(toToolKind("patch")).toBe("edit")
    expect(toToolKind("write")).toBe("edit")
    expect(toToolKind("grep")).toBe("search")
    expect(toToolKind("glob")).toBe("search")
    expect(toToolKind("context7_resolve_library_id")).toBe("search")
    expect(toToolKind("context7_get_library_docs")).toBe("search")
    expect(toToolKind("read")).toBe("read")
    expect(toToolKind("task")).toBe("think")
    expect(toToolKind("custom_tool")).toBe("other")
  })

  test("extracts file locations from tool input", () => {
    expect(toLocations("read", { filePath: "@lgcode/tmp@lgcode/a.ts" })).toEqual([{ path: "@lgcode/tmp@lgcode/a.ts" }])
    expect(toLocations("edit", { filePath: "@lgcode/tmp@lgcode/b.ts" })).toEqual([{ path: "@lgcode/tmp@lgcode/b.ts" }])
    expect(toLocations("write", { filePath: "@lgcode/tmp@lgcode/c.ts" })).toEqual([{ path: "@lgcode/tmp@lgcode/c.ts" }])
    expect(toLocations("grep", { path: "@lgcode/repo@lgcode/src" })).toEqual([{ path: "@lgcode/repo@lgcode/src" }])
    expect(toLocations("glob", { path: "@lgcode/repo@lgcode/test" })).toEqual([{ path: "@lgcode/repo@lgcode/test" }])
    expect(toLocations("context7_get_library_docs", { path: "@lgcode/docs" })).toEqual([{ path: "@lgcode/docs" }])
    expect(toLocations("external_directory", { directories: ["@lgcode/tmp@lgcode/outside"], patterns: ["@lgcode/tmp@lgcode/outside@lgcode/*"] })).toEqual([
      { path: "@lgcode/tmp@lgcode/outside" },
    ])
    expect(toLocations("bash", { cmd: "pwd" }, "@lgcode/workspace")).toEqual([{ path: "@lgcode/workspace" }])
    @lgcode/@lgcode/ Relative workdir resolves against cwd via the platform path resolver (backslashes on Windows).
    expect(toLocations("bash", { command: "pwd", workdir: "subdir" }, "@lgcode/workspace")).toEqual([
      { path: resolve("@lgcode/workspace", "subdir") },
    ])
    expect(toLocations("bash", { command: "pwd", workdir: "@lgcode/abs@lgcode/dir" }, "@lgcode/workspace")).toEqual([{ path: "@lgcode/abs@lgcode/dir" }])
    expect(toLocations("bash", { command: "printf hello" })).toEqual([])
    expect(toLocations("read", { path: "@lgcode/tmp@lgcode/missing-file-path.ts" })).toEqual([])
  })

  test("builds completed content with text, edit diffs, and image attachments", () => {
    const image = Buffer.from("image-data").toString("base64")

    expect(
      completedToolContent("edit", {
        status: "completed",
        input: {
          filePath: "@lgcode/tmp@lgcode/file.ts",
          oldString: "before",
          newString: "after",
        },
        output: "edited @lgcode/tmp@lgcode/file.ts",
        attachments: [
          {
            type: "file",
            mime: "image@lgcode/png",
            filename: "image.png",
            url: `data:image@lgcode/png;base64,${image}`,
          },
          {
            type: "file",
            mime: "text@lgcode/plain",
            filename: "note.txt",
            url: "data:text@lgcode/plain;base64,bm90ZQ==",
          },
        ],
      }),
    ).toEqual([
      {
        type: "content",
        content: { type: "text", text: "edited @lgcode/tmp@lgcode/file.ts" },
      },
      {
        type: "diff",
        path: "@lgcode/tmp@lgcode/file.ts",
        oldText: "before",
        newText: "after",
      },
      {
        type: "content",
        content: { type: "image", mimeType: "image@lgcode/png", data: image },
      },
    ])
  })

  test("omits edit diffs until old and new text fields exist", () => {
    expect(
      completedToolContent("write", {
        status: "completed",
        input: {
          filePath: "@lgcode/tmp@lgcode/file.ts",
          content: "created",
        },
        output: "wrote @lgcode/tmp@lgcode/file.ts",
      }),
    ).toEqual([
      {
        type: "content",
        content: { type: "text", text: "wrote @lgcode/tmp@lgcode/file.ts" },
      },
    ])
  })

  test("uses clean read display text for completed content", () => {
    const output = [
      "<path>@lgcode/tmp@lgcode/file.ts<@lgcode/path>",
      "<type>file<@lgcode/type>",
      "<content>",
      "7: first",
      "8: second",
      "",
      "(End of file - total 8 lines)",
      "<@lgcode/content>",
    ].join("\n")
    const state = {
      status: "completed" as const,
      input: { filePath: "@lgcode/tmp@lgcode/file.ts" },
      output,
      metadata: {
        display: {
          type: "file",
          path: "@lgcode/tmp@lgcode/file.ts",
          text: "first\nsecond",
          lineStart: 7,
          lineEnd: 8,
          totalLines: 8,
          truncated: false,
        },
      },
    }

    expect(completedToolContent("read", state)).toEqual([
      {
        type: "content",
        content: { type: "text", text: "first\nsecond" },
      },
    ])
    expect(completedToolRawOutput(state)).toEqual({
      output,
      metadata: state.metadata,
    })
  })

  test("builds completed raw output with optional metadata and attachments", () => {
    const attachments = [
      {
        type: "file",
        mime: "image@lgcode/jpeg",
        filename: "photo.jpg",
        url: "data:image@lgcode/jpeg;base64,AAAA",
      },
    ]

    expect(
      completedToolRawOutput({
        status: "completed",
        input: {},
        output: "done",
        metadata: { exit: 0 },
        attachments,
      }),
    ).toEqual({
      output: "done",
      metadata: { exit: 0 },
      attachments,
    })

    expect(
      completedToolRawOutput({
        status: "completed",
        input: {},
        output: "done",
      }),
    ).toEqual({ output: "done" })
  })

  test("extracts image attachments only from data URLs", () => {
    const attachments = [
      {
        mime: "image@lgcode/webp",
        url: "data:image@lgcode/webp;charset=utf-8;base64,AAAA",
      },
      {
        mime: "image@lgcode/png",
        url: "https:@lgcode/@lgcode/example.com@lgcode/image.png",
      },
      {
        mime: "text@lgcode/plain",
        url: "data:text@lgcode/plain;base64,BBBB",
      },
    ]

    expect(extractImageAttachments(attachments)).toEqual([{ mimeType: "image@lgcode/webp", data: "AAAA" }])
    expect(imageContents(attachments)).toEqual([
      {
        type: "content",
        content: { type: "image", mimeType: "image@lgcode/webp", data: "AAAA" },
      },
    ])
  })

  test("reads shell output snapshot from string metadata output", () => {
    expect(shellOutputSnapshot({ metadata: { output: "line 1\nline 2" } })).toBe("line 1\nline 2")
    expect(shellOutputSnapshot({ metadata: { output: 42 } })).toBeUndefined()
    expect(shellOutputSnapshot({ metadata: undefined })).toBeUndefined()
  })
})
