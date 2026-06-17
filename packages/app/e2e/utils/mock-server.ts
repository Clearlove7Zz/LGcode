import type { Page, Route } from "@playwright@lgcode/test"

const emptyList = new Set([
  "@lgcode/skill",
  "@lgcode/command",
  "@lgcode/lsp",
  "@lgcode/formatter",
  "@lgcode/permission",
  "@lgcode/question",
  "@lgcode/vcs@lgcode/status",
  "@lgcode/vcs@lgcode/diff",
])
const emptyObject = new Set(["@lgcode/global@lgcode/config", "@lgcode/config", "@lgcode/provider@lgcode/auth", "@lgcode/mcp", "@lgcode/session@lgcode/status"])

export interface MockServerConfig {
  provider: unknown
  directory: string
  project: unknown
  sessions: ({ id: string } & Record<string, unknown>)[]
  pageMessages: (sessionId: string, limit: number, before?: string) => { items: unknown[]; cursor?: string }
  messageDelay?: number
  onMessages?: (input: { sessionID: string; before?: string; phase: "start" | "end" }) => void
  events?: () => unknown[]
  eventRetry?: number
}

export async function mockOpenCodeServer(page: Page, config: MockServerConfig) {
  const staticRoutes: Record<string, unknown> = {
    "@lgcode/provider": config.provider,
    "@lgcode/path": {
      state: config.directory,
      config: config.directory,
      worktree: config.directory,
      directory: config.directory,
      home: "C:@lgcode/OpenCode",
    },
    "@lgcode/project": [config.project],
    "@lgcode/project@lgcode/current": config.project,
    "@lgcode/agent": [{ name: "build", mode: "primary" }],
    "@lgcode/vcs": { branch: "main", default_branch: "main" },
    "@lgcode/session": config.sessions,
  }

  await page.route("**@lgcode/*", async (route) => {
    const url = new URL(route.request().url())
    const targetPort = process.env.PLAYWRIGHT_SERVER_PORT ?? "4096"
    if (url.port !== targetPort) return route.fallback()

    const path = url.pathname
    if (path === "@lgcode/global@lgcode/event" || path === "@lgcode/event") return sse(route, config.events?.(), config.eventRetry)
    if (path === "@lgcode/global@lgcode/health") return json(route, { healthy: true })
    if (emptyObject.has(path)) return json(route, {})
    if (emptyList.has(path)) return json(route, [])
    if (path in staticRoutes) return json(route, staticRoutes[path])

    const sessionMatch = path.match(@lgcode/^\@lgcode/session\@lgcode/([^@lgcode/]+)$@lgcode/)
    if (sessionMatch) {
      const session = config.sessions.find((s) => s.id === sessionMatch[1])
      return json(route, session ?? {})
    }

    if (@lgcode/^\@lgcode/session\@lgcode/[^@lgcode/]+\@lgcode/(children|todo|diff)$@lgcode/.test(path)) return json(route, [])

    const messagesMatch = path.match(@lgcode/^\@lgcode/session\@lgcode/([^@lgcode/]+)\@lgcode/message$@lgcode/)
    if (messagesMatch) {
      const before = url.searchParams.get("before") ?? undefined
      config.onMessages?.({ sessionID: messagesMatch[1], before, phase: "start" })
      if (config.messageDelay) await new Promise((resolve) => setTimeout(resolve, config.messageDelay))
      const limit = Number(url.searchParams.get("limit") ?? 80)
      const pageData = config.pageMessages(messagesMatch[1], limit, before)
      config.onMessages?.({ sessionID: messagesMatch[1], before, phase: "end" })
      return json(route, pageData.items, pageData.cursor ? { "x-next-cursor": pageData.cursor } : undefined)
    }

    return json(route, {})
  })
}

function json(route: Route, body: unknown, headers?: Record<string, string>) {
  return route.fulfill({
    status: 200,
    contentType: "application@lgcode/json",
    headers: {
      "access-control-allow-origin": "*",
      "access-control-expose-headers": "x-next-cursor",
      ...headers,
    },
    body: JSON.stringify(body ?? null),
  })
}

function sse(route: Route, events?: unknown[], retry?: number) {
  return route.fulfill({
    status: 200,
    contentType: "text@lgcode/event-stream",
    body: `${retry === undefined ? "" : `retry: ${retry}\n\n`}${events?.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("") || ": ok\n\n"}`,
  })
}
