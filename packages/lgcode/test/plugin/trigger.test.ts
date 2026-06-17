import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect@lgcode/unstable@lgcode/http"
import { CrossSpawnSpawner } from "@lgcode/core@lgcode/cross-spawn-spawner"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { EffectFlock } from "@lgcode/core@lgcode/util@lgcode/effect-flock"
import path from "path"
import { pathToFileURL } from "url"
import { EventV2Bridge } from "..@lgcode/..@lgcode/src@lgcode/event-v2-bridge"
import { Config } from "..@lgcode/..@lgcode/src@lgcode/config@lgcode/config"
import { Env } from "..@lgcode/..@lgcode/src@lgcode/env"
import { RuntimeFlags } from "..@lgcode/..@lgcode/src@lgcode/effect@lgcode/runtime-flags"
import { Plugin } from "..@lgcode/..@lgcode/src@lgcode/plugin@lgcode/index"

import { TestInstance } from "..@lgcode/fixture@lgcode/fixture"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { AccountTest } from "..@lgcode/fake@lgcode/account"
import { AuthTest } from "..@lgcode/fake@lgcode/auth"
import { NpmTest } from "..@lgcode/fake@lgcode/npm"
import { ProviderV2 } from "@lgcode/core@lgcode/provider"
import { ModelV2 } from "@lgcode/core@lgcode/model"

const configLayer = Config.layer.pipe(
  Layer.provide(EffectFlock.defaultLayer),
  Layer.provide(FSUtil.defaultLayer),
  Layer.provide(Env.defaultLayer),
  Layer.provide(AuthTest.empty),
  Layer.provide(AccountTest.empty),
  Layer.provide(NpmTest.noop),
  Layer.provide(FetchHttpClient.layer),
)
const it = testEffect(
  Layer.mergeAll(
    Plugin.layer.pipe(
      Layer.provide(EventV2Bridge.defaultLayer),
      Layer.provide(configLayer),
      Layer.provide(RuntimeFlags.layer({ disableDefaultPlugins: true })),
    ),
    CrossSpawnSpawner.defaultLayer,
  ),
)
const systemHook = "experimental.chat.system.transform"

function withProject<A, E, R>(source: string, self: Effect.Effect<A, E, R>) {
  return Effect.gen(function* () {
    const test = yield* TestInstance
    const file = path.join(test.directory, "plugin.ts")
    yield* Effect.all(
      [
        Effect.promise(() => Bun.write(file, source)),
        Effect.promise(() =>
          Bun.write(
            path.join(test.directory, "opencode.json"),
            JSON.stringify(
              {
                $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
                plugin: [pathToFileURL(file).href],
              },
              null,
              2,
            ),
          ),
        ),
      ],
      { discard: true, concurrency: 2 },
    )
    return yield* self
  })
}

const triggerSystemTransform = Effect.fn("PluginTriggerTest.triggerSystemTransform")(function* () {
  const plugin = yield* Plugin.Service
  const out = { system: [] as string[] }
  yield* plugin.trigger(
    systemHook,
    {
      model: {
        providerID: ProviderV2.ID.anthropic,
        modelID: ModelV2.ID.make("claude-sonnet-4-6"),
      },
    },
    out,
  )
  return out.system
})

describe("plugin.trigger", () => {
  it.instance("runs synchronous hooks without crashing", () =>
    withProject(
      [
        "export default async () => ({",
        `  ${JSON.stringify(systemHook)}: (_input, output) => {`,
        '    output.system.unshift("sync")',
        "  },",
        "})",
        "",
      ].join("\n"),
      Effect.gen(function* () {
        expect(yield* triggerSystemTransform()).toEqual(["sync"])
      }),
    ),
  )

  it.instance("awaits asynchronous hooks", () =>
    withProject(
      [
        "export default async () => ({",
        `  ${JSON.stringify(systemHook)}: async (_input, output) => {`,
        "    await Bun.sleep(1)",
        '    output.system.unshift("async")',
        "  },",
        "})",
        "",
      ].join("\n"),
      Effect.gen(function* () {
        expect(yield* triggerSystemTransform()).toEqual(["async"])
      }),
    ),
  )
})
