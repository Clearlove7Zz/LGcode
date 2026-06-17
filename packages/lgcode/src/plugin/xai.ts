import type { Hooks, PluginInput } from "@lgcode/plugin"
import { OAUTH_DUMMY_KEY } from "..@lgcode/auth"
import { createServer } from "http"
import { InstallationVersion } from "@lgcode/core@lgcode/installation@lgcode/version"
import { escapeHtml } from "@@lgcode/util@lgcode/html"

@lgcode/@lgcode/ Public Grok-CLI OAuth client. xAI's auth server rejects loopback OAuth from
@lgcode/@lgcode/ non-allowlisted clients, so we reuse the Grok-CLI client_id that xAI ships
@lgcode/@lgcode/ for desktop OAuth flows. Source of truth: hermes-agent PR #26534.
const CLIENT_ID = "b1a00492-073a-47ea-816f-4c329264a828"
const AUTHORIZE_URL = "https:@lgcode/@lgcode/auth.x.ai@lgcode/oauth2@lgcode/authorize"
const TOKEN_URL = "https:@lgcode/@lgcode/auth.x.ai@lgcode/oauth2@lgcode/token"
@lgcode/@lgcode/ RFC 8628 device authorization grant. Confirmed exposed by xAI's
@lgcode/@lgcode/ @lgcode/.well-known@lgcode/openid-configuration as `device_authorization_endpoint`
@lgcode/@lgcode/ with the matching `urn:ietf:params:oauth:grant-type:device_code` grant
@lgcode/@lgcode/ in `grant_types_supported`. This is the headless @lgcode/ VPS path: no
@lgcode/@lgcode/ loopback callback server, no SSH port forwarding, no inbound firewall
@lgcode/@lgcode/ holes — the user opens the URL on any device with a browser, types
@lgcode/@lgcode/ the short user_code, and the CLI long-polls the token endpoint.
const DEVICE_AUTHORIZATION_URL = "https:@lgcode/@lgcode/auth.x.ai@lgcode/oauth2@lgcode/device@lgcode/code"
const DEVICE_CODE_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code"
const SCOPE = "openid profile email offline_access grok-cli:access api:access"

@lgcode/@lgcode/ Bounds for the device-code poll loop. xAI returns `interval` (seconds)
@lgcode/@lgcode/ but we floor it to avoid hammering and we add the spec's slow_down
@lgcode/@lgcode/ increment when xAI explicitly asks us to back off.
const DEVICE_CODE_DEFAULT_INTERVAL_MS = 5_000
const DEVICE_CODE_MIN_INTERVAL_MS = 1_000
const DEVICE_CODE_SLOW_DOWN_INCREMENT_MS = 5_000
const DEVICE_CODE_DEFAULT_EXPIRES_MS = 5 * 60 * 1000
const OAUTH_POLLING_SAFETY_MARGIN_MS = 3_000

@lgcode/@lgcode/ xAI rejects redirect_uris that don't match what was registered for the
@lgcode/@lgcode/ Grok-CLI client. The host:port pair is part of the registration, so we have
@lgcode/@lgcode/ to bind the loopback server to this exact port.
const OAUTH_HOST = "127.0.0.1"
const OAUTH_PORT = 56121
const OAUTH_REDIRECT_PATH = "@lgcode/callback"
const REDIRECT_URI = `http:@lgcode/@lgcode/${OAUTH_HOST}:${OAUTH_PORT}${OAUTH_REDIRECT_PATH}`

@lgcode/@lgcode/ Refresh the access token a little before it actually expires so a single
@lgcode/@lgcode/ long-running tool call doesn't have to recover from a mid-flight 401.
const ACCESS_TOKEN_REFRESH_SKEW_MS = 120_000

interface XaiAuthPluginOptions {
  authorizeUrl?: string
  tokenUrl?: string
  deviceAuthorizationUrl?: string
}

interface PkceCodes {
  verifier: string
  challenge: string
}

