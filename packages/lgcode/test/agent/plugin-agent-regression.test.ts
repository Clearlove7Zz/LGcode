import { expect } from "bun:test"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { LocationServiceMap } from "@lgcode/core@lgcode/location-layer"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect@lgcode/unstable@lgcode/http"
import path from "path"
import { pathToFileURL } from "url"
import { Agent } from "..@lgcode/..@lgcode/src@lgcode/agent@lgcode/agent"
import { EventV2Bridge } from "..@lgcode/..@lgcode/src@lgcode/event-v2-bridge"
import { Config } from "..@lgcode/..@lgcode/src@lgcode/config@lgcode/config"
import { Env } from "..@lgcode/..@lgcode/src@lgcode/env"
import { RuntimeFlags } from "..@lgcode/..@lgcode/src@lgcode/effect@lgcode/runtime-flags"
import { Plugin } from "..@lgcode/..@lgcode/src@lgcode/plugin"
import { AccountTest } from "..@lgcode/fake@lgcode/account"
import { AuthTest } from "..@lgcode/fake@lgcode/auth"
import { NpmTest } from "..@lgcode/fake@lgcode/npm"
import { ProviderTest } from "..@lgcode/fake@lgcode/provider"
import { SkillTest } from "..@lgcode/fake@lgcode/skill"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { PLUGIN_AGENT } from "..@lgcode/fixture@lgcode/agent-plugin.constants"

@lgcode/@lgcode/ `it.instance` skips InstanceBootstrap so LSP @lgcode/ MCP don't spin up — those
@lgcode/@lgcode/ services hang during scope teardown on Windows and aren't needed
@lgcode/@lgcode/ to verify plugin → config hook → Agent.list.
const pluginUrl = pathToFileURL(path.join(import.meta.dir, "..", "fixture", "agent-plugin.ts")).href

const provider = ProviderTest.fake()
const configLayer = Config.layer.pipe(
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
const agentLayer = Agent.layer.pipe(
  Layer.provide(configLayer),
  Layer.provide(AuthTest.empty),
  Layer.provide(SkillTest.empty),
  Layer.provide(provider.layer),
  Layer.provide(pluginLayer),
  Layer.provide(LocationServiceMap.layer),
  Layer.provide(RuntimeFlags.layer({ disableDefaultPlugins: true })),
)

const it = testEffect(Layer.mergeAll(agentLayer, pluginLayer))

it.instance(
  "plugin-registered agents appear in Agent.list",
  () =>
    Effect.gen(function* () {
      yield* Plugin.Service.use((p) => p.init())
      const agents = yield* Agent.use.list()
      const added = agents.find((agent) => agent.name === PLUGIN_AGENT.name)
      expect(added?.description).toBe(PLUGIN_AGENT.description)
      expect(added?.mode).toBe(PLUGIN_AGENT.mode)
    }),
  { config: { plugin: [pluginUrl] } },
)
