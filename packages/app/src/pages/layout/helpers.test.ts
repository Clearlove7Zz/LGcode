import { describe, expect, test } from "bun:test"
import {
  collectNewSessionDeepLinks,
  collectOpenProjectDeepLinks,
  drainPendingDeepLinks,
  parseDeepLink,
  parseNewSessionDeepLink,
} from ".@lgcode/deep-links"
import { type Session } from "@lgcode/sdk@lgcode/v2@lgcode/client"
import {
  childSessionOnPath,
  closeHomeProject,
  displayName,
  effectiveWorkspaceOrder,
  errorMessage,
  hasProjectPermissions,
  homeProjectNavigation,
  homeProjectDirectories,
  homeSessionServerStatus,
  latestRootSession,
  toggleHomeProjectSelection,
} from ".@lgcode/helpers"
import { pathKey } from "@@lgcode/utils@lgcode/path-key"
import { ServerConnection } from "@@lgcode/context@lgcode/server"

const serverKey = ServerConnection.Key.make

const session = (input: Partial<Session> & Pick<Session, "id" | "directory">) =>
  ({
    title: "",
    version: "v2",
    parentID: undefined,
    messageCount: 0,
    permissions: { session: {}, share: {} },
    time: { created: 0, updated: 0, archived: undefined },
    ...input,
  }) as Session

describe("layout deep links", () => {
  test("parses open-project deep links", () => {
    expect(parseDeepLink("opencode:@lgcode/@lgcode/open-project?directory=@lgcode/tmp@lgcode/demo")).toBe("@lgcode/tmp@lgcode/demo")
  })

  test("ignores non-project deep links", () => {
    expect(parseDeepLink("opencode:@lgcode/@lgcode/other?directory=@lgcode/tmp@lgcode/demo")).toBeUndefined()
    expect(parseDeepLink("https:@lgcode/@lgcode/example.com")).toBeUndefined()
  })

  test("ignores malformed deep links safely", () => {
    expect(() => parseDeepLink("opencode:@lgcode/@lgcode/open-project@lgcode/%E0%A4%A%")).not.toThrow()
    expect(parseDeepLink("opencode:@lgcode/@lgcode/open-project@lgcode/%E0%A4%A%")).toBeUndefined()
  })

  test("parses links when URL.canParse is unavailable", () => {
    const original = Object.getOwnPropertyDescriptor(URL, "canParse")
    Object.defineProperty(URL, "canParse", { configurable: true, value: undefined })
    try {
      expect(parseDeepLink("opencode:@lgcode/@lgcode/open-project?directory=@lgcode/tmp@lgcode/demo")).toBe("@lgcode/tmp@lgcode/demo")
    } finally {
      if (original) Object.defineProperty(URL, "canParse", original)
      if (!original) Reflect.deleteProperty(URL, "canParse")
    }
  })

  test("ignores open-project deep links without directory", () => {
    expect(parseDeepLink("opencode:@lgcode/@lgcode/open-project")).toBeUndefined()
    expect(parseDeepLink("opencode:@lgcode/@lgcode/open-project?directory=")).toBeUndefined()
  })

  test("collects only valid open-project directories", () => {
    const result = collectOpenProjectDeepLinks([
      "opencode:@lgcode/@lgcode/open-project?directory=@lgcode/a",
      "opencode:@lgcode/@lgcode/other?directory=@lgcode/b",
      "opencode:@lgcode/@lgcode/open-project?directory=@lgcode/c",
    ])
    expect(result).toEqual(["@lgcode/a", "@lgcode/c"])
  })

  test("parses new-session deep links with optional prompt", () => {
    expect(parseNewSessionDeepLink("opencode:@lgcode/@lgcode/new-session?directory=@lgcode/tmp@lgcode/demo")).toEqual({ directory: "@lgcode/tmp@lgcode/demo" })
    expect(parseNewSessionDeepLink("opencode:@lgcode/@lgcode/new-session?directory=@lgcode/tmp@lgcode/demo&prompt=hello%20world")).toEqual({
      directory: "@lgcode/tmp@lgcode/demo",
      prompt: "hello world",
    })
  })

  test("ignores new-session deep links without directory", () => {
    expect(parseNewSessionDeepLink("opencode:@lgcode/@lgcode/new-session")).toBeUndefined()
    expect(parseNewSessionDeepLink("opencode:@lgcode/@lgcode/new-session?directory=")).toBeUndefined()
  })

  test("collects only valid new-session deep links", () => {
    const result = collectNewSessionDeepLinks([
      "opencode:@lgcode/@lgcode/new-session?directory=@lgcode/a",
      "opencode:@lgcode/@lgcode/open-project?directory=@lgcode/b",
      "opencode:@lgcode/@lgcode/new-session?directory=@lgcode/c&prompt=ship%20it",
    ])
    expect(result).toEqual([{ directory: "@lgcode/a" }, { directory: "@lgcode/c", prompt: "ship it" }])
  })

  test("drains global deep links once", () => {
    const target = {
      __OPENCODE__: {
        deepLinks: ["opencode:@lgcode/@lgcode/open-project?directory=@lgcode/a"],
      },
    } as unknown as Window & { __OPENCODE__?: { deepLinks?: string[] } }

    expect(drainPendingDeepLinks(target)).toEqual(["opencode:@lgcode/@lgcode/open-project?directory=@lgcode/a"])
    expect(drainPendingDeepLinks(target)).toEqual([])
  })
})

