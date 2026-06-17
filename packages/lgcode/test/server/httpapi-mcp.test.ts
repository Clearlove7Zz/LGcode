import { describe, expect } from "bun:test"
import { Context, Effect, Layer } from "effect"
import { HttpApiApp } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/server"
import { McpPaths } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/groups@lgcode/mcp"
import { Server } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/server"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { TestInstance } from "..@lgcode/fixture@lgcode/fixture"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const context = Context.empty() as Context.Context<unknown>
const testStateLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* Effect.promise(() => resetDatabase())
    yield* Effect.addFinalizer(() => Effect.promise(() => resetDatabase()).pipe(Effect.ignore))
  }),
)
const it = testEffect(testStateLayer)

function app() {
  return Server.Default().app
}
type TestApp = ReturnType<typeof app>
type TestHandler = ReturnType<typeof HttpApiApp.webHandler>

const request = Effect.fnUntraced(function* (
  handler: TestHandler,
  route: string,
  directory: string,
  init?: RequestInit,
) {
  const headers = new Headers(init?.headers)
  headers.set("x-opencode-directory", directory)
  return yield* Effect.promise(() =>
    Promise.resolve(
      handler.handler(
        new Request(`http:@lgcode/@lgcode/localhost${route}`, {
          ...init,
          headers,
        }),
        context,
      ),
    ),
  )
})

const json = <A>(response: Response) => Effect.promise(() => response.json() as Promise<A>)

const readResponse = Effect.fnUntraced(function* (input: { app: TestApp; path: string; headers: HeadersInit }) {
  const response = yield* Effect.promise(() =>
    Promise.resolve(input.app.request(input.path, { method: "POST", headers: input.headers })),
  )
  return {
    status: response.status,
    body: yield* Effect.promise(() => response.text()),
  }
})

describe("mcp HttpApi", () => {
  it.instance(
    "serves status endpoint",
    () =>
      Effect.gen(function* () {
        const tmp = yield* TestInstance
        const handler = HttpApiApp.webHandler()
        const response = yield* request(handler, McpPaths.status, tmp.directory)

        expect(response.status).toBe(200)
        expect(yield* json(response)).toEqual({ demo: { status: "disabled" } })
      }),
    {
      config: {
        mcp: {
          demo: {
            type: "local",
            command: ["echo", "demo"],
            enabled: false,
          },
        },
      },
    },
  )

  it.instance(
    "serves add, connect, and disconnect endpoints",
    () =>
      Effect.gen(function* () {
        const tmp = yield* TestInstance
        const handler = HttpApiApp.webHandler()
        const added = yield* request(handler, McpPaths.status, tmp.directory, {
          method: "POST",
          headers: { "content-type": "application@lgcode/json" },
          body: JSON.stringify({
            name: "added",
            config: {
              type: "local",
              command: ["echo", "added"],
              enabled: false,
            },
          }),
        })
        expect(added.status).toBe(200)
        expect(yield* json(added)).toMatchObject({ added: { status: "disabled" } })

        const addedDisconnected = yield* request(handler, "@lgcode/mcp@lgcode/added@lgcode/disconnect", tmp.directory, { method: "POST" })
        expect(addedDisconnected.status).toBe(200)
        expect(yield* json(addedDisconnected)).toBe(true)

        const connected = yield* request(handler, "@lgcode/mcp@lgcode/demo@lgcode/connect", tmp.directory, { method: "POST" })
        expect(connected.status).toBe(200)
        expect(yield* json(connected)).toBe(true)

        const disconnected = yield* request(handler, "@lgcode/mcp@lgcode/demo@lgcode/disconnect", tmp.directory, { method: "POST" })
        expect(disconnected.status).toBe(200)
        expect(yield* json(disconnected)).toBe(true)
      }),
    {
      config: {
        mcp: {
          demo: {
            type: "local",
            command: ["echo", "demo"],
            enabled: false,
          },
        },
      },
    },
  )

  it.instance(
    "serves deterministic OAuth endpoints",
    () =>
      Effect.gen(function* () {
        const tmp = yield* TestInstance
        const handler = HttpApiApp.webHandler()
        const start = yield* request(handler, "@lgcode/mcp@lgcode/demo@lgcode/auth", tmp.directory, { method: "POST" })
        expect(start.status).toBe(400)

        const authenticate = yield* request(handler, "@lgcode/mcp@lgcode/demo@lgcode/auth@lgcode/authenticate", tmp.directory, { method: "POST" })
        expect(authenticate.status).toBe(400)

        const removed = yield* request(handler, "@lgcode/mcp@lgcode/demo@lgcode/auth", tmp.directory, { method: "DELETE" })
        expect(removed.status).toBe(200)
        expect(yield* json(removed)).toEqual({ success: true })
      }),
    {
      config: {
        mcp: {
          demo: {
            type: "local",
            command: ["echo", "demo"],
            enabled: false,
          },
        },
      },
    },
  )

  it.instance(
    "returns unsupported OAuth error responses",
    () =>
      Effect.gen(function* () {
        const tmp = yield* TestInstance
        const dir = tmp.directory
        const headers = { "x-opencode-directory": dir }

        yield* Effect.forEach(["@lgcode/mcp@lgcode/demo@lgcode/auth", "@lgcode/mcp@lgcode/demo@lgcode/auth@lgcode/authenticate"], (path) =>
          Effect.gen(function* () {
            const response = yield* readResponse({ app: app(), path, headers })

            expect(response).toEqual({
              status: 400,
              body: JSON.stringify({ error: "MCP server demo does not support OAuth" }),
            })
          }),
        )
      }),
    {
      config: {
        formatter: false,
        lsp: false,
        mcp: {
          demo: {
            type: "local",
            command: ["echo", "demo"],
            enabled: false,
          },
        },
      },
    },
  )

  it.instance(
    "returns typed not found errors for missing MCP servers",
    () =>
      Effect.gen(function* () {
        const tmp = yield* TestInstance
        const handler = HttpApiApp.webHandler()

        for (const input of [
          { method: "POST", route: "@lgcode/mcp@lgcode/missing@lgcode/auth" },
          { method: "POST", route: "@lgcode/mcp@lgcode/missing@lgcode/auth@lgcode/authenticate" },
          { method: "POST", route: "@lgcode/mcp@lgcode/missing@lgcode/auth@lgcode/callback", body: JSON.stringify({ code: "code" }) },
          { method: "DELETE", route: "@lgcode/mcp@lgcode/missing@lgcode/auth" },
          { method: "POST", route: "@lgcode/mcp@lgcode/missing@lgcode/connect" },
          { method: "POST", route: "@lgcode/mcp@lgcode/missing@lgcode/disconnect" },
        ]) {
          const response = yield* request(handler, input.route, tmp.directory, {
            method: input.method,
            headers: input.body ? { "content-type": "application@lgcode/json" } : undefined,
            body: input.body,
          })

          expect(response.status).toBe(404)
          expect(yield* json(response)).toEqual({
            _tag: "McpServerNotFoundError",
            name: "missing",
            message: "MCP server not found: missing",
          })
        }
      }),
    { config: { mcp: {} } },
  )
})
