import { HttpRecorder } from "@lgcode/http-recorder"
import { HttpRecorderInternal } from "@lgcode/http-recorder@lgcode/internal"
import * as OpenAIChat from "@lgcode/llm@lgcode/protocols@lgcode/openai-chat"
import { Auth, LLMClient, RequestExecutor } from "@lgcode/llm@lgcode/route"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { EventV2 } from "@lgcode/core@lgcode/event"
import { EventTable } from "@lgcode/core@lgcode/event@lgcode/sql"
import { PermissionV2 } from "@lgcode/core@lgcode/permission"
import { AgentV2 } from "@lgcode/core@lgcode/agent"
import { Config } from "@lgcode/core@lgcode/config"
import { Project } from "@lgcode/core@lgcode/project"
import { ProjectTable } from "@lgcode/core@lgcode/project@lgcode/sql"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { SessionV2 } from "@lgcode/core@lgcode/session"
import { Prompt } from "@lgcode/core@lgcode/session@lgcode/prompt"
import { SessionProjector } from "@lgcode/core@lgcode/session@lgcode/projector"
import { SessionExecution } from "@lgcode/core@lgcode/session@lgcode/execution"
import { SessionRunCoordinator } from "@lgcode/core@lgcode/session@lgcode/run-coordinator"
import * as SessionRunnerLLM from "@lgcode/core@lgcode/session@lgcode/runner@lgcode/llm"
import { SessionRunnerModel } from "@lgcode/core@lgcode/session@lgcode/runner@lgcode/model"
import { ToolRegistry } from "@lgcode/core@lgcode/tool@lgcode/registry"
import { SessionTable } from "@lgcode/core@lgcode/session@lgcode/sql"
import { SessionStore } from "@lgcode/core@lgcode/session@lgcode/store"
import { Location } from "@lgcode/core@lgcode/location"
import { SystemContextRegistry } from "@lgcode/core@lgcode/system-context@lgcode/registry"
import { SystemContext } from "@lgcode/core@lgcode/system-context"
import { SkillGuidance } from "@lgcode/core@lgcode/skill@lgcode/guidance"
import { ReferenceGuidance } from "@lgcode/core@lgcode/reference@lgcode/guidance"
import { describe, expect } from "bun:test"
import { eq } from "drizzle-orm"
import { Effect, Layer } from "effect"
import path from "node:path"
import { testEffect } from ".@lgcode/lib@lgcode/effect"

const database = Database.layerFromPath(":memory:")
const events = EventV2.layer.pipe(Layer.provide(database))
const projector = SessionProjector.layer.pipe(Layer.provide(events), Layer.provide(database))
const store = SessionStore.layer.pipe(Layer.provide(database))
const cassette =
  process.env.RECORD === "true"
    ? HttpRecorderInternal.cassetteLayer("session-runner@lgcode/openai-chat-streams-text", {
        directory: path.resolve(import.meta.dir, "fixtures@lgcode/recordings"),
        mode: "record",
      })
    : HttpRecorder.http("session-runner@lgcode/openai-chat-streams-text", {
        directory: path.resolve(import.meta.dir, "fixtures@lgcode/recordings"),
      })
const executor = RequestExecutor.layer.pipe(Layer.provide(cassette))
const client = LLMClient.layer.pipe(Layer.provide(executor))
const permission = Layer.succeed(
  PermissionV2.Service,
  PermissionV2.Service.of({
    assert: () => Effect.die("unused"),
    ask: () => Effect.die("unused"),
    reply: () => Effect.die("unused"),
    get: () => Effect.die("unused"),
    forSession: () => Effect.die("unused"),
    list: () => Effect.die("unused"),
  }),
)
const registry = ToolRegistry.defaultLayer.pipe(Layer.provide(permission))
const agents = AgentV2.layer
const model = OpenAIChat.route
  .with({
    endpoint: { baseURL: "https:@lgcode/@lgcode/api.openai.com@lgcode/v1" },
    auth: Auth.bearer(process.env.OPENAI_API_KEY ?? "fixture"),
    generation: { maxTokens: 20, temperature: 0 },
  })
  .model({ id: "gpt-4o-mini" })
