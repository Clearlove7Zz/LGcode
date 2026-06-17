import path from "path"
import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { Catalog } from "@lgcode/core@lgcode/catalog"
import { Integration } from "@lgcode/core@lgcode/integration"
import { Credential } from "@lgcode/core@lgcode/credential"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { EventV2 } from "@lgcode/core@lgcode/event"
import { Flag } from "@lgcode/core@lgcode/flag@lgcode/flag"
import { Location } from "@lgcode/core@lgcode/location"
import { ModelsDev } from "@lgcode/core@lgcode/models-dev"
import { PluginV2 } from "@lgcode/core@lgcode/plugin"
import { ModelsDevPlugin } from "@lgcode/core@lgcode/plugin@lgcode/models-dev"
import { Policy } from "@lgcode/core@lgcode/policy"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { location } from "..@lgcode/fixture@lgcode/location"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const events = EventV2.defaultLayer
const locationLayer = Layer.succeed(
  Location.Service,
  Location.Service.of(location({ directory: AbsolutePath.make(import.meta.dir) })),
)
const plugins = PluginV2.layer.pipe(Layer.provide(events))
const policy = Policy.layer.pipe(Layer.provide(locationLayer))
const connections = Credential.layer.pipe(
  Layer.fresh,
  Layer.provide(Database.layerFromPath(":memory:").pipe(Layer.fresh)),
  Layer.provide(events),
)
const integrations = Integration.locationLayer.pipe(Layer.provide(events), Layer.provide(connections))
const catalog = Catalog.layer.pipe(
  Layer.provide(Layer.mergeAll(events, locationLayer, plugins, policy, connections, integrations)),
)
const layer = Layer.mergeAll(
  catalog.pipe(Layer.provide(connections)),
  integrations,
  connections,
  events,
  locationLayer,
  plugins,
)
const it = testEffect(layer)

describe("ModelsDevPlugin", () => {
  it.effect("registers key methods for providers with environment variables", () =>
    Effect.acquireUseRelease(
      Effect.sync(() => {
        const previous = {
          path: Flag.OPENCODE_MODELS_PATH,
          disabled: Flag.OPENCODE_DISABLE_MODELS_FETCH,
        }
        Flag.OPENCODE_MODELS_PATH = path.join(import.meta.dir, "fixtures", "models-dev.json")
        Flag.OPENCODE_DISABLE_MODELS_FETCH = true
        return previous
      }),
      () =>
        Effect.gen(function* () {
          yield* ModelsDevPlugin.effect
          const integrations = yield* Integration.Service
          expect(yield* integrations.list()).toEqual([
            new Integration.Info({
              id: Integration.ID.make("acme"),
              name: "Acme",
              methods: [
                { type: "key" },
                {
                  type: "env",
                  names: ["ACME_API_KEY"],
                },
              ],
              connections: [],
            }),
          ])
        }).pipe(Effect.provide(ModelsDev.defaultLayer)),
      (previous) =>
        Effect.sync(() => {
          Flag.OPENCODE_MODELS_PATH = previous.path
          Flag.OPENCODE_DISABLE_MODELS_FETCH = previous.disabled
        }),
    ),
  )
})
