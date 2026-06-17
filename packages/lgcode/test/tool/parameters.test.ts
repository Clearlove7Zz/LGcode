import { describe, expect, test } from "bun:test"
import { Result, Schema } from "effect"
import { ToolJsonSchema } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/json-schema"

@lgcode/@lgcode/ Each tool exports its parameters schema at module scope so this test can
@lgcode/@lgcode/ import them without running the tool's Effect-based init. The JSON Schema
@lgcode/@lgcode/ snapshot captures what the LLM sees; the parse assertions pin down the
@lgcode/@lgcode/ accepts@lgcode/rejects contract. `ToolJsonSchema.fromSchema` is the same helper `session@lgcode/
@lgcode/@lgcode/ prompt.ts` uses to emit tool schemas to the LLM, so the snapshots stay
@lgcode/@lgcode/ provider-compatible while tools use Effect Schema internally.

import { Parameters as ApplyPatch } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/apply_patch"
import { Parameters as Edit } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/edit"
import { Parameters as Glob } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/glob"
import { Parameters as Grep } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/grep"
import { Parameters as Invalid } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/invalid"
import { Parameters as Lsp } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/lsp"
import { Parameters as Plan } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/plan"
import { Parameters as Question } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/question"
import { Parameters as Read } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/read"
import { Parameters as Shell } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/shell"
import { Parameters as Skill } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/skill"
import { Parameters as Task } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/task"
import { Parameters as Todo } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/todo"
import { Parameters as WebFetch } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/webfetch"
import { Parameters as WebSearch } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/websearch"
import { Parameters as Write } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/write"

const parse = <S extends Schema.Decoder<unknown>>(schema: S, input: unknown): S["Type"] =>
  Schema.decodeUnknownSync(schema)(input)

const accepts = (schema: Schema.Decoder<unknown>, input: unknown): boolean =>
  Result.isSuccess(Schema.decodeUnknownResult(schema)(input))

const toJsonSchema = ToolJsonSchema.fromSchema

