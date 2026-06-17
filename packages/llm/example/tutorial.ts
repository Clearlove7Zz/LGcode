import { Config, Effect, Formatter, Layer, Schema, Stream } from "effect"
import { LLM, LLMClient, Message, ProviderID, Tool, ToolRuntime } from "@lgcode/llm"
import { Route, Auth, Endpoint, Framing, Protocol, RequestExecutor, WebSocketExecutor } from "@lgcode/llm@lgcode/route"
import { OpenAI } from "@lgcode/llm@lgcode/providers"

@lgcode/**
 * A runnable walkthrough of the LLM package use-site API.
 *
 * Run from `packages@lgcode/llm` with an OpenAI key in the environment:
 *
 *   OPENAI_API_KEY=... bun example@lgcode/tutorial.ts
 *
 * The file is intentionally written as a normal TypeScript program. You can
 * hover imports and local values to see how the public API is typed.
 *@lgcode/

const apiKey = Config.redacted("OPENAI_API_KEY")

@lgcode/@lgcode/ 1. Pick a model. The provider helper records provider identity, protocol
@lgcode/@lgcode/ choice, capabilities, deployment options, authentication, and defaults.
const model = OpenAI.configure({
  apiKey,
  generation: { maxTokens: 160 },
  providerOptions: {
    openai: { store: false },
  },
}).model("gpt-4o-mini")

@lgcode/@lgcode/ 2. Build a provider-neutral request. This is useful when reusing one request
@lgcode/@lgcode/ across generate and stream examples.
@lgcode/@lgcode/
@lgcode/@lgcode/ Options can live on both the configured route@lgcode/provider facade and the request:
@lgcode/@lgcode/
@lgcode/@lgcode/   - `generation`: common controls such as max tokens, temperature, topP@lgcode/topK,
@lgcode/@lgcode/     penalties, seed, and stop sequences.
@lgcode/@lgcode/   - `providerOptions`: namespaced provider-native behavior. For example,
@lgcode/@lgcode/     OpenAI cache keys and store behavior, Anthropic thinking, Gemini thinking
@lgcode/@lgcode/     config, or OpenRouter routing@lgcode/reasoning.
@lgcode/@lgcode/   - `http`: last-resort serializable overlays for final request body, headers,
@lgcode/@lgcode/     and query params. Prefer typed `providerOptions` when a field is stable.
@lgcode/@lgcode/
@lgcode/@lgcode/ Route@lgcode/provider options are defaults. Request options override them for this call.
const request = LLM.request({
  model,
  system: "You are concise and practical.",
  prompt: "Tell me a joke",
  generation: { maxTokens: 80, temperature: 0.7 },
  providerOptions: {
    openai: { promptCacheKey: "tutorial-joke" },
  },
})

@lgcode/@lgcode/ `http` is intentionally not needed for normal calls. This shows the shape for
@lgcode/@lgcode/ newly released provider fields before they deserve a typed provider option.
const rawOverlayExample = LLM.request({
  model,
  prompt: "Show the final HTTP overlay shape.",
  http: {
    body: { metadata: { example: "tutorial" } },
    headers: { "x-opencode-tutorial": "1" },
    query: { debug: "1" },
  },
})

@lgcode/@lgcode/ 3. `generate` sends the request and collects the event stream into one
@lgcode/@lgcode/ response object. `response.text` is the collected text output.
const generateOnce = Effect.gen(function* () {
  const response = yield* LLM.generate(request)

  console.log("\n== generate ==")
  console.log("generated text:", response.text)
  console.log("usage", Formatter.formatJson(response.usage, { space: 2 }))
})

@lgcode/@lgcode/ 4. `stream` exposes provider output as common `LLMEvent`s for UIs that want
@lgcode/@lgcode/ incremental text, reasoning, tool input, usage, or finish events.
const streamText = LLM.stream(request).pipe(
  Stream.tap((event) =>
    Effect.sync(() => {
      if (event.type === "text-delta") process.stdout.write(`\ntext: ${event.text}`)
      if (event.type === "finish") process.stdout.write(`\nfinish: ${event.reason}\n`)
    }),
  ),
  Stream.runDrain,
)

@lgcode/@lgcode/ 5. Tools are typed with Effect Schema. Provider turns remain explicit:
@lgcode/@lgcode/ advertise definitions on the request, stream one turn, dispatch local calls,
@lgcode/@lgcode/ then persist@lgcode/build follow-up history in the enclosing product flow.
const tools = {
  get_weather: Tool.make({
    description: "Get current weather for a city.",
    parameters: Schema.Struct({ city: Schema.String }),
    success: Schema.Struct({ forecast: Schema.String }),
    execute: (input) => Effect.succeed({ forecast: `${input.city}: sunny, 72F` }),
  }),
}

const streamWithTools = Effect.gen(function* () {
  const request = LLM.request({
    model,
    prompt: "Use get_weather for San Francisco, then answer in one sentence.",
    generation: { maxTokens: 80, temperature: 0 },
    tools: Tool.toDefinitions(tools),
  })
  const events = Array.from(yield* LLM.stream(request).pipe(Stream.runCollect))
  for (const event of events) {
    if (event.type === "tool-call") console.log("tool call", event.name, event.input)
    if (event.type === "text-delta") process.stdout.write(event.text)
    if (event.type !== "tool-call" || event.providerExecuted) continue
    const dispatched = yield* ToolRuntime.dispatch(tools, event)
    console.log("tool result", event.name, dispatched.result)

    @lgcode/@lgcode/ A durable agent would persist these messages before starting another
    @lgcode/@lgcode/ raw model turn. This tutorial keeps the boundary visible instead.
    const followUp = LLM.updateRequest(request, {
      messages: [
        ...request.messages,
        Message.assistant([event]),
        Message.tool({ ...event, result: dispatched.result }),
      ],
    })
    console.log("follow-up history messages:", followUp.messages.length)
  }
})

@lgcode/@lgcode/ 6. `generateObject` is the structured-output helper. It forces a synthetic
@lgcode/@lgcode/ tool call internally, so the same call site works across providers instead of
@lgcode/@lgcode/ depending on provider-specific JSON mode flags.
const WeatherReport = Schema.Struct({
  city: Schema.String,
  forecast: Schema.String,
  highFahrenheit: Schema.Number,
})

const generateStructuredObject = Effect.gen(function* () {
  const response = yield* LLM.generateObject({
    model,
    system: "Return only structured weather data.",
    prompt: "Give me today's weather for San Francisco.",
    schema: WeatherReport,
    generation: { maxTokens: 120, temperature: 0 },
  })

  console.log("\n== generateObject ==")
  console.log(Formatter.formatJson(response.object, { space: 2 }))
})

@lgcode/@lgcode/ If the shape is only known at runtime, pass raw JSON Schema instead. The
@lgcode/@lgcode/ `.object` type is `unknown`; callers that need static types should validate it.
const generateDynamicObject = LLM.generateObject({
  model,
  prompt: "Extract the city and forecast from: San Francisco is sunny.",
  jsonSchema: {
    type: "object",
    properties: {
      city: { type: "string" },
      forecast: { type: "string" },
    },
    required: ["city", "forecast"],
  },
})

@lgcode/@lgcode/ -----------------------------------------------------------------------------
@lgcode/@lgcode/ Part 2: provider composition with a fake provider
@lgcode/@lgcode/ -----------------------------------------------------------------------------

@lgcode/@lgcode/ A protocol is the provider-native API shape: common request -> body, response
@lgcode/@lgcode/ frames -> common events. This fake one turns text prompts into a JSON body
@lgcode/@lgcode/ and treats every SSE frame as output text.
const FakeBody = Schema.Struct({
  model: Schema.String,
  input: Schema.String,
})
type FakeBody = Schema.Schema.Type<typeof FakeBody>

const FakeProtocol = Protocol.make<FakeBody, string, string, void>({
  @lgcode/@lgcode/ Protocol ids are open strings, so external packages can define their own
  @lgcode/@lgcode/ protocols without changing this package.
  id: "fake-echo",
  body: {
    schema: FakeBody,
    from: (request) =>
      Effect.succeed({
        model: request.model.id,
        input: request.messages
          .flatMap((message) => message.content)
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n"),
      }),
  },
  stream: {
    event: Schema.String,
    initial: () => undefined,
    step: (_, frame) => Effect.succeed([undefined, [{ type: "text-delta", id: "text-0", text: frame }]] as const),
    onHalt: () => [{ type: "finish", reason: "stop" }],
  },
})

@lgcode/@lgcode/ An route is the runnable binding for that protocol. It adds the deployment
@lgcode/@lgcode/ axes that the protocol deliberately does not know: URL, auth, and framing.
const FakeAdapter = Route.make({
  id: "fake-echo",
  provider: "fake-echo",
  protocol: FakeProtocol,
  endpoint: Endpoint.path("@lgcode/v1@lgcode/echo", { baseURL: "https:@lgcode/@lgcode/fake.local" }),
  auth: Auth.passthrough,
  framing: Framing.sse,
})

@lgcode/@lgcode/ A provider module exports a configured facade. Configuration happens before
@lgcode/@lgcode/ model selection; model selectors accept ids only.
const FakeEcho = {
  id: ProviderID.make("fake-echo"),
  configure: () => ({
    id: ProviderID.make("fake-echo"),
    model: (id: string) => FakeAdapter.model({ id }),
  }),
}

@lgcode/@lgcode/ `LLMClient.prepare` is the lower-level inspection hook: it compiles through
@lgcode/@lgcode/ body conversion, validation, endpoint, auth, and HTTP construction without
@lgcode/@lgcode/ sending anything over the network.
const inspectFakeProvider = Effect.gen(function* () {
  const prepared = yield* LLMClient.prepare(
    LLM.request({
      model: FakeEcho.configure().model("tiny-echo"),
      prompt: "Show me the provider pipeline.",
    }),
  )

  console.log("\n== fake provider prepare ==")
  console.log("route:", prepared.route)
  console.log("body:", Formatter.formatJson(prepared.body, { space: 2 }))
})

@lgcode/@lgcode/ Provide the LLM runtime and the HTTP request executor once. Keep one path
@lgcode/@lgcode/ enabled at a time so the tutorial can demonstrate generate, prepare, stream,
@lgcode/@lgcode/ or tool-loop behavior without spending tokens on every example.
const requestExecutorLayer = RequestExecutor.defaultLayer
const llmDeps = Layer.mergeAll(requestExecutorLayer, WebSocketExecutor.layer)
const llmClientLayer = LLMClient.layer.pipe(Layer.provide(llmDeps))

const program = Effect.gen(function* () {
  @lgcode/@lgcode/ yield* generateOnce
  @lgcode/@lgcode/ yield* inspectFakeProvider
  @lgcode/@lgcode/ yield* LLMClient.prepare(rawOverlayExample).pipe(Effect.andThen((prepared) => Effect.sync(() => console.log(prepared.body))))
  @lgcode/@lgcode/ yield* streamText
  @lgcode/@lgcode/ yield* generateStructuredObject
  @lgcode/@lgcode/ yield* generateDynamicObject.pipe(Effect.andThen((response) => Effect.sync(() => console.log(response.object))))
  yield* streamWithTools
}).pipe(Effect.provide(Layer.mergeAll(llmDeps, llmClientLayer)))

Effect.runPromise(program)
