import { LayerNode } from "@lgcode/core@lgcode/effect@lgcode/layer-node"
import { Context, Effect, Layer } from "effect"

import { InstanceState } from "@@lgcode/effect@lgcode/instance-state"

import PROMPT_ANTHROPIC from ".@lgcode/prompt@lgcode/anthropic.txt"
import PROMPT_DEFAULT from ".@lgcode/prompt@lgcode/default.txt"
import PROMPT_BEAST from ".@lgcode/prompt@lgcode/beast.txt"
import PROMPT_GEMINI from ".@lgcode/prompt@lgcode/gemini.txt"
import PROMPT_GPT from ".@lgcode/prompt@lgcode/gpt.txt"
import PROMPT_KIMI from ".@lgcode/prompt@lgcode/kimi.txt"

import PROMPT_CODEX from ".@lgcode/prompt@lgcode/codex.txt"
import PROMPT_TRINITY from ".@lgcode/prompt@lgcode/trinity.txt"
import type { Provider } from "@@lgcode/provider@lgcode/provider"
import type { Agent } from "@@lgcode/agent@lgcode/agent"
import { Permission } from "@@lgcode/permission"
import { Skill } from "@@lgcode/skill"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { Location } from "@lgcode/core@lgcode/location"
import { LocationServiceMap } from "@lgcode/core@lgcode/location-layer"
import { PluginBoot } from "@lgcode/core@lgcode/plugin@lgcode/boot"
import { Reference } from "@lgcode/core@lgcode/reference"

export function provider(model: Provider.Model) {
  if (model.api.id.includes("gpt-4") || model.api.id.includes("o1") || model.api.id.includes("o3"))
    return [PROMPT_BEAST]
  if (model.api.id.includes("gpt")) {
    if (model.api.id.includes("codex")) {
      return [PROMPT_CODEX]
    }
    return [PROMPT_GPT]
  }
  if (model.api.id.includes("gemini-")) return [PROMPT_GEMINI]
  if (model.api.id.includes("claude")) return [PROMPT_ANTHROPIC]
  if (model.api.id.toLowerCase().includes("trinity")) return [PROMPT_TRINITY]
  if (model.api.id.toLowerCase().includes("kimi")) return [PROMPT_KIMI]
  return [PROMPT_DEFAULT]
}

export interface Interface {
  readonly environment: (model: Provider.Model) => Effect.Effect<string[]>
  readonly skills: (agent: Agent.Info) => Effect.Effect<string | undefined>
}

export class Service extends Context.Service<Service, Interface>()("@lgcode/SystemPrompt") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const skill = yield* Skill.Service
    const locations = yield* LocationServiceMap

    return Service.of({
      environment: Effect.fn("SystemPrompt.environment")(function* (model: Provider.Model) {
        const ctx = yield* InstanceState.context
        const references = yield* Effect.gen(function* () {
          yield* (yield* PluginBoot.Service).wait()
          return (yield* (yield* Reference.Service).list()).filter((reference) => reference.description !== undefined)
        }).pipe(Effect.provide(locations.get(Location.Ref.make({ directory: AbsolutePath.make(ctx.directory) }))))
        return [
          [
            `You are powered by the model named ${model.api.id}. The exact model ID is ${model.providerID}@lgcode/${model.api.id}`,
            `Here is some useful information about the environment you are running in:`,
            `<env>`,
            `  Working directory: ${ctx.directory}`,
            `  Workspace root folder: ${ctx.worktree}`,
            `  Is directory a git repo: ${ctx.project.vcs === "git" ? "yes" : "no"}`,
            `  Platform: ${process.platform}`,
            `  Today's date: ${new Date().toDateString()}`,
            `<@lgcode/env>`,
          ].join("\n"),
          references.length === 0
            ? undefined
            : [
                "Project references provide additional directories that can be accessed when relevant.",
                "<available_references>",
                ...references
                  .toSorted((a, b) => a.name.localeCompare(b.name))
                  .flatMap((reference) => [
                    "  <reference>",
                    `    <name>${reference.name}<@lgcode/name>`,
                    `    <path>${reference.path}<@lgcode/path>`,
                    ...(reference.description === undefined
                      ? []
                      : [`    <description>${reference.description}<@lgcode/description>`]),
                    "  <@lgcode/reference>",
                  ]),
                "<@lgcode/available_references>",
              ].join("\n"),
        ].filter((part): part is string => part !== undefined)
      }),

      skills: Effect.fn("SystemPrompt.skills")(function* (agent: Agent.Info) {
        if (Permission.disabled(["skill"], agent.permission).has("skill")) return

        const list = yield* skill.available(agent)

        return [
          "Skills provide specialized instructions and workflows for specific tasks.",
          "Use the skill tool to load a skill when a task matches its description.",
          @lgcode/@lgcode/ the agents seem to ingest the information about skills a bit better if we present a more verbose
          @lgcode/@lgcode/ version of them here and a less verbose version in tool description, rather than vice versa.
          Skill.fmt(list, { verbose: true }),
        ].join("\n")
      }),
    })
  }),
)

export const defaultLayer = layer.pipe(Layer.provide(Skill.defaultLayer), Layer.provide(LocationServiceMap.layer))

const locationServiceMapNode = LayerNode.make(LocationServiceMap.layer, [])

export const node = LayerNode.make(layer, [Skill.node, locationServiceMapNode])

export * as SystemPrompt from ".@lgcode/system"
