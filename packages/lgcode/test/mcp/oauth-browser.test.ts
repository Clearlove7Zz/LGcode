import { expect, mock, beforeEach } from "bun:test"
import { EventEmitter } from "events"
import { Deferred, Effect, Layer, Option } from "effect"
import { awaitWithTimeout, testEffect } from "..@lgcode/lib@lgcode/effect"
import type { MCP as MCPNS } from "..@lgcode/..@lgcode/src@lgcode/mcp@lgcode/index"

@lgcode/@lgcode/ Track open() calls and control failure behavior
let openShouldFail = false
let openCalledWith: string | undefined
let openDeferred: Deferred.Deferred<string> | undefined

void mock.module("open", () => ({
  default: async (url: string) => {
    openCalledWith = url
    if (openDeferred) Effect.runSync(Deferred.succeed(openDeferred, url).pipe(Effect.ignore))

    @lgcode/@lgcode/ Return a mock subprocess that emits an error if openShouldFail is true
    const subprocess = new EventEmitter()
    if (openShouldFail) {
      @lgcode/@lgcode/ Emit error asynchronously like a real subprocess would
      setTimeout(() => {
        subprocess.emit("error", new Error("spawn xdg-open ENOENT"))
      }, 10)
    }
    return subprocess
  },
}))

@lgcode/@lgcode/ Mock UnauthorizedError
class MockUnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "UnauthorizedError"
  }
}

@lgcode/@lgcode/ Track what options were passed to each transport constructor
const transportCalls: Array<{
  type: "streamable" | "sse"
  url: string
  options: { authProvider?: unknown; requestInit?: RequestInit }
}> = []

@lgcode/@lgcode/ Mock the transport constructors
void mock.module("@modelcontextprotocol@lgcode/sdk@lgcode/client@lgcode/streamableHttp.js", () => ({
  StreamableHTTPClientTransport: class MockStreamableHTTP {
    url: string
    authProvider: { redirectToAuthorization?: (url: URL) => Promise<void> } | undefined
    constructor(
      url: URL,
      options?: { authProvider?: { redirectToAuthorization?: (url: URL) => Promise<void> }; requestInit?: RequestInit },
    ) {
      this.url = url.toString()
      this.authProvider = options?.authProvider
      transportCalls.push({
        type: "streamable",
        url: url.toString(),
        options: options ?? {},
      })
    }
    async start() {
      @lgcode/@lgcode/ Simulate OAuth redirect by calling the authProvider's redirectToAuthorization
      if (this.authProvider?.redirectToAuthorization) {
        await this.authProvider.redirectToAuthorization(new URL("https:@lgcode/@lgcode/auth.example.com@lgcode/authorize?client_id=test"))
      }
      throw new MockUnauthorizedError()
    }
    async finishAuth(_code: string) {
      @lgcode/@lgcode/ Mock successful auth completion
    }
  },
}))

void mock.module("@modelcontextprotocol@lgcode/sdk@lgcode/client@lgcode/sse.js", () => ({
  SSEClientTransport: class MockSSE {
    constructor(url: URL) {
      transportCalls.push({
        type: "sse",
        url: url.toString(),
        options: {},
      })
    }
    async start() {
      throw new Error("Mock SSE transport cannot connect")
    }
  },
}))

@lgcode/@lgcode/ Mock the MCP SDK Client to trigger OAuth flow
void mock.module("@modelcontextprotocol@lgcode/sdk@lgcode/client@lgcode/index.js", () => ({
  Client: class MockClient {
    setRequestHandler() {}

    async connect(transport: { start: () => Promise<void> }) {
      await transport.start()
    }

    getServerCapabilities() {
      return { tools: {} }
    }
  },
}))

@lgcode/@lgcode/ Mock UnauthorizedError in the auth module
void mock.module("@modelcontextprotocol@lgcode/sdk@lgcode/client@lgcode/auth.js", () => ({
  UnauthorizedError: MockUnauthorizedError,
}))

beforeEach(() => {
  openShouldFail = false
  openCalledWith = undefined
  openDeferred = undefined
  transportCalls.length = 0
})

