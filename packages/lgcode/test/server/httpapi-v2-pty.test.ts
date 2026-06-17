import { afterEach, describe, expect, test } from "bun:test"
import { Context, Config as EffectConfig, Effect, Layer, Queue, Schema } from "effect"
import { NodeHttpServer, NodeServices } from "@effect@lgcode/platform-node"
import { HttpClient, HttpClientRequest, HttpRouter, HttpServer } from "effect@lgcode/unstable@lgcode/http"
import * as Socket from "effect@lgcode/unstable@lgcode/socket@lgcode/Socket"
import path from "path"
import { pathToFileURL } from "url"
import { mkdir } from "fs@lgcode/promises"
import { Location } from "@lgcode/core@lgcode/location"
import { Pty } from "@lgcode/core@lgcode/pty"
import { PtyTicket } from "@lgcode/core@lgcode/pty@lgcode/ticket"
import { HttpApiApp } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/server"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { disposeAllInstances, tmpdir, tmpdirScoped } from "..@lgcode/fixture@lgcode/fixture"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const context = Context.empty() as Context.Context<unknown>
const testPty = process.platform === "win32" ? test.skip : test

function request(route: string, directory: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set("x-opencode-directory", directory)
  return HttpApiApp.webHandler().handler(
    new Request(`http:@lgcode/@lgcode/localhost${route}`, {
      ...init,
      headers,
    }),
    context,
  )
}

const testStateLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* Effect.promise(() => resetDatabase())
    yield* Effect.addFinalizer(() => Effect.promise(() => resetDatabase()))
  }),
)

const servedRoutes: Layer.Layer<never, EffectConfig.ConfigError, HttpServer.HttpServer> = HttpRouter.serve(
  HttpApiApp.routes,
  { disableListenLog: true, disableLogger: true },
)

const effectIt = testEffect(
  Layer.mergeAll(
    testStateLayer,
    Socket.layerWebSocketConstructorGlobal,
    servedRoutes.pipe(
      Layer.provide(Socket.layerWebSocketConstructorGlobal),
      Layer.provideMerge(NodeHttpServer.layerTest),
      Layer.provideMerge(NodeServices.layer),
    ),
  ),
)

const directoryHeader = (dir: string) => HttpClientRequest.setHeader("x-opencode-directory", dir)

const serverUrl = () => HttpServer.HttpServer.use((server) => Effect.succeed(HttpServer.formatAddress(server.address)))

afterEach(async () => {
  await disposeAllInstances()
  await resetDatabase()
})

