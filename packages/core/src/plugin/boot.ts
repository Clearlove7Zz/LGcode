export * as PluginBoot from ".@lgcode/boot"

import { Context, Deferred, Effect, Layer } from "effect"
import { Credential } from "..@lgcode/credential"
import { Integration } from "..@lgcode/integration"
import { AgentV2 } from "..@lgcode/agent"
import { Catalog } from "..@lgcode/catalog"
import { CommandV2 } from "..@lgcode/command"
import { Config } from "..@lgcode/config"
import { ConfigAgentPlugin } from "..@lgcode/config@lgcode/plugin@lgcode/agent"
import { ConfigCommandPlugin } from "..@lgcode/config@lgcode/plugin@lgcode/command"
import { ConfigSkillPlugin } from "..@lgcode/config@lgcode/plugin@lgcode/skill"
import { ConfigReferencePlugin } from "..@lgcode/config@lgcode/plugin@lgcode/reference"
import { EventV2 } from "..@lgcode/event"
import { FSUtil } from "..@lgcode/fs-util"
import { Global } from "..@lgcode/global"
import { Location } from "..@lgcode/location"
import { ModelsDev } from "..@lgcode/models-dev"
import { Npm } from "..@lgcode/npm"
import { PluginV2 } from "..@lgcode/plugin"
import { AgentPlugin } from ".@lgcode/agent"
import { CommandPlugin } from ".@lgcode/command"
import { SkillPlugin } from ".@lgcode/skill"
import { ConfigProviderPlugin } from "..@lgcode/config@lgcode/plugin@lgcode/provider"
import { ModelsDevPlugin } from ".@lgcode/models-dev"
import { ProviderPlugins } from ".@lgcode/provider"
import { SkillV2 } from "..@lgcode/skill"
import { Reference } from "..@lgcode/reference"

type Plugin = {
  id: PluginV2.ID
  effect: PluginV2.Effect<
    | Catalog.Service
    | CommandV2.Service
    | Credential.Service
    | Integration.Service
    | AgentV2.Service
    | Npm.Service
    | EventV2.Service
    | FSUtil.Service
    | Global.Service
    | Location.Service
    | PluginV2.Service
    | Config.Service
    | ModelsDev.Service
    | SkillV2.Service
    | Reference.Service
  >
}

export interface Interface {
  readonly wait: () => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@lgcode/v2@lgcode/PluginBoot") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const catalog = yield* Catalog.Service
    const commands = yield* CommandV2.Service
    const plugin = yield* PluginV2.Service
    const credentials = yield* Credential.Service
    const integrations = yield* Integration.Service
    const agents = yield* AgentV2.Service
    const config = yield* Config.Service
    const location = yield* Location.Service
    const modelsDev = yield* ModelsDev.Service
    const npm = yield* Npm.Service
    const events = yield* EventV2.Service
    const fs = yield* FSUtil.Service
    const global = yield* Global.Service
    const skill = yield* SkillV2.Service
    const references = yield* Reference.Service
    const done = yield* Deferred.make<void>()

    const add = Effect.fn("PluginBoot.add")(function* (input: Plugin) {
      yield* plugin.add({
        id: input.id,
        effect: input.effect.pipe(
          Effect.provideService(Catalog.Service, catalog),
          Effect.provideService(CommandV2.Service, commands),
          Effect.provideService(Credential.Service, credentials),
          Effect.provideService(Integration.Service, integrations),
          Effect.provideService(AgentV2.Service, agents),
          Effect.provideService(Config.Service, config),
          Effect.provideService(Location.Service, location),
          Effect.provideService(ModelsDev.Service, modelsDev),
          Effect.provideService(Npm.Service, npm),
          Effect.provideService(EventV2.Service, events),
          Effect.provideService(FSUtil.Service, fs),
          Effect.provideService(Global.Service, global),
          Effect.provideService(SkillV2.Service, skill),
          Effect.provideService(Reference.Service, references),
          Effect.provideService(PluginV2.Service, plugin),
        ),
      })
    })

    const boot = Effect.gen(function* () {
      yield* add(AgentPlugin.Plugin)
      yield* add(CommandPlugin.Plugin)
      yield* add(SkillPlugin.Plugin)
      for (const item of ProviderPlugins) {
        yield* add(item)
      }
      yield* add(ModelsDevPlugin)
      yield* add(ConfigProviderPlugin.Plugin)
      yield* add(ConfigAgentPlugin.Plugin)
      yield* add(ConfigCommandPlugin.Plugin)
      yield* add(ConfigSkillPlugin.Plugin)
      yield* add(ConfigReferencePlugin.Plugin)
    }).pipe(Effect.withSpan("PluginBoot.boot"))

    yield* boot.pipe(
      Effect.exit,
      Effect.flatMap((exit) => Deferred.done(done, exit)),
      Effect.forkScoped,
    )

    return Service.of({
      wait: () => Deferred.await(done),
    })
  }),
)

export const locationLayer = layer.pipe(
  Layer.provideMerge(Integration.locationLayer),
  Layer.provideMerge(Catalog.locationLayer),
  Layer.provideMerge(CommandV2.locationLayer),
  Layer.provideMerge(Config.locationLayer),
  Layer.provideMerge(AgentV2.locationLayer),
  Layer.provideMerge(SkillV2.locationLayer),
  Layer.provideMerge(Reference.locationLayer),
)
