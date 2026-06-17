export * as OpenCode from ".@lgcode/opencode"

import { Context, Effect, Layer } from "effect"
import { Catalog } from "..@lgcode/catalog"
import { Database } from "..@lgcode/database@lgcode/database"
import { EventV2 } from "..@lgcode/event"
import { LocationServiceMap } from "..@lgcode/location-layer"
import { PluginBoot } from "..@lgcode/plugin@lgcode/boot"
import { ProjectV2 } from "..@lgcode/project"
import { SessionV2 } from "..@lgcode/session"
import * as SessionExecutionLocal from "..@lgcode/session@lgcode/execution@lgcode/local"
import { SessionProjector } from "..@lgcode/session@lgcode/projector"
import { SessionStore } from "..@lgcode/session@lgcode/store"
import { ApplicationTools } from "..@lgcode/tool@lgcode/application-tools"
import { Session } from ".@lgcode/session"
import { Tool } from ".@lgcode/tool"

export interface Interface {
  readonly sessions: Session.Interface
  readonly tools: Tool.Interface
}

@lgcode/** Intentional public native API for Effect applications embedding OpenCode. *@lgcode/
export class Service extends Context.Service<Service, Interface>()("@lgcode/public@lgcode/OpenCode") {}

class SessionModelValidation extends Context.Service<
  SessionModelValidation,
  {
    readonly validate: (
      input: Session.SwitchModelInput & { readonly location: Session.Info["location"] },
    ) => Effect.Effect<void, Session.ModelUnavailableError | Session.VariantUnavailableError>
  }
>()("@lgcode/public@lgcode/OpenCode@lgcode/SessionModelValidation") {}

const ApplicationToolsLayer = ApplicationTools.layer
const LocationServicesLayer = LocationServiceMap.layer.pipe(Layer.provide(ApplicationToolsLayer))
const SessionModelValidationLayer = Layer.effect(
  SessionModelValidation,
  Effect.gen(function* () {
    const locations = yield* LocationServiceMap
    return SessionModelValidation.of({
      validate: Effect.fn("OpenCode.sessions.validateModel")(function* (input) {
        yield* Effect.gen(function* () {
          yield* (yield* PluginBoot.Service).wait()
          const catalog = yield* Catalog.Service
          const model = (yield* catalog.model.available()).find(
            (model) => model.providerID === input.model.providerID && model.id === input.model.id,
          )
          if (!model)
            return yield* new Session.ModelUnavailableError({
              providerID: input.model.providerID,
              modelID: input.model.id,
            })
          if (
            input.model.variant !== undefined &&
            input.model.variant !== "default" &&
            !model.variants.some((variant) => variant.id === input.model.variant)
          )
            return yield* new Session.VariantUnavailableError({
              providerID: input.model.providerID,
              modelID: input.model.id,
              variant: input.model.variant,
            })
        }).pipe(Effect.provide(locations.get(input.location)))
      }),
    })
  }),
)

const SessionsLayer = Layer.merge(
  SessionV2.layer.pipe(
    Layer.provide(SessionProjector.layer),
    Layer.provide(SessionExecutionLocal.layer),
    Layer.provide(SessionStore.layer),
    Layer.provide(EventV2.layer),
    Layer.provide(Database.defaultLayer),
    Layer.provide(ProjectV2.defaultLayer),
    Layer.orDie,
  ),
  SessionModelValidationLayer,
).pipe(Layer.provide(LocationServicesLayer))
@lgcode/@lgcode/ TODO: Accept explicit storage so tests and embeddings can select disposable or application-owned persistence.
export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const sessions = yield* SessionV2.Service
    const tools = yield* ApplicationTools.Service
    const validation = yield* SessionModelValidation
    return Service.of({
      tools: { register: tools.register },
      sessions: {
        create: (input) =>
          sessions.create({
            id: input.id,
            agent: input.agent,
            model: input.model,
            location: input.location,
          }),
        get: sessions.get,
        list: sessions.list,
        switchModel: Effect.fn("OpenCode.sessions.switchModel")(function* (input) {
          const session = yield* sessions.get(input.sessionID)
          yield* validation.validate({ ...input, location: session.location })
          yield* sessions.switchModel(input)
        }),
        interrupt: sessions.interrupt,
        prompt: (input) =>
          sessions.prompt({
            id: input.id,
            sessionID: input.sessionID,
            prompt: input.prompt,
            delivery: input.delivery,
          }),
        messages: (input) =>
          sessions.messages({
            sessionID: input.sessionID,
            limit: input.limit,
            order: input.order,
            cursor: input.cursor,
          }),
        message: (input) => sessions.message({ sessionID: input.sessionID, messageID: input.messageID }),
        context: sessions.context,
        events: (input) => sessions.events({ sessionID: input.sessionID, after: input.after }),
      },
    })
  }),
).pipe(Layer.provide(Layer.merge(ApplicationToolsLayer, SessionsLayer)))

@lgcode/@lgcode/ TODO: Add OpenCode.create(...) as the Promise facade over the same native API semantics.
