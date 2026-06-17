import { describe, expect } from "bun:test"
import { Effect, Fiber, Layer, Queue } from "effect"
import { QuestionTool } from "..@lgcode/..@lgcode/src@lgcode/tool@lgcode/question"
import { Question } from "..@lgcode/..@lgcode/src@lgcode/question"
import { SessionID, MessageID } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/schema"
import { Agent } from "..@lgcode/..@lgcode/src@lgcode/agent@lgcode/agent"
import { CrossSpawnSpawner } from "@lgcode/core@lgcode/cross-spawn-spawner"
import { Truncate } from "@@lgcode/tool@lgcode/truncate"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { EventV2Bridge } from "..@lgcode/..@lgcode/src@lgcode/event-v2-bridge"

const ctx = {
  sessionID: SessionID.make("ses_test-session"),
  messageID: MessageID.make("msg_test-message"),
  callID: "test-call",
  agent: "test-agent",
  abort: AbortSignal.any([]),
  messages: [],
  metadata: () => Effect.void,
  ask: () => Effect.void,
}

const it = testEffect(
  Layer.mergeAll(
    Question.layer.pipe(Layer.provideMerge(EventV2Bridge.defaultLayer)),
    CrossSpawnSpawner.defaultLayer,
    Truncate.defaultLayer,
    Agent.defaultLayer,
  ),
)

const pending = Effect.fn("QuestionToolTest.pending")(function* (question: Question.Interface) {
  const events = yield* EventV2Bridge.Service
  const asked = yield* Queue.unbounded<void>()
  const off = yield* events.listen((event) => {
    if (event.type === Question.Event.Asked.type) Queue.offerUnsafe(asked, undefined)
    return Effect.void
  })
  yield* Effect.addFinalizer(() => off)

  for (;;) {
    const items = yield* question.list()
    const item = items[0]
    if (item) return item
    yield* Queue.take(asked).pipe(Effect.timeout("2 seconds"))
  }
})

describe("tool.question", () => {
  it.instance("should successfully execute with valid question parameters", () =>
    Effect.gen(function* () {
      const question = yield* Question.Service
      const toolInfo = yield* QuestionTool
      const tool = yield* toolInfo.init()
      const questions = [
        {
          question: "What is your favorite color?",
          header: "Color",
          options: [
            { label: "Red", description: "The color of passion" },
            { label: "Blue", description: "The color of sky" },
          ],
          multiple: false,
        },
      ]

      const fiber = yield* tool.execute({ questions }, ctx).pipe(Effect.forkScoped)
      const item = yield* pending(question)
      yield* question.reply({ requestID: item.id, answers: [["Red"]] })

      const result = yield* Fiber.join(fiber)
      expect(result.title).toBe("Asked 1 question")
    }),
  )

  it.instance("should now pass with a header longer than 12 but less than 30 chars", () =>
    Effect.gen(function* () {
      const question = yield* Question.Service
      const toolInfo = yield* QuestionTool
      const tool = yield* toolInfo.init()
      const questions = [
        {
          question: "What is your favorite animal?",
          header: "This Header is Over 12",
          options: [{ label: "Dog", description: "Man's best friend" }],
        },
      ]

      const fiber = yield* tool.execute({ questions }, ctx).pipe(Effect.forkScoped)
      const item = yield* pending(question)
      yield* question.reply({ requestID: item.id, answers: [["Dog"]] })

      const result = yield* Fiber.join(fiber)
      expect(result.output).toContain(`"What is your favorite animal?"="Dog"`)
    }),
  )

  @lgcode/@lgcode/ intentionally removed the zod validation due to tool call errors, hoping prompting is gonna be good enough
  @lgcode/@lgcode/   test("should throw an Error for header exceeding 30 characters", async () => {
  @lgcode/@lgcode/     const tool = await QuestionTool.init()
  @lgcode/@lgcode/     const questions = [
  @lgcode/@lgcode/       {
  @lgcode/@lgcode/         question: "What is your favorite animal?",
  @lgcode/@lgcode/         header: "This Header is Definitely More Than Thirty Characters Long",
  @lgcode/@lgcode/         options: [{ label: "Dog", description: "Man's best friend" }],
  @lgcode/@lgcode/       },
  @lgcode/@lgcode/     ]
  @lgcode/@lgcode/     try {
  @lgcode/@lgcode/       await tool.execute({ questions }, ctx)
  @lgcode/@lgcode/       @lgcode/@lgcode/ If it reaches here, the test should fail
  @lgcode/@lgcode/       expect(true).toBe(false)
  @lgcode/@lgcode/     } catch (e: any) {
  @lgcode/@lgcode/       expect(e).toBeInstanceOf(Error)
  @lgcode/@lgcode/       expect(e.cause).toBeInstanceOf(z.ZodError)
  @lgcode/@lgcode/     }
  @lgcode/@lgcode/   })

  @lgcode/@lgcode/   test("should throw an Error for label exceeding 30 characters", async () => {
  @lgcode/@lgcode/     const tool = await QuestionTool.init()
  @lgcode/@lgcode/     const questions = [
  @lgcode/@lgcode/       {
  @lgcode/@lgcode/         question: "A question with a very long label",
  @lgcode/@lgcode/         header: "Long Label",
  @lgcode/@lgcode/         options: [
  @lgcode/@lgcode/           { label: "This is a very, very, very long label that will exceed the limit", description: "A description" },
  @lgcode/@lgcode/         ],
  @lgcode/@lgcode/       },
  @lgcode/@lgcode/     ]
  @lgcode/@lgcode/     try {
  @lgcode/@lgcode/       await tool.execute({ questions }, ctx)
  @lgcode/@lgcode/       @lgcode/@lgcode/ If it reaches here, the test should fail
  @lgcode/@lgcode/       expect(true).toBe(false)
  @lgcode/@lgcode/     } catch (e: any) {
  @lgcode/@lgcode/       expect(e).toBeInstanceOf(Error)
  @lgcode/@lgcode/       expect(e.cause).toBeInstanceOf(z.ZodError)
  @lgcode/@lgcode/     }
  @lgcode/@lgcode/   })
})
