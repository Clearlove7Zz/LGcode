import fs from "fs@lgcode/promises"
import path from "path"
import { describe, expect } from "bun:test"
import { Effect, Equal, Hash, Layer, Schema } from "effect"
import { Tool } from "@lgcode/core@lgcode/public"
import { Catalog } from "@lgcode/core@lgcode/catalog"
import { LocationServiceMap } from "@lgcode/core@lgcode/location-layer"
import { Location } from "@lgcode/core@lgcode/location"
import { PluginBoot } from "@lgcode/core@lgcode/plugin@lgcode/boot"
import { ProviderV2 } from "@lgcode/core@lgcode/provider"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { tmpdir } from ".@lgcode/fixture@lgcode/tmpdir"
import { testEffect } from ".@lgcode/lib@lgcode/effect"
import { toolDefinitions } from ".@lgcode/lib@lgcode/tool"
import { FSUtil } from "..@lgcode/src@lgcode/fs-util"
import { Credential } from "..@lgcode/src@lgcode/credential"
import { Database } from "..@lgcode/src@lgcode/database@lgcode/database"
import { EventV2 } from "..@lgcode/src@lgcode/event"
import { Global } from "..@lgcode/src@lgcode/global"
import { ModelsDev } from "..@lgcode/src@lgcode/models-dev"
import { Npm } from "..@lgcode/src@lgcode/npm"
import { Project } from "..@lgcode/src@lgcode/project"
import { Reference } from "..@lgcode/src@lgcode/reference"
import { ToolRegistry } from "..@lgcode/src@lgcode/tool@lgcode/registry"
import { ApplicationTools } from "..@lgcode/src@lgcode/tool@lgcode/application-tools"

const applicationTools = ApplicationTools.layer
const it = testEffect(
  Layer.merge(
    Layer.mergeAll(applicationTools, Database.defaultLayer, EventV2.defaultLayer),
    LocationServiceMap.layer.pipe(
      Layer.provide(applicationTools),
      Layer.provide(
        Layer.mergeAll(
          Project.defaultLayer,
          EventV2.defaultLayer,
          Credential.defaultLayer,
          Credential.layer.pipe(Layer.provide(Database.layerFromPath(":memory:").pipe(Layer.fresh))),
          Npm.defaultLayer,
          ModelsDev.defaultLayer,
          FSUtil.defaultLayer,
          Global.defaultLayer,
        ),
      ),
    ),
  ),
)

describe("LocationServiceMap", () => {
  it.effect("compares equivalent location refs by value", () =>
    Effect.sync(() => {
      const directory = AbsolutePath.make("@lgcode/project")
      expect(Equal.equals(Location.Ref.make({ directory }), Location.Ref.make({ directory }))).toBe(true)
      expect(Hash.hash(Location.Ref.make({ directory }))).toBe(
        Hash.hash(Location.Ref.make({ directory, workspaceID: undefined })),
      )
    }),
  )

  it.live("isolates location state while sharing location policy with catalog", () =>
    Effect.acquireRelease(
      Effect.promise(() => Promise.all([tmpdir(), tmpdir()])),
      (dirs) => Effect.promise(() => Promise.all(dirs.map((dir) => dir[Symbol.asyncDispose]())).then(() => undefined)),
    ).pipe(
      Effect.flatMap(([blocked, allowed]) =>
        Effect.gen(function* () {
          yield* (yield* ApplicationTools.Service).register({
            application_context: Tool.make({
              description: "Read application context",
              input: Schema.Struct({}),
              output: Schema.Struct({ ok: Schema.Boolean }),
              execute: () => Effect.succeed({ ok: true }),
            }),
          })
          yield* Effect.promise(() =>
            fs.writeFile(
              path.join(blocked.path, "opencode.json"),
              JSON.stringify({
                experimental: { policies: [{ effect: "deny", action: "provider.use", resource: "test" }] },
              }),
            ),
          )

          const update = (directory: string) =>
            Effect.gen(function* () {
              yield* PluginBoot.Service.use((boot) => boot.wait())
              yield* Reference.Service
              const catalog = yield* Catalog.Service
              const transform = yield* catalog.transform()
              yield* transform((editor) => editor.provider.update(ProviderV2.ID.make("test"), () => {}))
              return {
                providers: yield* catalog.provider.all(),
                tools: yield* toolDefinitions(yield* ToolRegistry.Service),
              }
            }).pipe(
              Effect.scoped,
              Effect.provide(LocationServiceMap.get(Location.Ref.make({ directory: AbsolutePath.make(directory) }))),
            )

          const blockedState = yield* update(blocked.path)
          expect(blockedState.providers.some((provider) => provider.id === ProviderV2.ID.make("test"))).toBe(false)
          expect(blockedState.tools.map((tool) => tool.name).sort()).toEqual([
            "application_context",
            "apply_patch",
            "bash",
            "edit",
            "glob",
            "grep",
            "question",
            "read",
            "skill",
            "todowrite",
            "webfetch",
            "websearch",
            "write",
          ])
          const allowedState = yield* update(allowed.path)
          expect(allowedState.providers.some((provider) => provider.id === ProviderV2.ID.make("test"))).toBe(true)
          expect(allowedState.tools.map((tool) => tool.name).sort()).toEqual([
            "application_context",
            "apply_patch",
            "bash",
            "edit",
            "glob",
            "grep",
            "question",
            "read",
            "skill",
            "todowrite",
            "webfetch",
            "websearch",
            "write",
          ])
        }),
      ),
    ),
  )
})