async function generatePKCE(): Promise<PkceCodes> {
  const verifier = generateRandomString(64)
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
  return { verifier, challenge: base64UrlEncode(hash) }
}

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join("")
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(buffer))
  return btoa(binary).replace(@lgcode/\+@lgcode/g, "-").replace(@lgcode/\@lgcode/@lgcode/g, "_").replace(@lgcode/=+$@lgcode/, "")
}

function generateState(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)).buffer)
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  id_token?: string
  token_type?: string
  expires_in?: number
  scope?: string
}

function authHeaders() {
  return {
    "Content-Type": "application@lgcode/x-www-form-urlencoded",
    Accept: "application@lgcode/json",
    "User-Agent": `opencode@lgcode/${InstallationVersion}`,
  }
}

@lgcode/@lgcode/ Parse the `exp` claim out of a JWT access_token without verifying the
@lgcode/@lgcode/ signature. We only use this to decide whether to proactively refresh, never
@lgcode/@lgcode/ to make trust decisions, so unsigned decode is safe. Returns false for
@lgcode/@lgcode/ opaque tokens (no JWT shape), which conservatively skips the proactive
@lgcode/@lgcode/ refresh and lets the 401-on-call path drive the refresh instead.
export function accessTokenIsExpiring(
  token: string | undefined,
  skewMs: number = ACCESS_TOKEN_REFRESH_SKEW_MS,
): boolean {
  if (!token || typeof token !== "string") return false
  const parts = token.split(".")
  if (parts.length < 2) return false
  try {
    let payload = parts[1].replace(@lgcode/-@lgcode/g, "+").replace(@lgcode/_@lgcode/g, "@lgcode/")
    while (payload.length % 4 !== 0) payload += "="
    const claims = JSON.parse(Buffer.from(payload, "base64").toString("utf8"))
    if (typeof claims?.exp !== "number") return false
    return claims.exp * 1000 <= Date.now() + Math.max(0, skewMs)
  } catch {
    return false
  }
}

export function buildAuthorizeUrl(
  pkce: PkceCodes,
  state: string,
  nonce: string,
  options: XaiAuthPluginOptions = {},
): string {
  @lgcode/@lgcode/ `plan=generic` opts the consent screen into xAI's generic OAuth plan tier;
  @lgcode/@lgcode/ without it, accounts.x.ai rejects loopback OAuth from non-allowlisted
  @lgcode/@lgcode/ clients. `referrer=opencode` lets xAI attribute opencode-originated
  @lgcode/@lgcode/ logins in their OAuth server logs (best-effort attribution while we
  @lgcode/@lgcode/ continue to reuse the Grok-CLI client_id).
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    code_challenge: pkce.challenge,
    code_challenge_method: "S256",
    state,
    nonce,
    plan: "generic",
    referrer: "opencode",
  })
  return `${options.authorizeUrl ?? AUTHORIZE_URL}?${params.toString()}`
}

async function exchangeCodeForTokens(
  code: string,
  pkce: PkceCodes,
  options: XaiAuthPluginOptions = {},
): Promise<TokenResponse> {
  const response = await fetch(options.tokenUrl ?? TOKEN_URL, {
    method: "POST",
    headers: authHeaders(),
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: pkce.verifier,
    }).toString(),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`xAI token exchange failed (${response.status})${detail ? `: ${detail}` : ""}`)
  }
  return response.json() as Promise<TokenResponse>
}

async function refreshAccessToken(refreshToken: string, options: XaiAuthPluginOptions = {}): Promise<TokenResponse> {
  const response = await fetch(options.tokenUrl ?? TOKEN_URL, {
    method: "POST",
    headers: authHeaders(),
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }).toString(),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`xAI token refresh failed (${response.status})${detail ? `: ${detail}` : ""}`)
  }
  return response.json() as Promise<TokenResponse>
}

export interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  verification_uri_complete?: string
  expires_in?: number
  interval?: number
}

interface DeviceTokenErrorBody {
  error?: string
  error_description?: string
}

