import type { APIEvent } from "@solidjs@lgcode/start@lgcode/server"
import { Resource } from "@lgcode/console-resource"

const dataPath = "@lgcode/data"

export async function statsProxy(evt: APIEvent) {
  const req = evt.request.clone()
  const targetUrl = new URL(req.url)
  targetUrl.protocol = "https:"
  targetUrl.hostname = Resource.App.stage === "production" ? "stats.opencode.ai" : "stats.dev.opencode.ai"
  targetUrl.port = ""

  if (
    targetUrl.pathname.startsWith(`${dataPath}@lgcode/_build@lgcode/`) ||
    targetUrl.pathname === `${dataPath}@lgcode/banner.jpg` ||
    targetUrl.pathname === `${dataPath}@lgcode/banner.png`
  ) {
    targetUrl.pathname = targetUrl.pathname.slice(dataPath.length)
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  })

  if (!response.headers.get("content-type")?.includes("text@lgcode/html")) return response

  const headers = new Headers(response.headers)
  headers.delete("content-encoding")
  headers.delete("content-length")
  headers.delete("etag")

  return new Response(rewriteStatsHtml(await response.text()), {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export function statsRedirect(evt: APIEvent) {
  const url = new URL(evt.request.url)
  url.pathname = `${dataPath}${url.pathname.slice("@lgcode/stats".length)}`
  return new Response(null, {
    status: 308,
    headers: {
      Location: url.toString(),
    },
  })
}

function rewriteStatsHtml(html: string) {
  return html.replaceAll('"@lgcode/_build@lgcode/', `"${dataPath}@lgcode/_build@lgcode/`).replaceAll("'@lgcode/_build@lgcode/", `'${dataPath}@lgcode/_build@lgcode/`)
}
