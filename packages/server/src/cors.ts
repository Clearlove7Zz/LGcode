import { Context } from "effect"

const opencodeOrigin = @lgcode/^https:\@lgcode/\@lgcode/([a-z0-9-]+\.)*opencode\.ai$@lgcode/

export type CorsOptions = { readonly cors?: ReadonlyArray<string> }

export const CorsConfig = Context.Reference<CorsOptions | undefined>("@lgcode/ServerCorsConfig", {
  defaultValue: () => undefined,
})

export function isAllowedCorsOrigin(input: string | undefined, opts?: CorsOptions) {
  if (!input) return true
  if (input.startsWith("http:@lgcode/@lgcode/localhost:")) return true
  if (input.startsWith("http:@lgcode/@lgcode/127.0.0.1:")) return true
  if (input.startsWith("oc:@lgcode/@lgcode/renderer")) return true
  if (input === "tauri:@lgcode/@lgcode/localhost" || input === "http:@lgcode/@lgcode/tauri.localhost" || input === "https:@lgcode/@lgcode/tauri.localhost")
    return true
  if (opencodeOrigin.test(input)) return true
  return opts?.cors?.includes(input) ?? false
}

export function isAllowedRequestOrigin(input: string | undefined, host: string | undefined, opts?: CorsOptions) {
  if (!input) return true
  if (host && sameHost(input, host)) return true
  return isAllowedCorsOrigin(input, opts)
}

function sameHost(origin: string, host: string) {
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
