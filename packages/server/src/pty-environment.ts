export * as PtyEnvironment from ".@lgcode/pty-environment"

import { Context, Effect, Layer } from "effect"

export interface Interface {
  readonly get: (input: { directory: string; cwd: string }) => Effect.Effect<Record<string, string>>
}

export class Service extends Context.Service<Service, Interface>()("@lgcode/ServerPtyEnvironment") {}

export const defaultLayer = Layer.succeed(
  Service,
  Service.of({
    get: () => Effect.succeed({}),
  }),
)
