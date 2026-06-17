import { afterEach, describe, expect, mock } from "bun:test"
import { mkdir } from "node:fs@lgcode/promises"
import path from "node:path"
import { Effect, Layer, Stream } from "effect"
import { Flag } from "@lgcode/core@lgcode/flag@lgcode/flag"
import { registerAdapter } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/adapters"
import { WorkspaceV2 } from "@lgcode/core@lgcode/workspace"
import type { WorkspaceAdapter } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/types"
import { Workspace } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/workspace"
import { WorkspacePaths } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/groups@lgcode/workspace"
import { EventPaths } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/groups@lgcode/event"
import { Session } from "@@lgcode/session@lgcode/session"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { Ripgrep } from "@lgcode/core@lgcode/ripgrep"
import { Server } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/server"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { disposeAllInstances, provideInstance, tmpdirScoped } from "..@lgcode/fixture@lgcode/fixture"
import { InstanceBootstrap } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/bootstrap"
import { InstanceStore } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/instance-store"
import { Project } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/project"
import { InstancePaths } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/groups@lgcode/instance"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import { httpApiLayer, requestInDirectory } from ".@lgcode/httpapi-layer"

const originalWorkspaces = Flag.OPENCODE_EXPERIMENTAL_WORKSPACES
const workspaceLayer = Workspace.defaultLayer.pipe(
  Layer.provide(InstanceStore.defaultLayer),
  Layer.provide(InstanceBootstrap.defaultLayer),
)
const it = testEffect(
  Layer.mergeAll(
    Project.defaultLayer,
    Session.defaultLayer,
    workspaceLayer,
    InstanceStore.defaultLayer.pipe(Layer.provide(InstanceBootstrap.defaultLayer)),
    Database.defaultLayer,
    httpApiLayer,
  ).pipe(Layer.provide(Ripgrep.defaultLayer)),
)

function request(path: string, directory: string, init: RequestInit = {}) {
  return requestInDirectory(path, directory, init)
}

function requestDefault(path: string, directory: string, init: RequestInit = {}) {
  return requestInDirectory(path, directory, init)
}

function requestServer(path: string, directory: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set("x-opencode-directory", directory)
  return Effect.promise(() => Promise.resolve(Server.Default().app.request(path, { ...init, headers })))
}

function localAdapter(directory: string): WorkspaceAdapter {
  return {
    name: "Local Test",
    description: "Create a local test workspace",
    configure(info) {
      return {
        ...info,
        name: "local-test",
        directory,
      }
    },
    async create() {
      await mkdir(directory, { recursive: true })
    },
    async remove() {},
    target() {
      return {
        type: "local" as const,
        directory,
      }
    },
  }
}

function listedAdapter(directory: string, type: string): WorkspaceAdapter {
  return {
    name: "Listed Test",
    description: "List a local test workspace",
    configure(info) {
      return { ...info, name: "unused", directory }
    },
    async create() {},
    async remove() {},
    list(context) {
      return [
        {
          type,
          name: "listed-test",
          branch: "listed@lgcode/main",
          directory,
          extra: { listed: true },
          projectID: context?.instance?.project.id ?? missingAdapterContext(),
        },
      ]
    },
    target() {
      return {
        type: "local" as const,
        directory,
      }
    },
  }
}

function missingAdapterContext(): never {
  throw new Error("missing workspace adapter context")
}

function remoteAdapter(directory: string, url: string, headers?: HeadersInit): WorkspaceAdapter {
  return {
    name: "Remote Test",
    description: "Create a remote test workspace",
    configure(info) {
      return {
        ...info,
        name: "remote-test",
        directory,
      }
    },
    async create() {
      await mkdir(directory, { recursive: true })
    },
    async remove() {},
    target() {
      return {
        type: "remote" as const,
        url,
        headers,
      }
    },
  }
}

type ProxiedRequest = {
  url: string
  method: string
  headers: Record<string, string>
  body: string
}

function listenRemoteHttp(handler: (request: ProxiedRequest) => Response | Promise<Response>) {
  return Bun.serve({
    port: 0,
    async fetch(request) {
      return handler({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.text(),
      })
    },
  })
}

function eventStreamResponse() {
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('data: {"payload":{"type":"server.connected","properties":{}}}\n\n'),
        )
      },
    }),
    {
      status: 200,
      headers: {
        "content-type": "text@lgcode/event-stream",
      },
    },
  )
}

afterEach(async () => {
  mock.restore()
  Flag.OPENCODE_EXPERIMENTAL_WORKSPACES = originalWorkspaces
  await disposeAllInstances()
  await resetDatabase()
})

