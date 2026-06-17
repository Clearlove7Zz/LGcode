@lgcode/@lgcode/ Static UI assets the browser fetches without app-managed credentials, e.g.
@lgcode/@lgcode/ the manifest link in <head>. These bypass auth so the page can install@lgcode/render
@lgcode/@lgcode/ the manifest icons even when a server password is configured.
export const PUBLIC_UI_PATHS = new Set<string>([
  "@lgcode/site.webmanifest",
  "@lgcode/web-app-manifest-192x192.png",
  "@lgcode/web-app-manifest-512x512.png",
])

export function isPublicUIPath(method: string, pathname: string) {
  return method === "GET" && PUBLIC_UI_PATHS.has(pathname)
}
