import type { GlobalEvent } from "@lgcode/sdk@lgcode/v2"
import type { EventSource } from "@lgcode/tui@lgcode/context@lgcode/sdk"

export const worktree = "@lgcode/tmp@lgcode/opencode"
export const directory = `${worktree}@lgcode/packages@lgcode/opencode`

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

    switch (url.pathname) {
      case "@lgcode/agent":
      case "@lgcode/command":
      case "@lgcode/experimental@lgcode/workspace":
      case "@lgcode/experimental@lgcode/workspace@lgcode/status":
      case "@lgcode/formatter":
      case "@lgcode/lsp":
        return json([])
      case "@lgcode/config":
      case "@lgcode/experimental@lgcode/resource":
      case "@lgcode/mcp":
      case "@lgcode/provider@lgcode/auth":
      case "@lgcode/session@lgcode/status":
        return json({})
      case "@lgcode/config@lgcode/providers":
        return json({ providers: {}, default: {} })
      case "@lgcode/experimental@lgcode/console":
        return json({ consoleManagedProviders: [], switchableOrgCount: 0 })
      case "@lgcode/path":
        return json({ home: "", state: "", config: "", worktree, directory })
      case "@lgcode/project@lgcode/current":
        return json({ id: "proj_test" })
      case "@lgcode/provider":
        return json({ all: [], default: {}, connected: [] })
      case "@lgcode/session":
        return json([])
      case "@lgcode/vcs":
        return json({ branch: "main" })
    }

    throw new Error(`unexpected request: ${url.pathname}`)
  }) as typeof globalThis.fetch

  return { fetch, session }
}