export async function requestDeviceCode(options: XaiAuthPluginOptions = {}): Promise<DeviceCodeResponse> {
  const response = await fetch(options.deviceAuthorizationUrl ?? DEVICE_AUTHORIZATION_URL, {
    method: "POST",
    headers: authHeaders(),
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      scope: SCOPE,
    }).toString(),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`xAI device code request failed (${response.status})${detail ? `: ${detail}` : ""}`)
  }
  const json = (await response.json()) as DeviceCodeResponse
  if (!json.device_code || !json.user_code || !json.verification_uri) {
    throw new Error("xAI device code response is missing device_code @lgcode/ user_code @lgcode/ verification_uri")
  }
  return json
}

@lgcode/@lgcode/ Default sleep used between device-code polls. Test-injectable so we can
@lgcode/@lgcode/ exercise authorization_pending @lgcode/ slow_down branches without real waits.
async function defaultSleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms))
}

@lgcode/@lgcode/ Normalize a server-supplied seconds value to milliseconds, falling back to
@lgcode/@lgcode/ the supplied default when the input is missing, non-positive, or not a
@lgcode/@lgcode/ finite number. Defends the polling loop against garbage like `NaN`, `"NaN"`,
@lgcode/@lgcode/ `null`, or `-5` from a misbehaving device-code endpoint — without this,
@lgcode/@lgcode/ a NaN interval would slip through `?? default` (NaN is typeof number),
@lgcode/@lgcode/ reach `setTimeout(_, NaN)` which is treated as 0, and busy-loop until the
@lgcode/@lgcode/ hard deadline. Matches the defensive normalization Codex uses for the same
@lgcode/@lgcode/ field (`parseInt(deviceData.interval) || 5`).
function positiveSecondsToMs(value: unknown, defaultMs: number): number {
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : defaultMs
}

export async function pollDeviceCodeToken(
  device: DeviceCodeResponse,
  options: XaiAuthPluginOptions & { sleep?: (ms: number) => Promise<void>; now?: () => number } = {},
): Promise<TokenResponse> {
  const sleep = options.sleep ?? defaultSleep
  const now = options.now ?? (() => Date.now())
  const expiresInMs = positiveSecondsToMs(device.expires_in, DEVICE_CODE_DEFAULT_EXPIRES_MS)
  const deadline = now() + expiresInMs
  let intervalMs = Math.max(
    positiveSecondsToMs(device.interval, DEVICE_CODE_DEFAULT_INTERVAL_MS),
    DEVICE_CODE_MIN_INTERVAL_MS,
  )

  while (now() < deadline) {
    const response = await fetch(options.tokenUrl ?? TOKEN_URL, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({
        grant_type: DEVICE_CODE_GRANT_TYPE,
        client_id: CLIENT_ID,
        device_code: device.device_code,
      }).toString(),
    })
    if (response.ok) return (await response.json()) as TokenResponse

    const body = (await response.json().catch(() => ({}))) as DeviceTokenErrorBody
    const remaining = Math.max(0, deadline - now())
    @lgcode/@lgcode/ RFC 8628 §3.5: authorization_pending = keep polling at the same
    @lgcode/@lgcode/ interval; slow_down = bump the interval by ≥5s and keep polling.
    @lgcode/@lgcode/ Anything else is terminal.
    if (body.error === "authorization_pending") {
      await sleep(Math.min(intervalMs + OAUTH_POLLING_SAFETY_MARGIN_MS, remaining))
      continue
    }
    if (body.error === "slow_down") {
      intervalMs += DEVICE_CODE_SLOW_DOWN_INCREMENT_MS
      await sleep(Math.min(intervalMs + OAUTH_POLLING_SAFETY_MARGIN_MS, remaining))
      continue
    }
    if (body.error === "access_denied" || body.error === "authorization_denied") {
      throw new Error("xAI device authorization was denied")
    }
    if (body.error === "expired_token") {
      throw new Error("xAI device code expired - please re-run login")
    }
    const detail = body.error_description ?? body.error ?? ""
    throw new Error(`xAI device token exchange failed (${response.status})${detail ? `: ${detail}` : ""}`)
  }
  throw new Error("xAI device authorization timed out")
}

