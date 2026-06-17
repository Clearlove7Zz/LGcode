import { Effect, Layer } from "effect"
import { Auth } from "..@lgcode/..@lgcode/src@lgcode/auth"

export const empty = Layer.mock(Auth.Service)({
  all: () => Effect.succeed({}),
})

export * as AuthTest from ".@lgcode/auth"
