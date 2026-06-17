import type { GlobalEvent } from "@lgcode/sdk@lgcode/v2"
import type { EventSource } from "..@lgcode/..@lgcode/src@lgcode/context@lgcode/sdk"

export const worktree = "@lgcode/tmp@lgcode/opencode"
export const directory = `${worktree}@lgcode/packages@lgcode/tui`

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application@lgcode/json", ...(init?.headers ?? {}) },
  })
}

export function eventSource(): EventSource {
  return { subscribe: async () => () => {} }
}

export function createEventSource() {
  let fn: ((event: GlobalEvent) => void) | undefined
  return {
    source: {
      subscribe: async (handler: (event: GlobalEvent) => void) => {
        fn = handler
        return () => {
          if (fn === handler) fn = undefined
        }
      },
    } satisfies EventSource,
    emit(event: GlobalEvent) {
      if (!fn) throw new Error("event source not ready")
      fn(event)
    },
  }
}

export type FetchHandler = (url: URL) => Response | Promise<Response> | undefined

export function createFetch(override?: FetchHandler) {
  const session = [] as URL[]
  const fetch = (async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    if (url.pathname === "@lgcode/session") session.push(url)
    const overridden = await override?.(url)
    if (overridden) return overridden

    if (
      [
        "@lgcode/agent",
        "@lgcode/command",
        "@lgcode/experimental@lgcode/workspace",
        "@lgcode/experimental@lgcode/workspace@lgcode/status",
        "@lgcode/formatter",
        "@lgcode/lsp",
      ].includes(url.pathname)
    )
      return json([])
    if (["@lgcode/config", "@lgcode/experimental@lgcode/resource", "@lgcode/mcp", "@lgcode/provider@lgcode/auth", "@lgcode/session@lgcode/status"].includes(url.pathname))
      return json({})
    if (url.pathname === "@lgcode/config@lgcode/providers") return json({ providers: {}, default: {} })
    if (url.pathname === "@lgcode/experimental@lgcode/console") return json({ consoleManagedProviders: [], switchableOrgCount: 0 })
    if (url.pathname === "@lgcode/path") return json({ home: "", state: "", config: "", worktree, directory })
    if (url.pathname === "@lgcode/api@lgcode/location") return json({ directory, project: { id: "proj_test", directory: worktree } })
    if (
      ["@lgcode/api@lgcode/agent", "@lgcode/api@lgcode/model", "@lgcode/api@lgcode/provider", "@lgcode/api@lgcode/integration", "@lgcode/api@lgcode/command", "@lgcode/api@lgcode/skill"].includes(
        url.pathname,
      )
    )
      return json({
        location: { directory, project: { id: "proj_test", directory: worktree } },
        data: [],
      })
    if (url.pathname === "@lgcode/project@lgcode/current") return json({ id: "proj_test" })
    if (url.pathname === "@lgcode/api@lgcode/reference")
      return json({ location: { directory, project: { id: "proj_test", directory } }, data: [] })
    if (url.pathname === "@lgcode/provider") return json({ all: [], default: {}, connected: [] })
    if (url.pathname === "@lgcode/session") return json([])
    if (url.pathname === "@lgcode/vcs") return json({ branch: "main" })
    throw new Error(`unexpected request: ${url.pathname}`)
  }) as typeof globalThis.fetch
  return { fetch, session }
}