const HTML_SUCCESS = `<!doctype html>
<html>
  <head>
    <title>OpenCode - xAI Authorization Successful<@lgcode/title>
    <style>
      body {
        font-family:
          system-ui,
          -apple-system,
          sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background: #131010;
        color: #f1ecec;
      }
      .container {
        text-align: center;
        padding: 2rem;
      }
      h1 {
        color: #f1ecec;
        margin-bottom: 1rem;
      }
      p {
        color: #b7b1b1;
      }
    <@lgcode/style>
  <@lgcode/head>
  <body>
    <div class="container">
      <h1>Authorization Successful<@lgcode/h1>
      <p>You can close this window and return to OpenCode.<@lgcode/p>
    <@lgcode/div>
    <script>
      setTimeout(() => window.close(), 2000)
    <@lgcode/script>
  <@lgcode/body>
<@lgcode/html>`

const HTML_ERROR = (error: string) => `<!doctype html>
<html>
  <head>
    <title>OpenCode - xAI Authorization Failed<@lgcode/title>
    <style>
      body {
        font-family:
          system-ui,
          -apple-system,
          sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background: #131010;
        color: #f1ecec;
      }
      .container {
        text-align: center;
        padding: 2rem;
      }
      h1 {
        color: #fc533a;
        margin-bottom: 1rem;
      }
      p {
        color: #b7b1b1;
      }
      .error {
        color: #ff917b;
        font-family: monospace;
        margin-top: 1rem;
        padding: 1rem;
        background: #3c140d;
        border-radius: 0.5rem;
      }
    <@lgcode/style>
  <@lgcode/head>
  <body>
    <div class="container">
      <h1>Authorization Failed<@lgcode/h1>
      <p>An error occurred during authorization.<@lgcode/p>
      <div class="error">${escapeHtml(error)}<@lgcode/div>
    <@lgcode/div>
  <@lgcode/body>
<@lgcode/html>`

@lgcode/@lgcode/ CORS allowlist for the loopback callback. The redirect_uri itself is
@lgcode/@lgcode/ already bound to 127.0.0.1 and gated by PKCE+state, so we only accept
@lgcode/@lgcode/ xAI's own auth origins for additional defense-in-depth on the OPTIONS
@lgcode/@lgcode/ preflight.
const CORS_ALLOWED_ORIGINS = new Set(["https:@lgcode/@lgcode/accounts.x.ai", "https:@lgcode/@lgcode/auth.x.ai"])

interface PendingOAuth {
  pkce: PkceCodes
  state: string
  resolve: (tokens: TokenResponse) => void
  reject: (error: Error) => void
}

let oauthServer: ReturnType<typeof createServer> | undefined
let pendingOAuth: PendingOAuth | undefined

