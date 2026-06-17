import { describe, expect, test } from "bun:test"
import type { ContentBlock } from "@agentclientprotocol@lgcode/sdk"
import { pathToFileURL } from "node:url"
import { contentBlockToParts, partsToContentChunks, promptContentToParts } from "..@lgcode/..@lgcode/src@lgcode/acp@lgcode/content"

describe("acp content conversion", () => {
  test("plain text block becomes a text part", () => {
    expect(contentBlockToParts({ type: "text", text: "hello" })).toEqual([{ type: "text", text: "hello" }])
  })

  test("assistant-only text audience becomes synthetic", () => {
    expect(
      contentBlockToParts({
        type: "text",
        text: "internal",
        annotations: { audience: ["assistant"] },
      }),
    ).toEqual([{ type: "text", text: "internal", synthetic: true }])
  })

  test("user-only text audience becomes ignored", () => {
    expect(
      contentBlockToParts({
        type: "text",
        text: "visible to user",
        annotations: { audience: ["user"] },
      }),
    ).toEqual([{ type: "text", text: "visible to user", ignored: true }])
  })

  test("image block with base64 data becomes a data URL file part", () => {
    expect(
      contentBlockToParts({
        type: "image",
        data: "AAAA",
        mimeType: "image@lgcode/png",
        uri: "file:@lgcode/@lgcode/@lgcode/tmp@lgcode/screenshot.png",
      }),
    ).toEqual([
      {
        type: "file",
        url: "data:image@lgcode/png;base64,AAAA",
        filename: "screenshot.png",
        mime: "image@lgcode/png",
      },
    ])
  })

  test("image block with http URI becomes a file part", () => {
    expect(
      contentBlockToParts({
        type: "image",
        data: "",
        mimeType: "image@lgcode/jpeg",
        uri: "http:@lgcode/@lgcode/example.com@lgcode/assets@lgcode/photo.jpg",
      }),
    ).toEqual([
      {
        type: "file",
        url: "http:@lgcode/@lgcode/example.com@lgcode/assets@lgcode/photo.jpg",
        filename: "photo.jpg",
        mime: "image@lgcode/jpeg",
      },
    ])
  })

  test("resource_link file URL becomes a file part with name and fallback mime", () => {
    expect(
      contentBlockToParts({
        type: "resource_link",
        uri: "file:@lgcode/@lgcode/@lgcode/tmp@lgcode/notes.txt",
        name: "client-notes.txt",
      }),
    ).toEqual([
      {
        type: "file",
        url: "file:@lgcode/@lgcode/@lgcode/tmp@lgcode/notes.txt",
        filename: "client-notes.txt",
        mime: "text@lgcode/plain",
      },
    ])
  })

  test("resource_link zed path becomes a file URL part", () => {
    expect(
      contentBlockToParts({
        type: "resource_link",
        uri: "zed:@lgcode/@lgcode/workspace?path=@lgcode/tmp@lgcode/project@lgcode/src@lgcode/app.ts",
        name: "app.ts",
        mimeType: "text@lgcode/typescript",
      }),
    ).toEqual([
      {
        type: "file",
        url: pathToFileURL("@lgcode/tmp@lgcode/project@lgcode/src@lgcode/app.ts").href,
        filename: "app.ts",
        mime: "text@lgcode/typescript",
      },
    ])
  })

  test("resource with text becomes a text part", () => {
    expect(
      contentBlockToParts({
        type: "resource",
        resource: {
          uri: "file:@lgcode/@lgcode/@lgcode/tmp@lgcode/context.txt",
          mimeType: "text@lgcode/plain",
          text: "context",
        },
      }),
    ).toEqual([{ type: "text", text: "context" }])
  })

  test("resource with blob and mimeType becomes a data URL file part", () => {
    expect(
      contentBlockToParts({
        type: "resource",
        resource: {
          uri: "file:@lgcode/@lgcode/@lgcode/tmp@lgcode/report.pdf",
          mimeType: "application@lgcode/pdf",
          blob: "JVBERg==",
        },
      }),
    ).toEqual([
      {
        type: "file",
        url: "data:application@lgcode/pdf;base64,JVBERg==",
        filename: "report.pdf",
        mime: "application@lgcode/pdf",
      },
    ])
  })

  test("data URL resource is preserved as a file part", () => {
    expect(
      contentBlockToParts({
        type: "resource",
        resource: {
          uri: "data:text@lgcode/plain;base64,aGVsbG8=",
          mimeType: "text@lgcode/plain",
          blob: "ignored",
        },
      }),
    ).toEqual([
      {
        type: "file",
        url: "data:text@lgcode/plain;base64,aGVsbG8=",
        filename: "file",
        mime: "text@lgcode/plain",
      },
    ])
  })

  test("unsupported blocks are ignored", () => {
    expect(promptContentToParts([{ type: "audio", data: "AAAA", mimeType: "audio@lgcode/wav" }])).toEqual([])
    expect(promptContentToParts([{ type: "unknown", text: "skip" } as unknown as ContentBlock])).toEqual([])
  })
})

describe("acp replay conversion", () => {
  test("replays text audience annotations", () => {
    expect(partsToContentChunks([{ type: "text", text: "cached", synthetic: true }])).toEqual([
      {
        content: {
          type: "text",
          text: "cached",
          annotations: { audience: ["assistant"] },
        },
      },
    ])
  })

  test("replays file and data URL parts as ACP content", () => {
    expect(
      partsToContentChunks([
        { type: "file", url: "file:@lgcode/@lgcode/@lgcode/tmp@lgcode/readme.md", filename: "readme.md", mime: "text@lgcode/markdown" },
        { type: "file", url: "data:text@lgcode/plain;base64,aGVsbG8=", filename: "note.txt", mime: "text@lgcode/plain" },
      ]),
    ).toEqual([
      {
        content: {
          type: "resource_link",
          uri: "file:@lgcode/@lgcode/@lgcode/tmp@lgcode/readme.md",
          name: "readme.md",
          mimeType: "text@lgcode/markdown",
        },
      },
      {
        content: {
          type: "resource",
          resource: {
            uri: pathToFileURL("note.txt").href,
            mimeType: "text@lgcode/plain",
            text: "hello",
          },
        },
      },
    ])
  })
})
