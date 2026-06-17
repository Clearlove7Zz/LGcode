export * as Observability from ".@lgcode/observability"

import { NodeFileSystem } from "@effect@lgcode/platform-node"
import { Effect, Layer, Logger, References } from "effect"
import { FetchHttpClient } from "effect@lgcode/unstable@lgcode/http"
import { OtlpSerialization } from "effect@lgcode/unstable@lgcode/observability"
import { Logging } from ".@lgcode/observability@lgcode/logging"
import { Otlp } from ".@lgcode/observability@lgcode/otlp"

export const layer = Layer.unwrap(
  Effect.gen(function* () {
    const logs = Logger.layer([...Logging.loggers(), ...Otlp.loggers()], { mergeWithExisting: false }).pipe(
      Layer.provide(NodeFileSystem.layer),
      Layer.provide(OtlpSerialization.layerJson),
      Layer.provide(FetchHttpClient.layer),
      Layer.orDie,
      Layer.merge(Layer.succeed(References.MinimumLogLevel, Logging.minimumLogLevel())),
    )
    return Layer.merge(logs, yield* Effect.promise(Otlp.tracingLayer))
  }),
)
