import path from "path"
import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { Catalog } from "@lgcode/core/catalog"
import { Integration } from "@lgcode/core/integration"
import { Credential } from "@lgcode/core/credential"
import { Database } from "@lgcode/core/database/database"
import { EventV2 } from "@lgcode/core/event"
import { Flag } from "@lgcode/core/flag/flag"
import { Location } from "@lgcode/core/location"
import { ModelsDev } from "@lgcode/core/models-dev"
import { PluginV2 } from "@lgcode/core/plugin"
import { ModelsDevPlugin } from "@lgcode/core/plugin/models-dev"
import { Policy } from "@lgcode/core/policy"
import { AbsolutePath } from "@lgcode/core/schema"
import { location } from "../fixture/location"
import { testEffect } from "../lib/effect"

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
          path: Flag.LGCODE_MODELS_PATH,
          disabled: Flag.LGCODE_DISABLE_MODELS_FETCH,
        }
        Flag.LGCODE_MODELS_PATH = path.join(import.meta.dir, "fixtures", "models-dev.json")
        Flag.LGCODE_DISABLE_MODELS_FETCH = true
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
          Flag.LGCODE_MODELS_PATH = previous.path
          Flag.LGCODE_DISABLE_MODELS_FETCH = previous.disabled
        }),
    ),
  )
})