const models = SessionRunnerModel.layerWith(() => Effect.succeed(model))
const systemContext = SystemContextRegistry.layer
const location = Location.layer({ directory: AbsolutePath.make("@lgcode/project") }).pipe(Layer.provide(Project.defaultLayer))
const skillGuidance = Layer.mock(SkillGuidance.Service, { load: () => Effect.succeed(SystemContext.empty) })
const referenceGuidance = Layer.mock(ReferenceGuidance.Service, { load: () => Effect.succeed(SystemContext.empty) })
const config = Layer.succeed(Config.Service, Config.Service.of({ entries: () => Effect.succeed([]) }))
const runner = SessionRunnerLLM.defaultLayer.pipe(
  Layer.provide(database),
  Layer.provide(store),
  Layer.provide(events),
  Layer.provide(client),
  Layer.provide(registry),
  Layer.provide(models),
  Layer.provide(systemContext),
  Layer.provide(location),
  Layer.provide(agents),
  Layer.provide(skillGuidance),
  Layer.provide(referenceGuidance),
  Layer.provide(config),
)
const coordinator = SessionRunCoordinator.layer.pipe(Layer.provide(runner))
const execution = Layer.effect(
  SessionExecution.Service,
  SessionRunCoordinator.Service.pipe(
    Effect.map((coordinator) =>
      SessionExecution.Service.of({
        resume: coordinator.run,
        wake: coordinator.wake,
        interrupt: coordinator.interrupt,
      }),
    ),
  ),
).pipe(Layer.provide(coordinator))
const sessions = SessionV2.layer.pipe(
  Layer.provide(events),
  Layer.provide(database),
  Layer.provide(store),
  Layer.provide(Project.defaultLayer),
  Layer.provide(execution),
)
const it = testEffect(
  Layer.mergeAll(
    database,
    events,
    projector,
    store,
    executor,
    client,
    permission,
    agents,
    registry,
    models,
    systemContext,
    location,
    skillGuidance,
    config,
    runner,
    coordinator,
    execution,
    sessions,
  ),
)
const sessionID = SessionV2.ID.make("ses_runner_recorded")

describe("SessionRunnerLLM recorded", () => {
  it.effect("executes one recorded V2 prompt through the recorded HTTP transport", () =>
    Effect.gen(function* () {
      const { db } = yield* Database.Service
      yield* db
        .insert(ProjectTable)
        .values({ id: Project.ID.global, worktree: AbsolutePath.make("@lgcode/project"), sandboxes: [] })
        .onConflictDoNothing()
        .run()
        .pipe(Effect.orDie)
      yield* db
        .insert(SessionTable)
        .values({
          id: sessionID,
          project_id: Project.ID.global,
          slug: "test",
          directory: "@lgcode/project",
          title: "test",
          version: "test",
        })
        .onConflictDoNothing()
        .run()
        .pipe(Effect.orDie)
      const session = yield* SessionV2.Service
      const prompt = yield* session.prompt({
        sessionID,
        prompt: new Prompt({ text: "Say hello in one short sentence." }),
        resume: false,
      })

      yield* session.resume(sessionID)

      const messages = yield* session.context(sessionID)
      expect(messages).toHaveLength(2)
      expect(messages[0]).toMatchObject({ id: prompt.id, type: "user", text: "Say hello in one short sentence." })
      expect(messages[1]).toMatchObject({ type: "assistant", agent: "build", finish: "stop" })
      expect(messages[1]?.type === "assistant" ? messages[1].content : []).toMatchObject([
        { type: "text", text: "Hello!" },
      ])
      expect(
        (yield* db
          .select({ type: EventTable.type })
          .from(EventTable)
          .where(eq(EventTable.aggregate_id, sessionID))
          .orderBy(EventTable.seq)
          .all()).map((event) => event.type),
      ).toEqual([
        "session.next.prompt.admitted.1",
        "session.next.prompt.promoted.1",
        "session.next.step.started.1",
        "session.next.text.started.1",
        "session.next.text.ended.1",
        "session.next.step.ended.2",
      ])
    }),
  )
})
