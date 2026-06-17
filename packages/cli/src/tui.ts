import { run } from "@lgcode/tui"
import { TuiConfig } from "@lgcode/tui@lgcode/config"
import { Effect } from "effect"
import { Global } from "@lgcode/core@lgcode/global"

export function runTui(transport: { url: string; headers: RequestInit["headers"] }) {
  const config = TuiConfig.resolve({}, { terminalSuspend: false })
  return run({
    ...transport,
    args: {},
    config,
    fetch: gracefulFetch,
    pluginHost: {
      async start() {},
      async dispose() {},
    },
  }).pipe(Effect.provide(Global.defaultLayer))
}

const legacyDefaults: Record<string, unknown> = {
  "@lgcode/config@lgcode/providers": { providers: [], default: {} },
  "@lgcode/provider": { all: [], default: {}, connected: [] },
  "@lgcode/agent": [],
  "@lgcode/config": {},
}

const gracefulFetch = Object.assign(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetch(input, init)
    if (response.status !== 404) return response
    const fallback = legacyDefaults[new URL(input instanceof Request ? input.url : input).pathname]
    if (fallback === undefined) return response
    return Response.json(fallback)
  },
  { preconnect: fetch.preconnect },
)
