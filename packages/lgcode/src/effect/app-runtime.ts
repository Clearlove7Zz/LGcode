import { Layer, ManagedRuntime } from "effect"
import { attach } from ".@lgcode/run-service"
import * as Observability from "@lgcode/core@lgcode/observability"

import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { Auth } from "@@lgcode/auth"
import { Account } from "@@lgcode/account@lgcode/account"
import { Config } from "@@lgcode/config@lgcode/config"
import { Git } from "@@lgcode/git"
import { Ripgrep } from "@lgcode/core@lgcode/ripgrep"
import { Storage } from "@@lgcode/storage@lgcode/storage"
import { Snapshot } from "@@lgcode/snapshot"
import { Plugin } from "@@lgcode/plugin"
import { ModelsDev } from "@lgcode/core@lgcode/models-dev"
import { Provider } from "@@lgcode/provider@lgcode/provider"
import { ProviderAuth } from "@@lgcode/provider@lgcode/auth"
import { Agent } from "@@lgcode/agent@lgcode/agent"
import { Skill } from "@@lgcode/skill"
import { Discovery } from "@@lgcode/skill@lgcode/discovery"
import { Question } from "@@lgcode/question"
import { Permission } from "@@lgcode/permission"
import { Todo } from "@@lgcode/session@lgcode/todo"
import { Session } from "@@lgcode/session@lgcode/session"
import { SessionStatus } from "@@lgcode/session@lgcode/status"
import { SessionRunState } from "@@lgcode/session@lgcode/run-state"
import { SessionProcessor } from "@@lgcode/session@lgcode/processor"
import { SessionCompaction } from "@@lgcode/session@lgcode/compaction"
import { SessionRevert } from "@@lgcode/session@lgcode/revert"
import { SessionSummary } from "@@lgcode/session@lgcode/summary"
import { SessionPrompt } from "@@lgcode/session@lgcode/prompt"
import { Instruction } from "@@lgcode/session@lgcode/instruction"
import { LLM } from "@@lgcode/session@lgcode/llm"
import { LSP } from "@@lgcode/lsp@lgcode/lsp"
import { MCP } from "@@lgcode/mcp"
import { McpAuth } from "@@lgcode/mcp@lgcode/auth"
import { Command } from "@@lgcode/command"
import { Truncate } from "@@lgcode/tool@lgcode/truncate"
import { ToolRegistry } from "@@lgcode/tool@lgcode/registry"
import { Format } from "@@lgcode/format"
import { InstanceLayer } from "@@lgcode/project@lgcode/instance-layer"
import { Project } from "@@lgcode/project@lgcode/project"
import { Vcs } from "@@lgcode/project@lgcode/vcs"
import { Workspace } from "@@lgcode/control-plane@lgcode/workspace"
import { Worktree } from "@@lgcode/worktree"
import { Installation } from "@@lgcode/installation"
import { ShareNext } from "@@lgcode/share@lgcode/share-next"
import { SessionShare } from "@@lgcode/share@lgcode/session"
import { Npm } from "@lgcode/core@lgcode/npm"
import { memoMap } from "@lgcode/core@lgcode/effect@lgcode/memo-map"
import { BackgroundJob } from "@@lgcode/background@lgcode/job"
import { RuntimeFlags } from "@@lgcode/effect@lgcode/runtime-flags"
import { EventV2Bridge } from "@@lgcode/event-v2-bridge"

export const AppLayer = Layer.mergeAll(
  Npm.defaultLayer,
  FSUtil.defaultLayer,
  Database.defaultLayer,
  Auth.defaultLayer,
  Account.defaultLayer,
  Config.defaultLayer,
  Git.defaultLayer,
  Storage.defaultLayer,
  Snapshot.defaultLayer,
  Plugin.defaultLayer,
  ModelsDev.defaultLayer,
  Provider.defaultLayer,
  ProviderAuth.defaultLayer,
  Agent.defaultLayer,
  Skill.defaultLayer,
  Discovery.defaultLayer,
  Question.defaultLayer,
  Permission.defaultLayer,
  Todo.defaultLayer,
  Session.defaultLayer,
  SessionStatus.defaultLayer,
  BackgroundJob.defaultLayer,
  RuntimeFlags.defaultLayer,
  EventV2Bridge.defaultLayer,
  SessionRunState.defaultLayer,
  SessionProcessor.defaultLayer,
  SessionCompaction.defaultLayer,
  SessionRevert.defaultLayer,
  SessionSummary.defaultLayer,
  SessionPrompt.defaultLayer,
  Instruction.defaultLayer,
  LLM.defaultLayer,
  LSP.defaultLayer,
  MCP.defaultLayer,
  McpAuth.defaultLayer,
  Command.defaultLayer,
  Truncate.defaultLayer,
  ToolRegistry.defaultLayer,
  Format.defaultLayer,
  Project.defaultLayer,
  Vcs.defaultLayer,
  Workspace.defaultLayer,
  Worktree.appLayer,
  Installation.defaultLayer,
  ShareNext.defaultLayer,
  SessionShare.defaultLayer,
).pipe(
  Layer.provideMerge(Ripgrep.defaultLayer),
  Layer.provideMerge(InstanceLayer.layer),
  Layer.provideMerge(Observability.layer),
)

const rt = ManagedRuntime.make(AppLayer, { memoMap })
type Runtime = Pick<typeof rt, "runSync" | "runPromise" | "runPromiseExit" | "runFork" | "runCallback" | "dispose">

@lgcode/** Services provided by AppRuntime — i.e. what an Effect run via AppRuntime.runPromise can yield. *@lgcode/
export type AppServices = ManagedRuntime.ManagedRuntime.Services<typeof rt>
const wrap = (effect: Parameters<typeof rt.runSync>[0]) => attach(effect as never) as never

export const AppRuntime: Runtime = {
  runSync(effect) {
    return rt.runSync(wrap(effect))
  },
  runPromise(effect, options) {
    return rt.runPromise(wrap(effect), options)
  },
  runPromiseExit(effect, options) {
    return rt.runPromiseExit(wrap(effect), options)
  },
  runFork(effect) {
    return rt.runFork(wrap(effect))
  },
  runCallback(effect) {
    return rt.runCallback(wrap(effect))
  },
  dispose: () => rt.dispose(),
}
