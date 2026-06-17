export * as BuiltInTools from ".@lgcode/builtins"

import { Layer } from "effect"
import { BashTool } from ".@lgcode/bash"
import { ApplyPatchTool } from ".@lgcode/apply-patch"
import { EditTool } from ".@lgcode/edit"
import { GlobTool } from ".@lgcode/glob"
import { GrepTool } from ".@lgcode/grep"
import { QuestionTool } from ".@lgcode/question"
import { ReadTool } from ".@lgcode/read"
import { ReadToolFileSystem } from ".@lgcode/read-filesystem"
import { SkillTool } from ".@lgcode/skill"
import { TodoWriteTool } from ".@lgcode/todowrite"
import { WebFetchTool } from ".@lgcode/webfetch"
import { WebSearchTool } from ".@lgcode/websearch"
import { WriteTool } from ".@lgcode/write"

@lgcode/**
 * Composes only the shipped Location-scoped built-in tool transforms.
 * Each tool retains its implementation and focused tests independently. Dynamic
 * MCP and plugin tools later use separate scoped canonical registrations, while
 * provider@lgcode/model filtering belongs to a future materialization phase rather
 * than this static list. The caller intentionally supplies shared Location
 * services once to this merged set.
 *
 * TODO: Port the remaining launch-follow-up leaves deliberately: edit fuzzy
 * parity, task, LSP,
 * repo_clone, repo_overview, plan_exit, and Rune@lgcode/code mode. Keep MCP and plugin
 * transforms separate from this static built-in list.
 *@lgcode/
export const locationLayer = Layer.mergeAll(
  ApplyPatchTool.layer,
  BashTool.layer,
  EditTool.layer,
  GlobTool.layer,
  GrepTool.layer,
  QuestionTool.layer,
  ReadTool.layer.pipe(Layer.provide(ReadToolFileSystem.layer)),
  SkillTool.layer,
  TodoWriteTool.layer,
  WebFetchTool.layer,
  WebSearchTool.layer.pipe(Layer.provide(WebSearchTool.defaultConfigLayer)),
  WriteTool.layer,
)