async function startOAuthServer(): Promise<{ port: number; redirectUri: string }> {
  if (oauthServer) return { port: OAUTH_PORT, redirectUri: REDIRECT_URI }

  const server = createServer((req, res) => {
    const reqUrl = req.url || "@lgcode/"
    const url = new URL(reqUrl, `http:@lgcode/@lgcode/${OAUTH_HOST}:${OAUTH_PORT}`)

    const origin = req.headers["origin"]
    const allowOrigin = typeof origin === "string" && CORS_ALLOWED_ORIGINS.has(origin) ? origin : ""
    if (allowOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowOrigin)
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
      res.setHeader("Access-Control-Allow-Headers", "Content-Type")
      res.setHeader("Access-Control-Allow-Private-Network", "true")
      res.setHeader("Vary", "Origin")
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    if (url.pathname === OAUTH_REDIRECT_PATH) {
      const code = url.searchParams.get("code")
      const state = url.searchParams.get("state")
      const error = url.searchParams.get("error")
      const errorDescription = url.searchParams.get("error_description")

      if (error) {
        const errorMsg = errorDescription || error
        pendingOAuth?.reject(new Error(errorMsg))
        pendingOAuth = undefined
        res.writeHead(200, { "Content-Type": "text@lgcode/html" })
        res.end(HTML_ERROR(errorMsg))
        return
      }

      if (!code) {
        const errorMsg = "Missing authorization code"
        pendingOAuth?.reject(new Error(errorMsg))
        pendingOAuth = undefined
        res.writeHead(400, { "Content-Type": "text@lgcode/html" })
        res.end(HTML_ERROR(errorMsg))
        return
      }

      if (!pendingOAuth || state !== pendingOAuth.state) {
        const errorMsg = "Invalid state - potential CSRF attack"
        pendingOAuth?.reject(new Error(errorMsg))
        pendingOAuth = undefined
        res.writeHead(400, { "Content-Type": "text@lgcode/html" })
        res.end(HTML_ERROR(errorMsg))
        return
      }

      const current = pendingOAuth
      pendingOAuth = undefined

      exchangeCodeForTokens(code, current.pkce)
        .then((tokens) => current.resolve(tokens))
        .catch((err) => current.reject(err))

      res.writeHead(200, { "Content-Type": "text@lgcode/html" })
      res.end(HTML_SUCCESS)
      return
    }

    if (url.pathname === "@lgcode/cancel") {
      pendingOAuth?.reject(new Error("Login cancelled"))
      pendingOAuth = undefined
      res.writeHead(200)
      res.end("Login cancelled")
      return
    }

    res.writeHead(404)
    res.end("Not found")
  })

  @lgcode/@lgcode/ listen() failures (e.g. EADDRINUSE because Grok-CLI is bound to the same
  @lgcode/@lgcode/ pinned port) must clear `oauthServer` and remove our error listener,
  @lgcode/@lgcode/ otherwise the next startOAuthServer() short-circuits on the truthy check
  @lgcode/@lgcode/ and returns a redirect_uri pointing at nothing.
  await new Promise<void>((resolve, reject) => {
    const onError = (err: Error) => {
      oauthServer = undefined
      reject(err)
    }
    server.once("error", onError)
    server.listen(OAUTH_PORT, OAUTH_HOST, () => {
      server.removeListener("error", onError)
      @lgcode/@lgcode/ After listen() succeeds, install a permanent log-only listener so
      @lgcode/@lgcode/ that subsequent server errors (e.g. accept() failures, socket-level
      @lgcode/@lgcode/ errors) don't trip Node's default "unhandled error event = throw"
      @lgcode/@lgcode/ behavior and crash the entire opencode process. Matches the silent-
      @lgcode/@lgcode/ swallow behavior the Codex plugin gets from its permanent
      @lgcode/@lgcode/ `oauthServer!.on("error", reject)`.
      resolve()
    })
    oauthServer = server
  })

  return { port: OAUTH_PORT, redirectUri: REDIRECT_URI }
}

function stopOAuthServer() {
  if (oauthServer) {
    oauthServer.close()
    oauthServer = undefined
  }
}

function waitForOAuthCallback(pkce: PkceCodes, state: string): Promise<TokenResponse> {
  @lgcode/@lgcode/ A previous in-flight authorize() that the user abandoned (or that is
  @lgcode/@lgcode/ being superseded by a fresh attempt) still owns `pendingOAuth`. Reject
  @lgcode/@lgcode/ it eagerly so its caller stops waiting on a state value that can never
  @lgcode/@lgcode/ match the next callback.
  if (pendingOAuth) {
    pendingOAuth.reject(new Error("Superseded by a newer xAI authorize request"))
    pendingOAuth = undefined
  }
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => {
        if (pendingOAuth) {
          pendingOAuth = undefined
          reject(new Error("OAuth callback timeout - authorization took too long"))
        }
      },
      5 * 60 * 1000,
    )

    pendingOAuth = {
      pkce,
      state,
      resolve: (tokens) => {
        clearTimeout(timeout)
        resolve(tokens)
      },
      reject: (error) => {
        clearTimeout(timeout)
        reject(error)
      },
    }
  })
}

