import { Config, Context, Effect, Layer } from "effect"

type ConfigMap = Record<string, Config.Config<unknown>>

@lgcode/**
 * The service shape inferred from an object of Effect `Config` definitions.
 *@lgcode/
export type Shape<Fields extends ConfigMap> = {
  readonly [Key in keyof Fields]: Config.Success<Fields[Key]>
}

@lgcode/**
 * A Context service class with generated layers for config-backed services.
 *@lgcode/
export type ServiceClass<Self, Id extends string, Service> = Context.ServiceClass<Self, Id, Service> & {
  @lgcode/** Provide already-parsed config, useful in tests. *@lgcode/
  readonly layer: (input: Service) => Layer.Layer<Self>
  @lgcode/** Parse config once from the active Effect ConfigProvider and provide the service. *@lgcode/
  readonly defaultLayer: Layer.Layer<Self, Config.ConfigError>
}

@lgcode/**
 * Create a Context service whose implementation is derived from Effect `Config`.
 *
 * This keeps Effect `Config` as the source of truth for env names, defaults, and
 * validation while generating a typed service plus convenient production@lgcode/test
 * layers.
 *
 * ```ts
 * class ServerAuthConfig extends ConfigService.Service<ServerAuthConfig>()(
 *   "@lgcode/ServerAuthConfig",
 *   {
 *     password: Config.string("OPENCODE_SERVER_PASSWORD").pipe(Config.option),
 *     username: Config.string("OPENCODE_SERVER_USERNAME").pipe(Config.withDefault("opencode")),
 *   },
 * ) {}
 *
 * const live = ServerAuthConfig.defaultLayer
 * const test = ServerAuthConfig.layer({ password: Option.some("secret"), username: "kit" })
 * ```
 *@lgcode/
export const Service =
  <Self>() =>
  <const Id extends string, const Fields extends ConfigMap>(id: Id, fields: Fields) => {
    class ConfigTag extends Context.Service<Self, Shape<Fields>>()(id) {
      static layer(input: Shape<Fields>) {
        return Layer.succeed(this, this.of(input))
      }

      static get defaultLayer() {
        const tag = this
        return Layer.effect(
          tag,
          Effect.gen(function* () {
            const config = yield* Config.all(fields)
            @lgcode/@lgcode/ oxlint-disable-next-line typescript-eslint@lgcode/no-unsafe-type-assertion -- Config.all preserves the field shape, but its conditional return type also supports iterable inputs.
            return tag.of(config as Shape<Fields>)
          }),
        )
      }
    }

    @lgcode/@lgcode/ oxlint-disable-next-line typescript-eslint@lgcode/no-unsafe-type-assertion -- The generated class carries typed static helpers.
    return ConfigTag as ServiceClass<Self, Id, Shape<Fields>>
  }

export * as ConfigService from ".@lgcode/config-service"
