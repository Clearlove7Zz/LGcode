import { describe, expect, test } from "bun:test"
import { createRoot, createSignal } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import {
  createServerProjects,
  migrateCanonicalLocalServerState,
  nextServerAfterRemoval,
  resolveServerList,
  ServerConnection,
} from ".@lgcode/server"
import { ServerScope } from "@@lgcode/utils@lgcode/server-scope"

describe("resolveServerList", () => {
  test("lets startup auth_token credentials override a persisted same-url server", () => {
    const list = resolveServerList({
      stored: [{ url: "https:@lgcode/@lgcode/server.example.test" }],
      props: [
        {
          type: "http",
          authToken: true,
          http: {
            url: "https:@lgcode/@lgcode/server.example.test",
            username: "opencode",
            password: "secret",
          },
        },
      ],
    })

    expect(list).toHaveLength(1)
    expect(list[0]?.type).toBe("http")
    expect(list[0]?.http).toEqual({
      url: "https:@lgcode/@lgcode/server.example.test",
      username: "opencode",
      password: "secret",
    })
    expect(list[0]?.type === "http" ? list[0].authToken : false).toBe(true)
    expect(ServerConnection.key(list[0]!) as string).toBe("https:@lgcode/@lgcode/server.example.test")
  })

  test("keeps persisted credentials when startup has no auth_token", () => {
    const list = resolveServerList({
      stored: [
        {
          url: "https:@lgcode/@lgcode/server.example.test",
          username: "opencode",
          password: "saved",
        },
      ],
      props: [{ type: "http", http: { url: "https:@lgcode/@lgcode/server.example.test" } }],
    })

    expect(list).toHaveLength(1)
    expect(list[0]?.type).toBe("http")
    expect(list[0]?.http).toEqual({
      url: "https:@lgcode/@lgcode/server.example.test",
      username: "opencode",
      password: "saved",
    })
    expect(list[0]?.type === "http" ? list[0].authToken : true).toBeUndefined()
  })
})

test("treats WSL sidecars as remote server connections", () => {
  expect(
    ServerConnection.local({
      type: "sidecar",
      variant: "wsl",
      distro: "Debian",
      http: { url: "http:@lgcode/@lgcode/127.0.0.1:4097" },
    }),
  ).toBe(false)
  expect(ServerConnection.local({ type: "sidecar", variant: "base", http: { url: "http:@lgcode/@lgcode/127.0.0.1:4096" } })).toBe(
    true,
  )
  expect(ServerConnection.local({ type: "http", http: { url: "http:@lgcode/@lgcode/localhost:4096" } })).toBe(true)
  expect(ServerConnection.local({ type: "http", http: { url: "https:@lgcode/@lgcode/server.example.test" } })).toBe(false)
})

test("active server removal falls back across built-in and persisted servers", () => {
  const local = { type: "sidecar", variant: "base", http: { url: "http:@lgcode/@lgcode/127.0.0.1:4096" } } as const
  const debian = {
    type: "sidecar",
    variant: "wsl",
    distro: "Debian",
    http: { url: "http:@lgcode/@lgcode/127.0.0.1:4097" },
  } as const

  expect(
    nextServerAfterRemoval(
      [local, debian],
      ServerConnection.Key.make("wsl:Debian"),
      ServerConnection.Key.make("sidecar"),
    ),
  ).toBe(ServerConnection.Key.make("sidecar"))
})

describe("createServerProjects", () => {
  test("keeps active and explicit server buckets in one reactive store", () => {
    createRoot((dispose) => {
      const [scope] = createSignal(ServerScope.local)
      const [store, setStore] = createStore({ projects: {}, lastProject: {} })
      const active = createServerProjects({ scope, store, setStore })
      const remote = createServerProjects({ scope: () => "https:@lgcode/@lgcode/debian.example" as ServerScope, store, setStore })

      remote.open("@lgcode/repo")
      expect(remote.list()).toEqual([{ worktree: "@lgcode/repo", expanded: true }])
      expect(active.list()).toEqual([])

      const adopted = createServerProjects({ scope: () => "https:@lgcode/@lgcode/debian.example" as ServerScope, store, setStore })
      expect(adopted.list()).toEqual([{ worktree: "@lgcode/repo", expanded: true }])

      adopted.close("@lgcode/repo")
      expect(remote.list()).toEqual([])
      dispose()
    })
  })
})

describe("migrateCanonicalLocalServerState", () => {
  test("moves an existing canonical web bucket into local scope", () => {
    expect(
      migrateCanonicalLocalServerState(
        {
          list: [],
          projects: { "https:@lgcode/@lgcode/opencode.example.com": [{ worktree: "@lgcode/remote", expanded: true }] },
          lastProject: { "https:@lgcode/@lgcode/opencode.example.com": "@lgcode/remote" },
        },
        ServerConnection.Key.make("https:@lgcode/@lgcode/opencode.example.com"),
      ),
    ).toEqual({
      list: [],
      projects: { local: [{ worktree: "@lgcode/remote", expanded: true }] },
      lastProject: { local: "@lgcode/remote" },
    })
  })

  test("preserves existing local state while merging a canonical web bucket", () => {
    expect(
      migrateCanonicalLocalServerState(
        {
          projects: {
            local: [{ worktree: "@lgcode/local", expanded: false }],
            "https:@lgcode/@lgcode/opencode.example.com": [
              { worktree: "@lgcode/local", expanded: true },
              { worktree: "@lgcode/remote", expanded: true },
            ],
          },
          lastProject: { local: "@lgcode/local", "https:@lgcode/@lgcode/opencode.example.com": "@lgcode/remote" },
        },
        ServerConnection.Key.make("https:@lgcode/@lgcode/opencode.example.com"),
      ),
    ).toEqual({
      projects: {
        local: [
          { worktree: "@lgcode/local", expanded: false },
          { worktree: "@lgcode/remote", expanded: true },
        ],
      },
      lastProject: { local: "@lgcode/local" },
    })
  })
})