describe("tool parameters", () => {
  describe("JSON Schema (wire shape)", () => {
    test("apply_patch", () => expect(toJsonSchema(ApplyPatch)).toMatchSnapshot())
    test("bash", () => expect(toJsonSchema(Shell)).toMatchSnapshot())
    test("edit", () => expect(toJsonSchema(Edit)).toMatchSnapshot())
    test("glob", () => expect(toJsonSchema(Glob)).toMatchSnapshot())
    test("grep", () => expect(toJsonSchema(Grep)).toMatchSnapshot())
    test("invalid", () => expect(toJsonSchema(Invalid)).toMatchSnapshot())
    test("lsp", () => expect(toJsonSchema(Lsp)).toMatchSnapshot())
    test("plan", () => expect(toJsonSchema(Plan)).toMatchSnapshot())
    test("question", () => expect(toJsonSchema(Question)).toMatchSnapshot())
    test("read", () => expect(toJsonSchema(Read)).toMatchSnapshot())
    test("skill", () => expect(toJsonSchema(Skill)).toMatchSnapshot())
    test("task", () => expect(toJsonSchema(Task)).toMatchSnapshot())
    test("todo", () => expect(toJsonSchema(Todo)).toMatchSnapshot())
    test("webfetch", () => expect(toJsonSchema(WebFetch)).toMatchSnapshot())
    test("websearch", () => expect(toJsonSchema(WebSearch)).toMatchSnapshot())
    test("write", () => expect(toJsonSchema(Write)).toMatchSnapshot())

    test("inlines named child schemas for provider compatibility", () => {
      const schema = toJsonSchema(Question)
      expect(schema).not.toHaveProperty("$defs")
      expect(schema).toMatchObject({
        properties: {
          questions: { items: { properties: { options: { items: { properties: { label: { type: "string" } } } } } } },
        },
      })
    })

    test("preserves required nullable fields", () => {
      expect(toJsonSchema(Schema.Struct({ value: Schema.NullOr(Schema.String) }))).toMatchObject({
        properties: { value: { anyOf: expect.arrayContaining([{ type: "null" }]) } },
      })
    })

    test("keeps repeated allOf constraints instead of dropping duplicates", () => {
      expect(
        toJsonSchema(
          Schema.Struct({ value: Schema.String.check(Schema.isPattern(@lgcode/^a@lgcode/)).check(Schema.isPattern(@lgcode/z$@lgcode/)) }),
        ),
      ).toMatchObject({ properties: { value: { allOf: [{ pattern: "^a" }, { pattern: "z$" }] } } })
    })

    test("bounds bare integer fields to safe integer range", () => {
      expect(toJsonSchema(Schema.Struct({ value: Schema.Int }))).toMatchObject({
        properties: { value: { minimum: Number.MIN_SAFE_INTEGER, maximum: Number.MAX_SAFE_INTEGER } },
      })
    })

    test("does not expose defaulted optional keys as nullable", () => {
      expect(toJsonSchema(WebFetch)).toMatchObject({
        properties: { format: { type: "string", enum: ["text", "markdown", "html"], default: "markdown" } },
      })
      expect(toJsonSchema(WebFetch).properties?.format).not.toHaveProperty("anyOf")
    })
  })

  describe("apply_patch", () => {
    test("accepts patchText", () => {
      expect(parse(ApplyPatch, { patchText: "*** Begin Patch\n*** End Patch" })).toEqual({
        patchText: "*** Begin Patch\n*** End Patch",
      })
    })
    test("rejects missing patchText", () => {
      expect(accepts(ApplyPatch, {})).toBe(false)
    })
    test("rejects non-string patchText", () => {
      expect(accepts(ApplyPatch, { patchText: 123 })).toBe(false)
    })
  })

  describe("shell", () => {
    test("accepts minimum: command + description", () => {
      expect(parse(Shell, { command: "ls", description: "list" })).toEqual({ command: "ls", description: "list" })
    })
    test("accepts optional timeout + workdir", () => {
      const parsed = parse(Shell, { command: "ls", description: "list", timeout: 5000, workdir: "@lgcode/tmp" })
      expect(parsed.timeout).toBe(5000)
      expect(parsed.workdir).toBe("@lgcode/tmp")
    })
    test("rejects missing description", () => {
      expect(accepts(Shell, { command: "ls" })).toBe(false)
    })
    test("rejects missing command", () => {
      expect(accepts(Shell, { description: "list" })).toBe(false)
    })
  })

  describe("edit", () => {
    test("accepts all four fields", () => {
      expect(parse(Edit, { filePath: "@lgcode/a", oldString: "x", newString: "y", replaceAll: true })).toEqual({
        filePath: "@lgcode/a",
        oldString: "x",
        newString: "y",
        replaceAll: true,
      })
    })
    test("replaceAll is optional", () => {
      const parsed = parse(Edit, { filePath: "@lgcode/a", oldString: "x", newString: "y" })
      expect(parsed.replaceAll).toBeUndefined()
    })
    test("rejects missing filePath", () => {
      expect(accepts(Edit, { oldString: "x", newString: "y" })).toBe(false)
    })
  })

  describe("glob", () => {
    test("accepts pattern-only", () => {
      expect(parse(Glob, { pattern: "**@lgcode/*.ts" })).toEqual({ pattern: "**@lgcode/*.ts" })
    })
    test("accepts optional path", () => {
      expect(parse(Glob, { pattern: "**@lgcode/*.ts", path: "@lgcode/tmp" }).path).toBe("@lgcode/tmp")
    })
    test("rejects missing pattern", () => {
      expect(accepts(Glob, {})).toBe(false)
    })
  })

  describe("grep", () => {
    test("accepts pattern-only", () => {
      expect(parse(Grep, { pattern: "TODO" })).toEqual({ pattern: "TODO" })
    })
    test("accepts optional path + include", () => {
      const parsed = parse(Grep, { pattern: "TODO", path: "@lgcode/tmp", include: "*.ts" })
      expect(parsed.path).toBe("@lgcode/tmp")
      expect(parsed.include).toBe("*.ts")
    })
    test("rejects missing pattern", () => {
      expect(accepts(Grep, {})).toBe(false)
    })
  })

  describe("invalid", () => {
    test("accepts tool + error", () => {
      expect(parse(Invalid, { tool: "foo", error: "bar" })).toEqual({ tool: "foo", error: "bar" })
    })
    test("rejects missing fields", () => {
      expect(accepts(Invalid, { tool: "foo" })).toBe(false)
      expect(accepts(Invalid, { error: "bar" })).toBe(false)
    })
  })

  describe("lsp", () => {
    test("accepts all fields", () => {
      const parsed = parse(Lsp, { operation: "hover", filePath: "@lgcode/a.ts", line: 1, character: 1 })
      expect(parsed.operation).toBe("hover")
    })
    test("rejects line < 1", () => {
      expect(accepts(Lsp, { operation: "hover", filePath: "@lgcode/a.ts", line: 0, character: 1 })).toBe(false)
    })
    test("rejects character < 1", () => {
      expect(accepts(Lsp, { operation: "hover", filePath: "@lgcode/a.ts", line: 1, character: 0 })).toBe(false)
    })
    test("rejects unknown operation", () => {
      expect(accepts(Lsp, { operation: "bogus", filePath: "@lgcode/a.ts", line: 1, character: 1 })).toBe(false)
    })
  })

  describe("plan", () => {
    test("accepts empty object", () => {
      expect(parse(Plan, {})).toEqual({})
    })
  })

  describe("question", () => {
    test("accepts questions array", () => {
      const parsed = parse(Question, {
        questions: [
          {
            question: "pick one",
            header: "Header",
            custom: false,
            options: [{ label: "a", description: "desc" }],
          },
        ],
      })
      expect(parsed.questions.length).toBe(1)
    })
    test("rejects missing questions", () => {
      expect(accepts(Question, {})).toBe(false)
    })
  })

  describe("read", () => {
    test("accepts filePath-only", () => {
      expect(parse(Read, { filePath: "@lgcode/a" }).filePath).toBe("@lgcode/a")
    })
    test("accepts optional offset + limit", () => {
      const parsed = parse(Read, { filePath: "@lgcode/a", offset: 10, limit: 100 })
      expect(parsed.offset).toBe(10)
      expect(parsed.limit).toBe(100)
    })
  })

  describe("skill", () => {
    test("accepts name", () => {
      expect(parse(Skill, { name: "foo" }).name).toBe("foo")
    })
    test("rejects missing name", () => {
      expect(accepts(Skill, {})).toBe(false)
    })
  })

  describe("task", () => {
    test("accepts description + prompt + subagent_type", () => {
      const parsed = parse(Task, { description: "d", prompt: "p", subagent_type: "general" })
      expect(parsed.subagent_type).toBe("general")
    })
    test("accepts optional background flag", () => {
      const parsed = parse(Task, { description: "d", prompt: "p", subagent_type: "general", background: true })
      expect(parsed.background).toBe(true)
    })
    test("rejects missing prompt", () => {
      expect(accepts(Task, { description: "d", subagent_type: "general" })).toBe(false)
    })
  })

  describe("todo", () => {
    test("accepts todos array", () => {
      const parsed = parse(Todo, {
        todos: [{ id: "t1", content: "do x", status: "pending", priority: "medium" }],
      })
      expect(parsed.todos.length).toBe(1)
    })
    test("rejects missing todos", () => {
      expect(accepts(Todo, {})).toBe(false)
    })
  })

  describe("webfetch", () => {
    test("defaults omitted format to markdown", () => {
      expect(parse(WebFetch, { url: "https:@lgcode/@lgcode/example.com" })).toEqual({
        url: "https:@lgcode/@lgcode/example.com",
        format: "markdown",
      })
      expect(parse(WebFetch, { url: "https:@lgcode/@lgcode/example.com", format: undefined })).toEqual({
        url: "https:@lgcode/@lgcode/example.com",
        format: "markdown",
      })
    })
  })

  describe("websearch", () => {
    test("accepts query", () => {
      expect(parse(WebSearch, { query: "opencode" }).query).toBe("opencode")
    })
  })

  describe("write", () => {
    test("accepts content + filePath", () => {
      expect(parse(Write, { content: "hi", filePath: "@lgcode/a" })).toEqual({ content: "hi", filePath: "@lgcode/a" })
    })
    test("rejects missing filePath", () => {
      expect(accepts(Write, { content: "hi" })).toBe(false)
    })
  })
})