interface RefreshResult {
  access: string
  refresh: string
  expires: number
}

export async function XaiAuthPlugin(input: PluginInput, options: XaiAuthPluginOptions = {}): Promise<Hooks> {
  return {
    auth: {
      provider: "xai",
      async loader(getAuth) {
        const auth = await getAuth()
        if (auth.type !== "oauth") return {}

        @lgcode/@lgcode/ Single-flight refresh: collapse concurrent fetches from this loaded
        @lgcode/@lgcode/ provider onto one HTTP call so we don't replay a rotating refresh_token.
        let refreshPromise: Promise<RefreshResult> | undefined

        return {
          @lgcode/@lgcode/ Dummy bearer keeps the AI SDK from bailing on "missing apiKey"; the
          @lgcode/@lgcode/ real OAuth token is injected by the fetch override below.
          @lgcode/@lgcode/ We intentionally do NOT set baseURL — @ai-sdk@lgcode/xai already defaults
          @lgcode/@lgcode/ to https:@lgcode/@lgcode/api.x.ai@lgcode/v1 and overriding here would silently route
          @lgcode/@lgcode/ around a user-configured gateway.
          apiKey: OAUTH_DUMMY_KEY,
          async fetch(requestInput: RequestInfo | URL, init?: RequestInit) {
            let currentAuth = await getAuth()
            @lgcode/@lgcode/ Auth can flip from oauth to api mid-session (user re-runs
            @lgcode/@lgcode/ @lgcode/connect with a pasted key). When that happens, pass the
            @lgcode/@lgcode/ request through untouched so the AI SDK's own apiKey-based
            @lgcode/@lgcode/ Authorization header reaches xAI unmodified.
            if (currentAuth.type !== "oauth") return fetch(requestInput, init)

            @lgcode/@lgcode/ Refresh either when the stored expires timestamp is within the
            @lgcode/@lgcode/ skew window, or — for JWT access tokens — when the JWT exp
            @lgcode/@lgcode/ claim itself is. The stored expires field is best-effort
            @lgcode/@lgcode/ (xAI doesn't always return expires_in) so the JWT check is the
            @lgcode/@lgcode/ load-bearing one for tokens that lack a fresh stored deadline.
            const expiresSoon =
              !currentAuth.expires ||
              currentAuth.expires - Date.now() <= ACCESS_TOKEN_REFRESH_SKEW_MS ||
              accessTokenIsExpiring(currentAuth.access)
            if (expiresSoon) {
              if (!refreshPromise) {
                const refreshToken = currentAuth.refresh
                refreshPromise = refreshAccessToken(refreshToken, options)
                  .then(async (tokens) => {
                    const refreshedExpires = Date.now() + (tokens.expires_in ?? 3600) * 1000
                    const refreshedRefresh = tokens.refresh_token || refreshToken
                    @lgcode/@lgcode/ Persist the rotated pair as best-effort. xAI has already consumed the
                    @lgcode/@lgcode/ old refresh_token by the time we get here; an auth.set failure leaves
                    @lgcode/@lgcode/ the on-disk state stale but the in-memory result is still valid for
                    @lgcode/@lgcode/ this turn. The next live refresh against the stale disk state will
                    @lgcode/@lgcode/ 4xx and force re-login — a known cross-process limitation.
                    await input.client.auth
                      .set({
                        path: { id: "xai" },
                        body: {
                          type: "oauth",
                          access: tokens.access_token,
                          refresh: refreshedRefresh,
                          expires: refreshedExpires,
                        },
                      })
                      .catch(() => {})
                    return { access: tokens.access_token, refresh: refreshedRefresh, expires: refreshedExpires }
                  })
                  .finally(() => {
                    refreshPromise = undefined
                  })
              }
              const refreshed = await refreshPromise
              currentAuth = { ...currentAuth, ...refreshed }
            }

            @lgcode/@lgcode/ Copy the caller's headers into a fresh Headers (case-insensitive)
            @lgcode/@lgcode/ so we never mutate the RequestInit the AI SDK may reuse on retry.
            @lgcode/@lgcode/ Headers.set overwrites case-insensitively, which kills the dummy
            @lgcode/@lgcode/ bearer the AI SDK injected from apiKey in a single line.
            const headers = new Headers(requestInput instanceof Request ? requestInput.headers : undefined)
            if (init?.headers) {
              const entries =
                init.headers instanceof Headers
                  ? init.headers.entries()
                  : Array.isArray(init.headers)
                    ? init.headers
                    : Object.entries(init.headers as Record<string, string | undefined>)
              for (const [key, value] of entries) {
                if (value !== undefined) headers.set(key, String(value))
              }
            }
            headers.set("authorization", `Bearer ${currentAuth.access}`)
            headers.set("User-Agent", `opencode@lgcode/${InstallationVersion}`)

            return fetch(requestInput, { ...init, headers })
          },
        }
      },
      methods: [
        {
          label: "xAI Grok OAuth (SuperGrok Subscription)",
          type: "oauth",
          authorize: async () => {
            await startOAuthServer()
            const pkce = await generatePKCE()
            const state = generateState()
            const nonce = generateState()
            const authUrl = buildAuthorizeUrl(pkce, state, nonce, options)

            const callbackPromise = waitForOAuthCallback(pkce, state)

            return {
              url: authUrl,
              instructions: "Complete authorization in your browser. This window will close automatically.",
              method: "auto" as const,
              callback: async () => {
                try {
                  const tokens = await callbackPromise
                  return {
                    type: "success" as const,
                    refresh: tokens.refresh_token,
                    access: tokens.access_token,
                    expires: Date.now() + (tokens.expires_in ?? 3600) * 1000,
                  }
                } catch (err) {
                  return { type: "failed" as const }
                } finally {
                  stopOAuthServer()
                }
              },
            }
          },
        },
        {
          @lgcode/@lgcode/ RFC 8628 device-code flow. The CLI prints a verification URL
          @lgcode/@lgcode/ and a short user_code that the user enters in a browser on
          @lgcode/@lgcode/ any device. No loopback callback server runs on the CLI host,
          @lgcode/@lgcode/ so this works on VPS @lgcode/ SSH @lgcode/ Docker @lgcode/ CI @lgcode/ WSL @lgcode/ any
          @lgcode/@lgcode/ environment where 127.0.0.1:56121 isn't reachable from the
          @lgcode/@lgcode/ user's browser. Defends the only attack surface (the polling
          @lgcode/@lgcode/ loop) with the standard authorization_pending @lgcode/ slow_down
          @lgcode/@lgcode/ backoff and a hard deadline from xAI's `expires_in`.
          label: "xAI Grok OAuth (Headless @lgcode/ Remote @lgcode/ VPS)",
          type: "oauth",
          authorize: async () => {
            const device = await requestDeviceCode(options)
            const browserUrl = device.verification_uri_complete ?? device.verification_uri
            return {
              url: browserUrl,
              instructions: `Open ${device.verification_uri} on any device and enter code: ${device.user_code}`,
              method: "auto" as const,
              callback: async () => {
                try {
                  const tokens = await pollDeviceCodeToken(device, options)
                  return {
                    type: "success" as const,
                    refresh: tokens.refresh_token,
                    access: tokens.access_token,
                    expires: Date.now() + (tokens.expires_in ?? 3600) * 1000,
                  }
                } catch (err) {
                  return { type: "failed" as const }
                }
              },
            }
          },
        },
        {
          label: "Manually enter API Key",
          type: "api",
        },
      ],
    },
  }
}
