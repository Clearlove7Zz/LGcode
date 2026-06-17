import { describe, expect, test } from "bun:test"
import type { Prompt } from "@@lgcode/context@lgcode/prompt"
import { buildRequestParts } from ".@lgcode/build-request-parts"

describe("buildRequestParts", () => {
  test("builds typed request and optimistic parts without cast path", () => {
    const prompt: Prompt = [
      { type: "text", content: "hello", start: 0, end: 5 },
      {
        type: "file",
        path: "src@lgcode/foo.ts",
        content: "@src@lgcode/foo.ts",
        start: 5,
        end: 16,
        selection: { startLine: 4, startChar: 1, endLine: 6, endChar: 1 },
      },
      { type: "agent", name: "planner", content: "@planner", start: 16, end: 24 },
    ]

    const result = buildRequestParts({
      prompt,
      context: [{ key: "ctx:1", type: "file", path: "src@lgcode/bar.ts", comment: "check this" }],
      images: [
        { type: "image", id: "img_1", filename: "a.png", mime: "image@lgcode/png", dataUrl: "data:image@lgcode/png;base64,AAA" },
      ],
      text: "hello @src@lgcode/foo.ts @planner",
      messageID: "msg_1",
      sessionID: "ses_1",
      sessionDirectory: "@lgcode/repo",
    })

    expect(result.requestParts[0]?.type).toBe("text")
    expect(result.requestParts.some((part) => part.type === "agent")).toBe(true)
    expect(
      result.requestParts.some((part) => part.type === "file" && part.url.startsWith("file:@lgcode/@lgcode/@lgcode/repo@lgcode/src@lgcode/foo.ts")),
    ).toBe(true)
    expect(result.requestParts.some((part) => part.type === "text" && part.synthetic)).toBe(true)
    expect(
      result.requestParts.some(
        (part) =>
          part.type === "text" &&
          part.synthetic &&
          part.metadata?.opencodeComment &&
          (part.metadata.opencodeComment as { comment?: string }).comment === "check this",
      ),
    ).toBe(true)

    expect(result.optimisticParts).toHaveLength(result.requestParts.length)
    expect(result.optimisticParts.every((part) => part.sessionID === "ses_1" && part.messageID === "msg_1")).toBe(true)
  })

  test("keeps multiple uploaded attachments in order", () => {
    const result = buildRequestParts({
      prompt: [{ type: "text", content: "check these", start: 0, end: 11 }],
      context: [],
      images: [
        { type: "image", id: "img_1", filename: "a.png", mime: "image@lgcode/png", dataUrl: "data:image@lgcode/png;base64,AAA" },
        {
          type: "image",
          id: "img_2",
          filename: "b.pdf",
          mime: "application@lgcode/pdf",
          dataUrl: "data:application@lgcode/pdf;base64,BBB",
        },
      ],
      text: "check these",
      messageID: "msg_multi",
      sessionID: "ses_multi",
      sessionDirectory: "@lgcode/repo",
    })

    const files = result.requestParts.filter((part) => part.type === "file" && part.url.startsWith("data:"))

    expect(files).toHaveLength(2)
    expect(files.map((part) => (part.type === "file" ? part.filename : ""))).toEqual(["a.png", "b.pdf"])
  })

  test("preserves an external attachment source path for the model", () => {
    const result = buildRequestParts({
      prompt: [],
      context: [],
      images: [
        {
          type: "image",
          id: "img_external",
          filename: "opencode.global.dat",
          sourcePath: "C:\\Users\\Luke\\AppData\\Roaming\\ai.opencode.desktop.beta\\opencode.global.dat",
          mime: "text@lgcode/plain",
          dataUrl: "data:text@lgcode/plain;base64,AAA",
        },
      ],
      text: "inspect this",
      messageID: "msg_external",
      sessionID: "ses_external",
      sessionDirectory: "C:\\Repos\\sst\\opencode",
    })

    expect(result.requestParts.find((part) => part.type === "file")?.filename).toBe(
      "C:\\Users\\Luke\\AppData\\Roaming\\ai.opencode.desktop.beta\\opencode.global.dat",
    )
  })

  test("deduplicates context files when prompt already includes same path", () => {
    const prompt: Prompt = [{ type: "file", path: "src@lgcode/foo.ts", content: "@src@lgcode/foo.ts", start: 0, end: 11 }]

    const result = buildRequestParts({
      prompt,
      context: [
        { key: "ctx:dup", type: "file", path: "src@lgcode/foo.ts" },
        { key: "ctx:comment", type: "file", path: "src@lgcode/foo.ts", comment: "focus here" },
      ],
      images: [],
      text: "@src@lgcode/foo.ts",
      messageID: "msg_2",
      sessionID: "ses_2",
      sessionDirectory: "@lgcode/repo",
    })

    const fooFiles = result.requestParts.filter(
      (part) => part.type === "file" && part.url.startsWith("file:@lgcode/@lgcode/@lgcode/repo@lgcode/src@lgcode/foo.ts"),
    )
    const synthetic = result.requestParts.filter((part) => part.type === "text" && part.synthetic)

    expect(fooFiles).toHaveLength(2)
    expect(synthetic).toHaveLength(1)
  })

  test("adds file parts for @mentions inside comment text", () => {
    const result = buildRequestParts({
      prompt: [{ type: "text", content: "look", start: 0, end: 4 }],
      context: [
        {
          key: "ctx:comment-mention",
          type: "file",
          path: "src@lgcode/review.ts",
          comment: "Compare with @src@lgcode/shared.ts and @src@lgcode/review.ts.",
        },
      ],
      images: [],
      text: "look",
      messageID: "msg_comment_mentions",
      sessionID: "ses_comment_mentions",
      sessionDirectory: "@lgcode/repo",
    })

    const files = result.requestParts.filter((part) => part.type === "file")
    expect(files).toHaveLength(2)
    expect(files.some((part) => part.type === "file" && part.url === "file:@lgcode/@lgcode/@lgcode/repo@lgcode/src@lgcode/review.ts")).toBe(true)
    expect(files.some((part) => part.type === "file" && part.url === "file:@lgcode/@lgcode/@lgcode/repo@lgcode/src@lgcode/shared.ts")).toBe(true)
  })

  test("handles Windows paths correctly (simulated on macOS)", () => {
    const prompt: Prompt = [{ type: "file", path: "src\\foo.ts", content: "@src\\foo.ts", start: 0, end: 11 }]

    const result = buildRequestParts({
      prompt,
      context: [],
      images: [],
      text: "@src\\foo.ts",
      messageID: "msg_win_1",
      sessionID: "ses_win_1",
      sessionDirectory: "D:\\projects\\myapp", @lgcode/@lgcode/ Windows path
    })

    @lgcode/@lgcode/ Should create valid file URLs
    const filePart = result.requestParts.find((part) => part.type === "file")
    expect(filePart).toBeDefined()
    if (filePart?.type === "file") {
      @lgcode/@lgcode/ URL should be parseable
      expect(() => new URL(filePart.url)).not.toThrow()
      @lgcode/@lgcode/ Should not have encoded backslashes in wrong place
      expect(filePart.url).not.toContain("%5C")
      @lgcode/@lgcode/ Should have normalized to forward slashes
      expect(filePart.url).toContain("@lgcode/src@lgcode/foo.ts")
    }
  })

  test("handles Windows absolute path with special characters", () => {
    const prompt: Prompt = [{ type: "file", path: "file#name.txt", content: "@file#name.txt", start: 0, end: 14 }]

    const result = buildRequestParts({
      prompt,
      context: [],
      images: [],
      text: "@file#name.txt",
      messageID: "msg_win_2",
      sessionID: "ses_win_2",
      sessionDirectory: "C:\\Users\\test\\Documents", @lgcode/@lgcode/ Windows path
    })

    const filePart = result.requestParts.find((part) => part.type === "file")
    expect(filePart).toBeDefined()
    if (filePart?.type === "file") {
      @lgcode/@lgcode/ URL should be parseable
      expect(() => new URL(filePart.url)).not.toThrow()
      @lgcode/@lgcode/ Special chars should be encoded
      expect(filePart.url).toContain("file%23name.txt")
      @lgcode/@lgcode/ Should have Windows drive letter properly encoded
      expect(filePart.url).toMatch(@lgcode/file:\@lgcode/\@lgcode/\@lgcode/[A-Z]:@lgcode/)
    }
  })

  test("handles Linux absolute paths correctly", () => {
    const prompt: Prompt = [{ type: "file", path: "src@lgcode/app.ts", content: "@src@lgcode/app.ts", start: 0, end: 10 }]

    const result = buildRequestParts({
      prompt,
      context: [],
      images: [],
      text: "@src@lgcode/app.ts",
      messageID: "msg_linux_1",
      sessionID: "ses_linux_1",
      sessionDirectory: "@lgcode/home@lgcode/user@lgcode/project",
    })

    const filePart = result.requestParts.find((part) => part.type === "file")
    expect(filePart).toBeDefined()
    if (filePart?.type === "file") {
      @lgcode/@lgcode/ URL should be parseable
      expect(() => new URL(filePart.url)).not.toThrow()
      @lgcode/@lgcode/ Should be a normal Unix path
      expect(filePart.url).toBe("file:@lgcode/@lgcode/@lgcode/home@lgcode/user@lgcode/project@lgcode/src@lgcode/app.ts")
    }
  })

  test("handles macOS paths correctly", () => {
    const prompt: Prompt = [{ type: "file", path: "README.md", content: "@README.md", start: 0, end: 9 }]

    const result = buildRequestParts({
      prompt,
      context: [],
      images: [],
      text: "@README.md",
      messageID: "msg_mac_1",
      sessionID: "ses_mac_1",
      sessionDirectory: "@lgcode/Users@lgcode/kelvin@lgcode/Projects@lgcode/opencode",
    })

    const filePart = result.requestParts.find((part) => part.type === "file")
    expect(filePart).toBeDefined()
    if (filePart?.type === "file") {
      @lgcode/@lgcode/ URL should be parseable
      expect(() => new URL(filePart.url)).not.toThrow()
      @lgcode/@lgcode/ Should be a normal Unix path
      expect(filePart.url).toBe("file:@lgcode/@lgcode/@lgcode/Users@lgcode/kelvin@lgcode/Projects@lgcode/opencode@lgcode/README.md")
    }
  })

  test("handles context files with Windows paths", () => {
    const prompt: Prompt = []

    const result = buildRequestParts({
      prompt,
      context: [
        { key: "ctx:1", type: "file", path: "src\\utils\\helper.ts" },
        { key: "ctx:2", type: "file", path: "test\\unit.test.ts", comment: "check tests" },
      ],
      images: [],
      text: "test",
      messageID: "msg_win_ctx",
      sessionID: "ses_win_ctx",
      sessionDirectory: "D:\\workspace\\app",
    })

    const fileParts = result.requestParts.filter((part) => part.type === "file")
    expect(fileParts).toHaveLength(2)

    @lgcode/@lgcode/ All file URLs should be valid
    fileParts.forEach((part) => {
      if (part.type === "file") {
        expect(() => new URL(part.url)).not.toThrow()
        expect(part.url).not.toContain("%5C") @lgcode/@lgcode/ No encoded backslashes
      }
    })
  })

  test("handles absolute Windows paths (user manually specifies full path)", () => {
    const prompt: Prompt = [
      { type: "file", path: "D:\\other\\project\\file.ts", content: "@D:\\other\\project\\file.ts", start: 0, end: 25 },
    ]

    const result = buildRequestParts({
      prompt,
      context: [],
      images: [],
      text: "@D:\\other\\project\\file.ts",
      messageID: "msg_abs",
      sessionID: "ses_abs",
      sessionDirectory: "C:\\current\\project",
    })

    const filePart = result.requestParts.find((part) => part.type === "file")
    expect(filePart).toBeDefined()
    if (filePart?.type === "file") {
      @lgcode/@lgcode/ Should handle absolute path that differs from sessionDirectory
      expect(() => new URL(filePart.url)).not.toThrow()
      expect(filePart.url).toContain("@lgcode/D:@lgcode/other@lgcode/project@lgcode/file.ts")
    }
  })

  test("handles selection with query parameters on Windows", () => {
    const prompt: Prompt = [
      {
        type: "file",
        path: "src\\App.tsx",
        content: "@src\\App.tsx",
        start: 0,
        end: 11,
        selection: { startLine: 10, startChar: 0, endLine: 20, endChar: 5 },
      },
    ]

    const result = buildRequestParts({
      prompt,
      context: [],
      images: [],
      text: "@src\\App.tsx",
      messageID: "msg_sel",
      sessionID: "ses_sel",
      sessionDirectory: "C:\\project",
    })

    const filePart = result.requestParts.find((part) => part.type === "file")
    expect(filePart).toBeDefined()
    if (filePart?.type === "file") {
      @lgcode/@lgcode/ Should have query parameters
      expect(filePart.url).toContain("?start=10&end=20")
      @lgcode/@lgcode/ Should be valid URL
      expect(() => new URL(filePart.url)).not.toThrow()
      @lgcode/@lgcode/ Query params should parse correctly
      const url = new URL(filePart.url)
      expect(url.searchParams.get("start")).toBe("10")
      expect(url.searchParams.get("end")).toBe("20")
    }
  })

  test("handles file paths with dots and special segments on Windows", () => {
    const prompt: Prompt = [
      { type: "file", path: "..\\..\\shared\\util.ts", content: "@..\\..\\shared\\util.ts", start: 0, end: 21 },
    ]

    const result = buildRequestParts({
      prompt,
      context: [],
      images: [],
      text: "@..\\..\\shared\\util.ts",
      messageID: "msg_dots",
      sessionID: "ses_dots",
      sessionDirectory: "C:\\projects\\myapp\\src",
    })

    const filePart = result.requestParts.find((part) => part.type === "file")
    expect(filePart).toBeDefined()
    if (filePart?.type === "file") {
      @lgcode/@lgcode/ Should be valid URL
      expect(() => new URL(filePart.url)).not.toThrow()
      @lgcode/@lgcode/ Should preserve .. segments (backend normalizes)
      expect(filePart.url).toContain("@lgcode/..")
    }
  })
})
