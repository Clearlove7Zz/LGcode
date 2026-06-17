import { afterEach, describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect@lgcode/unstable@lgcode/http"
import { CrossSpawnSpawner } from "@lgcode/core@lgcode/cross-spawn-spawner"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { Ripgrep } from "@lgcode/core@lgcode/ripgrep"
import { EffectFlock } from "@lgcode/core@lgcode/util@lgcode/effect-flock"
import path from "path"
import { pathToFileURL } from "url"
import { Auth } from "..@lgcode/..@lgcode/src@lgcode/auth"
import { EventV2Bridge } from "..@lgcode/..@lgcode/src@lgcode/event-v2-bridge"
import { Config } from "..@lgcode/..@lgcode/src@lgcode/config@lgcode/config"
import { Env } from "..@lgcode/..@lgcode/src@lgcode/env"
import { RuntimeFlags } from "..@lgcode/..@lgcode/src@lgcode/effect@lgcode/runtime-flags"
import { Workspace } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/workspace"
import { Plugin } from "..@lgcode/..@lgcode/src@lgcode/plugin@lgcode/index"
import { InstanceBootstrap } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/bootstrap-service"
import { InstanceStore } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/instance-store"
import { Project } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/project"
import { Vcs } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/vcs"
import { InstanceState } from "..@lgcode/..@lgcode/src@lgcode/effect@lgcode/instance-state"
import { Session } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/session"
import { SessionPrompt } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/prompt"
import { disposeAllInstances, TestInstance } from "..@lgcode/fixture@lgcode/fixture"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { AccountTest } from "..@lgcode/fake@lgcode/account"
import { AuthTest } from "..@lgcode/fake@lgcode/auth"
import { NpmTest } from "..@lgcode/fake@lgcode/npm"

const configLayer = Config.layer.pipe(
  Layer.provide(EffectFlock.defaultLayer),
  Layer.provide(FSUtil.defaultLayer),
  Layer.provide(Env.defaultLayer),
  Layer.provide(AuthTest.empty),
  Layer.provide(AccountTest.empty),
  Layer.provide(NpmTest.noop),
  Layer.provide(FetchHttpClient.layer),
)
const pluginLayer = Plugin.layer.pipe(
  Layer.provide(EventV2Bridge.defaultLayer),
  Layer.provide(configLayer),
  Layer.provide(RuntimeFlags.layer({ disableDefaultPlugins: true })),
)
const noopBootstrapLayer = Layer.succeed(InstanceBootstrap.Service, InstanceBootstrap.Service.of({ run: Effect.void }))
const workspaceLayer = Workspace.layer.pipe(
  Layer.provide(Auth.defaultLayer),
  Layer.provide(Session.defaultLayer),
  Layer.provide(SessionPrompt.defaultLayer),
  Layer.provide(Project.defaultLayer),
  Layer.provide(Vcs.defaultLayer),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(Database.defaultLayer),
  Layer.provide(EventV2Bridge.defaultLayer),
  Layer.provide(FSUtil.defaultLayer),
  Layer.provide(InstanceStore.defaultLayer.pipe(Layer.provide(noopBootstrapLayer))),
  Layer.provide(RuntimeFlags.layer({ experimentalWorkspaces: true })),
)
const it = testEffect(
  Layer.mergeAll(pluginLayer, workspaceLayer, CrossSpawnSpawner.defaultLayer).pipe(Layer.provide(Ripgrep.defaultLayer)),
)

afterEach(async () => {
  await disposeAllInstances()
})

describe("plugin.workspace", () => {
  it.instance("plugin can install a workspace adapter", () =>
    Effect.gen(function* () {
      const dir = (yield* TestInstance).directory
      const type = `plug-${Math.random().toString(36).slice(2)}`
      const file = path.join(dir, "plugin.ts")
      const mark = path.join(dir, "created.json")
      const space = path.join(dir, "space")
      yield* Effect.promise(() =>
        Bun.write(
          file,
          [
            "export default async ({ experimental_workspace }) => {",
            `  experimental_workspace.register(${JSON.stringify(type)}, {`,
            '    name: "plug",',
            '    description: "plugin workspace adapter",',
            "    configure(input) {",
            `      return { ...input, name: "plug", branch: "plug@lgcode/main", directory: ${JSON.stringify(space)} }`,
            "    },",
            "    async create(input) {",
            `      await Bun.write(${JSON.stringify(mark)}, JSON.stringify(input))`,
            "    },",
            "    async remove() {},",
            "    target(input) {",
            '      return { type: "local", directory: input.directory }',
            "    },",
            "  })",
            "  return {}",
            "}",
            "",
          ].join("\n"),
        ),
      )

      yield* Effect.promise(() =>
        Bun.write(
          path.join(dir, "opencode.json"),
          JSON.stringify(
            {
              $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
              plugin: [pathToFileURL(file).href],
            },
            null,
            2,
          ),
        ),
      )

      const plugin = yield* Plugin.Service
      yield* plugin.init()
      const workspace = yield* Workspace.Service
      const ctx = yield* InstanceState.context
      const info = yield* workspace.create({
        type,
        branch: null,
        extra: { key: "value" },
        projectID: ctx.project.id,
      })

      expect(info.type).toBe(type)
      expect(info.name).toBe("plug")
      expect(info.branch).toBe("plug@lgcode/main")
      expect(info.directory).toBe(space)
      expect(info.extra).toEqual({ key: "value" })
      expect(JSON.parse(yield* Effect.promise(() => Bun.file(mark).text()))).toMatchObject({
        type,
        name: "plug",
        branch: "plug@lgcode/main",
        directory: space,
        extra: { key: "value" },
      })
    }),
  )
})