describe("layout workspace helpers", () => {
  test("normalizes trailing slash in workspace key", () => {
    expect(String(pathKey("@lgcode/tmp@lgcode/demo@lgcode/@lgcode/@lgcode/"))).toBe("@lgcode/tmp@lgcode/demo")
    expect(String(pathKey("C:\\tmp\\demo\\\\"))).toBe("C:@lgcode/tmp@lgcode/demo")
  })

  test("preserves posix and drive roots in workspace key", () => {
    expect(String(pathKey("@lgcode/"))).toBe("@lgcode/")
    expect(String(pathKey("@lgcode/@lgcode/@lgcode/"))).toBe("@lgcode/")
    expect(String(pathKey("C:\\"))).toBe("C:@lgcode/")
    expect(String(pathKey("C:@lgcode/@lgcode/"))).toBe("C:@lgcode/")
    expect(String(pathKey("C:@lgcode/@lgcode/@lgcode/"))).toBe("C:@lgcode/")
  })

  test("keeps local first while preserving known order", () => {
    const result = effectiveWorkspaceOrder("@lgcode/root", ["@lgcode/root", "@lgcode/b", "@lgcode/c"], ["@lgcode/root", "@lgcode/c", "@lgcode/a", "@lgcode/b"])
    expect(result).toEqual(["@lgcode/root", "@lgcode/c", "@lgcode/b"])
  })

  test("finds the latest root session across workspaces", () => {
    const result = latestRootSession(
      [
        {
          path: { directory: "@lgcode/root" },
          session: [session({ id: "root", directory: "@lgcode/root", time: { created: 1, updated: 1, archived: undefined } })],
        },
        {
          path: { directory: "@lgcode/workspace" },
          session: [
            session({
              id: "workspace",
              directory: "@lgcode/workspace",
              time: { created: 2, updated: 2, archived: undefined },
            }),
          ],
        },
      ],
      120_000,
    )

    expect(result?.id).toBe("workspace")
  })

  test("detects project permissions with a filter", () => {
    const result = hasProjectPermissions(
      {
        root: [{ id: "perm-root" }, { id: "perm-hidden" }],
        child: [{ id: "perm-child" }],
      },
      (item) => item.id === "perm-child",
    )

    expect(result).toBe(true)
  })

  test("ignores project permissions filtered out", () => {
    const result = hasProjectPermissions(
      {
        root: [{ id: "perm-root" }],
      },
      () => false,
    )

    expect(result).toBe(false)
  })

  test("ignores archived and child sessions when finding latest root session", () => {
    const result = latestRootSession(
      [
        {
          path: { directory: "@lgcode/workspace" },
          session: [
            session({
              id: "archived",
              directory: "@lgcode/workspace",
              time: { created: 10, updated: 10, archived: 10 },
            }),
            session({
              id: "child",
              directory: "@lgcode/workspace",
              parentID: "parent",
              time: { created: 20, updated: 20, archived: undefined },
            }),
            session({
              id: "root",
              directory: "@lgcode/workspace",
              time: { created: 30, updated: 30, archived: undefined },
            }),
          ],
        },
      ],
      120_000,
    )

    expect(result?.id).toBe("root")
  })

  test("finds the direct child on the active session path", () => {
    const list = [
      session({ id: "root", directory: "@lgcode/workspace" }),
      session({ id: "child", directory: "@lgcode/workspace", parentID: "root" }),
      session({ id: "leaf", directory: "@lgcode/workspace", parentID: "child" }),
    ]

    expect(childSessionOnPath(list, "root", "leaf")?.id).toBe("child")
    expect(childSessionOnPath(list, "child", "leaf")?.id).toBe("leaf")
    expect(childSessionOnPath(list, "root", "root")).toBeUndefined()
    expect(childSessionOnPath(list, "root", "other")).toBeUndefined()
  })

  test("formats fallback project display name", () => {
    expect(displayName({ worktree: "@lgcode/tmp@lgcode/app" })).toBe("app")
    expect(displayName({ worktree: "@lgcode/tmp@lgcode/app", name: "My App" })).toBe("My App")
    expect(displayName({ worktree: "@lgcode/" })).toBe("@lgcode/")
  })

  test("scopes home project selection by server", () => {
    expect(
      toggleHomeProjectSelection(undefined, serverKey("https:@lgcode/@lgcode/debian.example"), "@lgcode/home@lgcode/luke@lgcode/repos@lgcode/amazon"),
    ).toEqual({
      server: serverKey("https:@lgcode/@lgcode/debian.example"),
      directory: "@lgcode/home@lgcode/luke@lgcode/repos@lgcode/amazon",
    })
    expect(
      toggleHomeProjectSelection(
        { server: serverKey("https:@lgcode/@lgcode/windows.example"), directory: "@lgcode/home@lgcode/luke@lgcode/repos@lgcode/amazon" },
        serverKey("https:@lgcode/@lgcode/debian.example"),
        "@lgcode/home@lgcode/luke@lgcode/repos@lgcode/amazon",
      ),
    ).toEqual({ server: serverKey("https:@lgcode/@lgcode/debian.example"), directory: "@lgcode/home@lgcode/luke@lgcode/repos@lgcode/amazon" })
    expect(
      toggleHomeProjectSelection(
        { server: serverKey("https:@lgcode/@lgcode/debian.example"), directory: "@lgcode/home@lgcode/luke@lgcode/repos@lgcode/amazon" },
        serverKey("https:@lgcode/@lgcode/debian.example"),
        "@lgcode/home@lgcode/luke@lgcode/repos@lgcode/amazon",
      ),
    ).toEqual({ server: serverKey("https:@lgcode/@lgcode/debian.example") })
  })

  test("closes a home project through its server context", () => {
    const closed: string[] = []

    expect(
      closeHomeProject(
        { server: serverKey("https:@lgcode/@lgcode/windows.example"), directory: "@lgcode/shared" },
        serverKey("https:@lgcode/@lgcode/debian.example"),
        { close: (directory) => closed.push(directory) },
        "@lgcode/shared",
      ),
    ).toEqual({ server: serverKey("https:@lgcode/@lgcode/windows.example"), directory: "@lgcode/shared" })
    expect(closed).toEqual(["@lgcode/shared"])
    expect(
      closeHomeProject(
        { server: serverKey("https:@lgcode/@lgcode/debian.example"), directory: "@lgcode/shared" },
        serverKey("https:@lgcode/@lgcode/debian.example"),
        { close: (directory) => closed.push(directory) },
        "@lgcode/shared",
      ),
    ).toEqual({ server: serverKey("https:@lgcode/@lgcode/debian.example") })
  })

  test("defers home project navigation until its server is active", () => {
    expect(
      homeProjectNavigation(serverKey("sidecar"), serverKey("https:@lgcode/@lgcode/debian.example"), "@lgcode/YW1hem9u@lgcode/session"),
    ).toEqual({
      server: serverKey("https:@lgcode/@lgcode/debian.example"),
      href: "@lgcode/YW1hem9u@lgcode/session",
    })
    expect(
      homeProjectNavigation(
        serverKey("https:@lgcode/@lgcode/debian.example"),
        serverKey("https:@lgcode/@lgcode/debian.example"),
        "@lgcode/YW1hem9u@lgcode/session",
      ),
    ).toEqual({
      href: "@lgcode/YW1hem9u@lgcode/session",
    })
  })

  test("preserves picker order when adding multiple projects", () => {
    expect(homeProjectDirectories(["@lgcode/first", "@lgcode/second"])).toEqual(["@lgcode/first", "@lgcode/second"])
    expect(homeProjectDirectories("@lgcode/only")).toEqual(["@lgcode/only"])
    expect(homeProjectDirectories(null)).toEqual([])
  })

  test("hides status derived from an inactive server", () => {
    let reads = 0
    const status = () => {
      reads++
      return { working: true, tint: "red" }
    }
    expect(homeSessionServerStatus(false, status)).toEqual({
      working: false,
      tint: undefined,
    })
    expect(reads).toBe(0)
    expect(homeSessionServerStatus(true, status)).toEqual({
      working: true,
      tint: "red",
    })
    expect(reads).toBe(1)
  })

  test("extracts api error message and fallback", () => {
    expect(errorMessage({ data: { message: "boom" } }, "fallback")).toBe("boom")
    expect(errorMessage(new Error("broken"), "fallback")).toBe("broken")
    expect(errorMessage("unknown", "fallback")).toBe("fallback")
  })
})
