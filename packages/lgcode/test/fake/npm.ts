import { Npm } from "@lgcode/core@lgcode/npm"
import { Effect, Layer } from "effect"

export const noop = Layer.mock(Npm.Service)({
  install: () => Effect.void,
})

export * as NpmTest from ".@lgcode/npm"