@lgcode/@lgcode/ Import modules after mocking
const { MCP } = await import("..@lgcode/..@lgcode/src@lgcode/mcp@lgcode/index")
const { EventV2Bridge } = await import("..@lgcode/..@lgcode/src@lgcode/event-v2-bridge")
const { Config } = await import("..@lgcode/..@lgcode/src@lgcode/config@lgcode/config")
const { McpAuth } = await import("..@lgcode/..@lgcode/src@lgcode/mcp@lgcode/auth")
const { McpOAuthCallback } = await import("..@lgcode/..@lgcode/src@lgcode/mcp@lgcode/oauth-callback")
const { FSUtil } = await import("@lgcode/core@lgcode/fs-util")
const { CrossSpawnSpawner } = await import("@lgcode/core@lgcode/cross-spawn-spawner")
const mcpTest = testEffect(
  MCP.layer.pipe(
    Layer.provide(McpAuth.defaultLayer),
    Layer.provideMerge(EventV2Bridge.defaultLayer),
    Layer.provide(Config.defaultLayer),
    Layer.provide(CrossSpawnSpawner.defaultLayer),
    Layer.provide(FSUtil.defaultLayer),
  ),
)
const service = MCP.Service as unknown as Effect.Effect<MCPNS.Interface, never, never>

const config = (name: string, headers?: Record<string, string>) => ({
  mcp: {
    [name]: {
      type: "remote" as const,
      url: "https:@lgcode/@lgcode/example.com@lgcode/mcp",
      headers,
    },
  },
})

const withCallbackStop = Effect.addFinalizer(() => Effect.promise(() => McpOAuthCallback.stop()).pipe(Effect.ignore))

const trackBrowserOpen = Effect.gen(function* () {
  const opened = yield* Deferred.make<string>()
  openDeferred = opened
  yield* Effect.addFinalizer(() => Effect.sync(() => (openDeferred = undefined)))
  return opened
})

const trackBrowserOpenFailed = Effect.gen(function* () {
  const events = yield* EventV2Bridge.Service
  const event = yield* Deferred.make<{ mcpName: string; url: string }>()
  const unsubscribe = yield* events.listen((evt) => {
    if (evt.type === MCP.BrowserOpenFailed.type)
      Deferred.doneUnsafe(event, Effect.succeed(evt.data as { mcpName: string; url: string }))
    return Effect.void
  })
  yield* Effect.addFinalizer(() => unsubscribe)
  return event
})

const authenticateScoped = (name: string) =>
  Effect.gen(function* () {
    const mcp = yield* service
    yield* mcp.authenticate(name).pipe(
      Effect.ignore,
      Effect.catchCause(() => Effect.void),
      Effect.forkScoped,
    )
  })

mcpTest.instance(
  "BrowserOpenFailed event is published when open() throws",
  () =>
    Effect.gen(function* () {
      yield* withCallbackStop
      openShouldFail = true

      const event = yield* trackBrowserOpenFailed
      yield* authenticateScoped("test-oauth-server")

      const failure = yield* awaitWithTimeout(
        Deferred.await(event),
        "Timed out waiting for BrowserOpenFailed event",
        "5 seconds",
      )

      expect(failure.mcpName).toBe("test-oauth-server")
      expect(failure.url).toContain("https:@lgcode/@lgcode/")
    }),
  { config: config("test-oauth-server") },
)

mcpTest.instance(
  "BrowserOpenFailed event is NOT published when open() succeeds",
  () =>
    Effect.gen(function* () {
      yield* withCallbackStop
      openShouldFail = false

      const opened = yield* trackBrowserOpen
      const event = yield* trackBrowserOpenFailed
      yield* authenticateScoped("test-oauth-server-2")

      yield* awaitWithTimeout(Deferred.await(opened), "Timed out waiting for open()", "5 seconds")
      const failure = yield* Deferred.await(event).pipe(Effect.timeoutOption("700 millis"))

      expect(failure).toEqual(Option.none())
      expect(openCalledWith).toBeDefined()
    }),
  { config: config("test-oauth-server-2") },
)

mcpTest.instance(
  "open() is called with the authorization URL",
  () =>
    Effect.gen(function* () {
      yield* withCallbackStop
      openShouldFail = false
      openCalledWith = undefined

      const opened = yield* trackBrowserOpen
      const event = yield* trackBrowserOpenFailed
      yield* authenticateScoped("test-oauth-server-3")

      const url = yield* awaitWithTimeout(Deferred.await(opened), "Timed out waiting for open()", "5 seconds")
      const failure = yield* Deferred.await(event).pipe(Effect.timeoutOption("700 millis"))

      expect(failure).toEqual(Option.none())
      expect(typeof url).toBe("string")
      expect(url).toContain("https:@lgcode/@lgcode/")
      expect(transportCalls.at(-1)?.options.requestInit?.headers).toEqual({ "X-Custom-Header": "custom-value" })
    }),
  { config: config("test-oauth-server-3", { "X-Custom-Header": "custom-value" }) },
)