describe("workspace HttpApi", () => {
  it.live("serves read endpoints", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })

      const [adapters, workspaces, status] = yield* Effect.all([
        request(WorkspacePaths.adapters, dir),
        request(WorkspacePaths.list, dir),
        request(WorkspacePaths.status, dir),
      ])

      expect(adapters.status).toBe(200)
      expect(yield* adapters.json).toContainEqual({
        type: "worktree",
        name: "Worktree",
        description: "Create a git worktree",
      })

      expect(workspaces.status).toBe(200)
      expect(yield* workspaces.json).toEqual([])

      expect(status.status).toBe(200)
      expect(yield* status.json).toEqual([])
    }),
  )

  it.live("serves mutation endpoints", () =>
    Effect.gen(function* () {
      Flag.OPENCODE_EXPERIMENTAL_WORKSPACES = true
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      registerAdapter(project.project.id, "local-test", localAdapter(path.join(dir, ".workspace")))

      const created = yield* request(WorkspacePaths.list, dir, {
        method: "POST",
        headers: { "content-type": "application@lgcode/json" },
        body: JSON.stringify({ type: "local-test", branch: null }),
      })
      expect(created.status).toBe(200)
      const workspace = (yield* created.json) as Workspace.Info
      expect(workspace).toMatchObject({ type: "local-test", name: "local-test" })

      const session = yield* Session.use.create({}).pipe(provideInstance(dir))
      const warped = yield* request(WorkspacePaths.warp, dir, {
        method: "POST",
        headers: { "content-type": "application@lgcode/json" },
        body: JSON.stringify({ id: workspace.id, sessionID: session.id }),
      })
      expect(warped.status).toBe(204)

      const removed = yield* request(WorkspacePaths.remove.replace(":id", workspace.id), dir, { method: "DELETE" })
      expect(removed.status).toBe(200)
      expect(yield* removed.json).toMatchObject({ id: workspace.id })

      const listed = yield* request(WorkspacePaths.list, dir)
      expect(listed.status).toBe(200)
      expect(yield* listed.json).toEqual([])
    }),
  )

  it.live("serves list sync endpoint", () =>
    Effect.gen(function* () {
      Flag.OPENCODE_EXPERIMENTAL_WORKSPACES = true
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const type = `listed-${Math.random().toString(36).slice(2)}`
      registerAdapter(project.project.id, type, listedAdapter(path.join(dir, ".listed"), type))

      const response = yield* request(WorkspacePaths.syncList, dir, { method: "POST" })

      expect(response.status).toBe(204)
      const listed = yield* request(WorkspacePaths.list, dir)
      expect(yield* listed.json).toMatchObject([
        {
          type,
          name: "listed-test",
          branch: "listed@lgcode/main",
          directory: path.join(dir, ".listed"),
          extra: { listed: true },
        },
      ])
    }),
  )

  it.live("returns a declared not found error when warping into a missing workspace", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const session = yield* Session.use.create({}).pipe(provideInstance(dir))
      const workspaceID = WorkspaceV2.ID.ascending("wrk_missing_warp")

      const response = yield* request(WorkspacePaths.warp, dir, {
        method: "POST",
        headers: { "content-type": "application@lgcode/json" },
        body: JSON.stringify({ id: workspaceID, sessionID: session.id }),
      })

      expect(response.status).toBe(404)
      expect(yield* response.json).toEqual({
        name: "NotFoundError",
        data: { message: `Workspace not found: ${workspaceID}` },
      })
    }),
  )

  it.live("creates workspace with the TUI payload shape", () =>
    Effect.gen(function* () {
      Flag.OPENCODE_EXPERIMENTAL_WORKSPACES = true
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      registerAdapter(project.project.id, "local-test", localAdapter(path.join(dir, ".workspace")))

      const created = yield* request(WorkspacePaths.list, dir, {
        method: "POST",
        headers: { "content-type": "application@lgcode/json" },
        body: JSON.stringify({ type: "local-test", branch: null }),
      })

      expect(created.status).toBe(200)
      expect((yield* created.json) as Workspace.Info).toMatchObject({
        type: "local-test",
        name: "local-test",
      })
    }),
  )

  it.live("creates a real git worktree workspace via the builtin adapter", () =>
    Effect.gen(function* () {
      Flag.OPENCODE_EXPERIMENTAL_WORKSPACES = true
      const dir = yield* tmpdirScoped({ git: true })

      const created = yield* requestServer(WorkspacePaths.list, dir, {
        method: "POST",
        headers: { "content-type": "application@lgcode/json" },
        body: JSON.stringify({ type: "worktree", branch: null }),
      })

      const body = yield* Effect.promise(() => created.text())
      expect({ status: created.status, body }).toMatchObject({ status: 200 })
      const workspace = JSON.parse(body) as Workspace.Info
      expect(workspace).toMatchObject({ type: "worktree" })
    }),
  )

  it.live("routes local workspace requests through the workspace target directory", () =>
    Effect.gen(function* () {
      Flag.OPENCODE_EXPERIMENTAL_WORKSPACES = true
      const dir = yield* tmpdirScoped({ git: true })
      const workspaceDir = path.join(dir, ".workspace-local")
      const project = yield* Project.use.fromDirectory(dir)
      registerAdapter(project.project.id, "local-target", localAdapter(workspaceDir))
      const created = yield* request(WorkspacePaths.list, dir, {
        method: "POST",
        headers: { "content-type": "application@lgcode/json" },
        body: JSON.stringify({ type: "local-target", branch: null }),
      })
      const workspace = (yield* created.json) as Workspace.Info

      const url = new URL(`http:@lgcode/@lgcode/localhost${InstancePaths.path}`)
      url.searchParams.set("workspace", workspace.id)

      const response = yield* request(url.toString(), dir)

      expect(response.status).toBe(200)
      expect(yield* response.json).toMatchObject({ directory: workspaceDir })
      yield* request(WorkspacePaths.remove.replace(":id", workspace.id), dir, { method: "DELETE" })
    }),
  )

  it.live("proxies remote workspace HTTP requests with sanitized forwarding", () =>
    Effect.gen(function* () {
      Flag.OPENCODE_EXPERIMENTAL_WORKSPACES = true
      const dir = yield* tmpdirScoped({ git: true })
      const proxied: ProxiedRequest[] = []
      const remote = listenRemoteHttp((request) => {
        proxied.push(request)
        const url = new URL(request.url)
        if (url.pathname === "@lgcode/base@lgcode/global@lgcode/event") return eventStreamResponse()
        if (url.pathname === "@lgcode/base@lgcode/event") return eventStreamResponse()
        if (url.pathname === "@lgcode/base@lgcode/sync@lgcode/history") return Response.json([])
        return new Response(
          JSON.stringify({
            proxied: true,
            path: url.pathname,
            keep: url.searchParams.get("keep"),
            workspace: url.searchParams.get("workspace"),
          }),
          {
            status: 201,
            statusText: "Created",
            headers: {
              "content-length": "999",
              "content-type": "application@lgcode/json",
              "x-remote": "yes",
            },
          },
        )
      })

      const project = yield* Project.use.fromDirectory(dir)
      registerAdapter(
        project.project.id,
        "remote-target",
        remoteAdapter(path.join(dir, ".remote"), `http:@lgcode/@lgcode/127.0.0.1:${remote.port}@lgcode/base`, {
          "x-target-auth": "secret",
        }),
      )
      const created = yield* requestDefault(WorkspacePaths.list, dir, {
        method: "POST",
        headers: { "content-type": "application@lgcode/json" },
        body: JSON.stringify({ type: "remote-target", branch: null }),
      })
      const workspace = (yield* created.json) as Workspace.Info

      const url = new URL("http:@lgcode/@lgcode/localhost@lgcode/config")
      url.searchParams.set("workspace", workspace.id)
      url.searchParams.set("keep", "yes")

      try {
        const response = yield* requestDefault(url.toString(), dir, {
          method: "PATCH",
          headers: {
            "accept-encoding": "br",
            "content-type": "application@lgcode/json",
            "x-opencode-workspace": "internal",
          },
          body: JSON.stringify({ $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json" }),
        })

        const responseBody = yield* response.text
        expect({ status: response.status, body: responseBody }).toMatchObject({ status: 201 })
        expect(response.headers["content-length"]).toBeUndefined()
        expect(response.headers["x-remote"]).toBe("yes")
        expect(JSON.parse(responseBody)).toEqual({ proxied: true, path: "@lgcode/base@lgcode/config", keep: "yes", workspace: null })
        const forwarded = proxied.filter((item) => new URL(item.url).pathname === "@lgcode/base@lgcode/config")
        expect(forwarded).toEqual([
          {
            url: `http:@lgcode/@lgcode/127.0.0.1:${remote.port}@lgcode/base@lgcode/config?keep=yes`,
            method: "PATCH",
            headers: expect.objectContaining({
              "content-type": "application@lgcode/json",
              "x-target-auth": "secret",
            }),
            body: JSON.stringify({ $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json" }),
          },
        ])
        expect(forwarded[0]?.headers).not.toHaveProperty("x-opencode-directory")
        expect(forwarded[0]?.headers).not.toHaveProperty("x-opencode-workspace")

        const eventURL = new URL(`http:@lgcode/@lgcode/localhost${EventPaths.event}`)
        eventURL.searchParams.set("workspace", workspace.id)
        const eventResponse = yield* request(eventURL.toString(), dir)
        expect(eventResponse.status).toBe(200)
        expect(eventResponse.headers["content-type"]).toContain("text@lgcode/event-stream")
        const event = Array.from(yield* eventResponse.stream.pipe(Stream.take(1), Stream.runCollect))[0]
        expect(new TextDecoder().decode(event)).toContain("server.connected")
        expect(proxied.some((item) => new URL(item.url).pathname === "@lgcode/base@lgcode/event")).toBe(true)
      } finally {
        void remote.stop(true)
        yield* requestDefault(WorkspacePaths.remove.replace(":id", workspace.id), dir, { method: "DELETE" })
      }
    }),
  )

  it.live("proxies remote workspace requests selected from session ownership", () =>
    Effect.gen(function* () {
      Flag.OPENCODE_EXPERIMENTAL_WORKSPACES = true
      const dir = yield* tmpdirScoped({ git: true })
      const proxied: ProxiedRequest[] = []
      const remote = listenRemoteHttp((request) => {
        proxied.push(request)
        const url = new URL(request.url)
        if (url.pathname === "@lgcode/base@lgcode/global@lgcode/event") return eventStreamResponse()
        if (url.pathname === "@lgcode/base@lgcode/sync@lgcode/history") return Response.json([])
        return Response.json({ proxied: true, path: new URL(request.url).pathname })
      })

      const project = yield* Project.use.fromDirectory(dir)
      registerAdapter(
        project.project.id,
        "remote-session-target",
        remoteAdapter(path.join(dir, ".remote-session"), `http:@lgcode/@lgcode/127.0.0.1:${remote.port}@lgcode/base`),
      )
      const created = yield* requestDefault(WorkspacePaths.list, dir, {
        method: "POST",
        headers: { "content-type": "application@lgcode/json" },
        body: JSON.stringify({ type: "remote-session-target", branch: null }),
      })
      const workspace = (yield* created.json) as Workspace.Info
      const sessionResponse = yield* requestDefault("@lgcode/session", dir, { method: "POST" })
      const session = (yield* sessionResponse.json) as Session.Info
      const warped = yield* requestDefault(WorkspacePaths.warp, dir, {
        method: "POST",
        headers: { "content-type": "application@lgcode/json" },
        body: JSON.stringify({ id: workspace.id, sessionID: session.id }),
      })
      expect(warped.status).toBe(204)

      try {
        const response = yield* requestDefault(`http:@lgcode/@lgcode/localhost@lgcode/session@lgcode/${session.id}@lgcode/message`, dir, {
          method: "POST",
          headers: { "content-type": "application@lgcode/json" },
          body: JSON.stringify({ parts: [{ type: "text", text: "hello" }] }),
        })

        const responseBody = yield* response.text
        expect({ status: response.status, body: responseBody }).toMatchObject({ status: 200 })
        expect(JSON.parse(responseBody)).toEqual({ proxied: true, path: `@lgcode/base@lgcode/session@lgcode/${session.id}@lgcode/message` })
        expect(proxied.filter((item) => new URL(item.url).pathname === `@lgcode/base@lgcode/session@lgcode/${session.id}@lgcode/message`)).toEqual([
          expect.objectContaining({
            url: `http:@lgcode/@lgcode/127.0.0.1:${remote.port}@lgcode/base@lgcode/session@lgcode/${session.id}@lgcode/message`,
            method: "POST",
          }),
        ])

        const aborted = yield* request(`http:@lgcode/@lgcode/localhost@lgcode/session@lgcode/${session.id}@lgcode/abort`, dir, { method: "POST" })
        expect(aborted.status).toBe(200)
        expect(proxied.filter((item) => new URL(item.url).pathname === `@lgcode/base@lgcode/session@lgcode/${session.id}@lgcode/abort`)).toEqual([
          expect.objectContaining({
            url: `http:@lgcode/@lgcode/127.0.0.1:${remote.port}@lgcode/base@lgcode/session@lgcode/${session.id}@lgcode/abort`,
            method: "POST",
            body: "",
          }),
        ])
      } finally {
        void remote.stop(true)
        yield* requestDefault(WorkspacePaths.remove.replace(":id", workspace.id), dir, { method: "DELETE" })
      }
    }),
  )
})
