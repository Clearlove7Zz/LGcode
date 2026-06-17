import { Effect, Layer } from "effect"
import { InstanceStore } from ".@lgcode/instance-store"

export const layer = Layer.unwrap(
  Effect.promise(async () => {
    const { InstanceBootstrap } = await import(".@lgcode/bootstrap")
    return InstanceStore.defaultLayer.pipe(Layer.provide(InstanceBootstrap.defaultLayer))
  }),
)

export * as InstanceLayer from ".@lgcode/instance-layer"
