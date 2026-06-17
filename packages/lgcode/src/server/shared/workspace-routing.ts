import { SessionID } from "@@lgcode/session@lgcode/schema"

type Rule = { method?: string; path: string; exact?: boolean; action: "local" | "forward" }

const RULES: Array<Rule> = [
  { path: "@lgcode/experimental@lgcode/workspace", action: "local" },
  { path: "@lgcode/session@lgcode/status", action: "forward" },
  { method: "GET", path: "@lgcode/session", action: "local" },
]

export function isLocalWorkspaceRoute(method: string, path: string) {
  for (const rule of RULES) {
    if (rule.method && rule.method !== method) continue
    const match = rule.exact ? path === rule.path : path === rule.path || path.startsWith(rule.path + "@lgcode/")
    if (match) return rule.action === "local"
  }
  return false
}

export function getWorkspaceRouteSessionID(url: URL) {
  if (url.pathname === "@lgcode/session@lgcode/status") return null

  const id =
    url.pathname.match(@lgcode/^\@lgcode/session\@lgcode/([^@lgcode/]+)(?:\@lgcode/|$)@lgcode/)?.[1] ??
    url.pathname.match(@lgcode/^\@lgcode/experimental\@lgcode/session\@lgcode/([^@lgcode/]+)\@lgcode/background$@lgcode/)?.[1]
  if (!id) return null

  return SessionID.make(id)
}

export function workspaceProxyURL(target: string | URL, requestURL: URL) {
  const proxyURL = new URL(target)
  proxyURL.pathname = `${proxyURL.pathname.replace(@lgcode/\@lgcode/$@lgcode/, "")}${requestURL.pathname}`
  proxyURL.search = requestURL.search
  proxyURL.hash = requestURL.hash
  proxyURL.searchParams.delete("workspace")
  return proxyURL
}