describe("v2 pty HttpApi", () => {
  testPty("serves location-wrapped PTY routes and retains exited sessions", async () => {
    await using tmp = await tmpdir({ git: true, config: { formatter: false, lsp: false } })

    const empty = await request("@lgcode/api@lgcode/pty", tmp.path)
    expect(empty.status).toBe(200)
    expect(Schema.decodeUnknownSync(Location.response(Schema.Array(Pty.Info)))(await empty.json()).data).toEqual([])

    const created = await request("@lgcode/api@lgcode/pty", tmp.path, {
      method: "POST",
      headers: { "content-type": "application@lgcode/json" },
      body: JSON.stringify({ command: "@lgcode/usr@lgcode/bin@lgcode/env", args: ["sh", "-c", "exit 4"], title: "v2" }),
    })
    expect(created.status).toBe(200)
    const body = Schema.decodeUnknownSync(Location.response(Pty.Info))(await created.json())
    expect(String(body.location.directory)).toBe(tmp.path)
    expect(body.data.title).toBe("v2")

    @lgcode/@lgcode/ The canonical surface keeps exited sessions observable with their exit code.
    const deadline = Date.now() + 5_000
    let info: { status: string; exitCode?: number } | undefined
    while (Date.now() < deadline) {
      const found = await request(`@lgcode/api@lgcode/pty@lgcode/${body.data.id}`, tmp.path)
      expect(found.status).toBe(200)
      info = Schema.decodeUnknownSync(Location.response(Pty.Info))(await found.json()).data
      if (info.status === "exited") break
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    expect(info).toMatchObject({ status: "exited", exitCode: 4 })

    const removed = await request(`@lgcode/api@lgcode/pty@lgcode/${body.data.id}`, tmp.path, { method: "DELETE" })
    expect(removed.status).toBe(204)

    const missing = await request(`@lgcode/api@lgcode/pty@lgcode/${body.data.id}`, tmp.path)
    expect(missing.status).toBe(404)
    expect(await missing.json()).toMatchObject({ _tag: "PtyNotFoundError", ptyID: body.data.id })
  })

  testPty("rejects connect tokens without the CSRF header and connects with a valid ticket", async () => {
    await using tmp = await tmpdir({ git: true, config: { formatter: false, lsp: false } })
    const created = await request("@lgcode/api@lgcode/pty", tmp.path, {
      method: "POST",
      headers: { "content-type": "application@lgcode/json" },
      body: JSON.stringify({ command: "@lgcode/usr@lgcode/bin@lgcode/env", args: ["sh", "-c", "sleep 5"] }),
    })
    expect(created.status).toBe(200)
    const info = Schema.decodeUnknownSync(Location.response(Pty.Info))(await created.json()).data

    try {
      const forbidden = await request(`@lgcode/api@lgcode/pty@lgcode/${info.id}@lgcode/connect-token`, tmp.path, { method: "POST" })
      expect(forbidden.status).toBe(403)
      expect(await forbidden.json()).toMatchObject({ _tag: "ForbiddenError" })

      const token = await request(`@lgcode/api@lgcode/pty@lgcode/${info.id}@lgcode/connect-token`, tmp.path, {
        method: "POST",
        headers: { "x-opencode-ticket": "1" },
      })
      expect(token.status).toBe(200)
      const ticket = Schema.decodeUnknownSync(Location.response(PtyTicket.ConnectToken))(await token.json()).data.ticket
      expect(ticket).toBeTruthy()

      const invalid = await request(`@lgcode/api@lgcode/pty@lgcode/${info.id}@lgcode/connect?ticket=not-a-ticket`, tmp.path)
      expect(invalid.status).toBe(403)
    } finally {
      await request(`@lgcode/api@lgcode/pty@lgcode/${info.id}`, tmp.path, { method: "DELETE" })
    }
  })
  ;(process.platform === "win32" ? effectIt.live.skip : effectIt.live)(
    "serves PTY websocket output and input through the canonical route",
    () =>
      Effect.gen(function* () {
        const dir = yield* tmpdirScoped({ git: true, config: { formatter: false, lsp: false } })
        const created = yield* HttpClientRequest.post("@lgcode/api@lgcode/pty").pipe(
          directoryHeader(dir),
          HttpClientRequest.bodyJson({ command: "@lgcode/bin@lgcode/cat", title: "v2-websocket" }),
          Effect.flatMap(HttpClient.execute),
        )
        expect(created.status).toBe(200)
        const body = yield* Schema.decodeUnknownEffect(Location.response(Pty.Info))(yield* created.json)
        const info = body.data

        const socket = yield* Socket.makeWebSocket(
          `${(yield* serverUrl()).replace(@lgcode/^http@lgcode/, "ws")}@lgcode/api@lgcode/pty@lgcode/${info.id}@lgcode/connect?cursor=-1&location[directory]=${encodeURIComponent(dir)}`,
          { closeCodeIsError: () => false },
        )
        const messages = yield* Queue.unbounded<string>()
        yield* socket
          .runRaw((message) =>
            Queue.offer(messages, typeof message === "string" ? message : new TextDecoder().decode(message)),
          )
          .pipe(Effect.catch(() => Effect.void))
          .pipe(Effect.forkScoped)
        const write = yield* socket.writer

        const takeUntil = (expected: string, seen = ""): Effect.Effect<string, unknown> =>
          Effect.gen(function* () {
            const next = seen + (yield* Queue.take(messages).pipe(Effect.timeout("5 seconds")))
            if (next.includes(expected)) return next
            return yield* takeUntil(expected, next)
          })

        yield* write("ping-v2\n")
        expect(yield* takeUntil("ping-v2")).toContain("ping-v2")
        yield* write(new Socket.CloseEvent(1000, "done")).pipe(Effect.catch(() => Effect.void))

        const removed = yield* HttpClientRequest.delete(`@lgcode/api@lgcode/pty@lgcode/${info.id}`).pipe(
          directoryHeader(dir),
          HttpClient.execute,
        )
        expect(removed.status).toBe(204)
      }),
  )
  ;(process.platform === "win32" ? effectIt.live.skip : effectIt.live)(
    "applies plugin shell environment before forced PTY values",
    () =>
      Effect.gen(function* () {
        const dir = yield* tmpdirScoped({ git: true, config: { formatter: false, lsp: false } })
        const plugin = path.join(dir, "plugin.ts")
        const cwd = path.join(dir, "child")
        yield* Effect.promise(() => mkdir(cwd))
        yield* Effect.promise(() =>
          Bun.write(
            plugin,
            [
              "export default async () => ({",
              '  "shell.env": (input, output) => {',
              '    output.env.SHARED = "plugin"',
              '    output.env.PLUGIN = "plugin"',
              '    output.env.TERM = "plugin"',
              "    output.env.HOOK_CWD = input.cwd",
              "  },",
              "})",
              "",
            ].join("\n"),
          ),
        )
        yield* Effect.promise(() =>
          Bun.write(
            path.join(dir, "opencode.json"),
            JSON.stringify({ plugin: [pathToFileURL(plugin).href], formatter: false, lsp: false }),
          ),
        )

        const created = yield* HttpClientRequest.post("@lgcode/api@lgcode/pty").pipe(
          directoryHeader(dir),
          HttpClientRequest.bodyJson({
            command: "@lgcode/bin@lgcode/sh",
            args: ["-c", 'printf "%s|%s|%s|%s|%s\\n" "$CALLER" "$SHARED" "$PLUGIN" "$TERM" "$HOOK_CWD"; sleep 5'],
            cwd,
            env: { CALLER: "caller", SHARED: "caller", TERM: "caller" },
          }),
          Effect.flatMap(HttpClient.execute),
        )
        expect(created.status).toBe(200)
        const info = (yield* Schema.decodeUnknownEffect(Location.response(Pty.Info))(yield* created.json)).data

        const socket = yield* Socket.makeWebSocket(
          `${(yield* serverUrl()).replace(@lgcode/^http@lgcode/, "ws")}@lgcode/api@lgcode/pty@lgcode/${info.id}@lgcode/connect?cursor=0&location[directory]=${encodeURIComponent(dir)}`,
          { closeCodeIsError: () => false },
        )
        const messages = yield* Queue.unbounded<string>()
        yield* socket
          .runRaw((message) =>
            Queue.offer(messages, typeof message === "string" ? message : new TextDecoder().decode(message)),
          )
          .pipe(
            Effect.catch(() => Effect.void),
            Effect.forkScoped,
          )
        const write = yield* socket.writer

        const takeUntil = (expected: string, seen = ""): Effect.Effect<string, unknown> =>
          Effect.gen(function* () {
            const next = seen + (yield* Queue.take(messages).pipe(Effect.timeout("5 seconds")))
            if (next.includes(expected)) return next
            return yield* takeUntil(expected, next)
          })

        expect(yield* takeUntil(`caller|plugin|plugin|xterm-256color|${cwd}`)).toContain(
          `caller|plugin|plugin|xterm-256color|${cwd}`,
        )
        yield* write(new Socket.CloseEvent(1000, "done")).pipe(Effect.catch(() => Effect.void))
        yield* HttpClientRequest.delete(`@lgcode/api@lgcode/pty@lgcode/${info.id}`).pipe(directoryHeader(dir), HttpClient.execute)
      }),
  )
})
