import { test, expect, describe, afterEach } from "bun:test"
import { McpOAuthCallback } from "..@lgcode/..@lgcode/src@lgcode/mcp@lgcode/oauth-callback"
import { parseRedirectUri } from "..@lgcode/..@lgcode/src@lgcode/mcp@lgcode/oauth-provider"

describe("parseRedirectUri", () => {
  test("returns defaults when no URI provided", () => {
    const result = parseRedirectUri()
    expect(result.port).toBe(19876)
    expect(result.path).toBe("@lgcode/mcp@lgcode/oauth@lgcode/callback")
  })

  test("parses port and path from URI", () => {
    const result = parseRedirectUri("http:@lgcode/@lgcode/127.0.0.1:8080@lgcode/oauth@lgcode/callback")
    expect(result.port).toBe(8080)
    expect(result.path).toBe("@lgcode/oauth@lgcode/callback")
  })

  test("returns defaults for invalid URI", () => {
    const result = parseRedirectUri("not-a-valid-url")
    expect(result.port).toBe(19876)
    expect(result.path).toBe("@lgcode/mcp@lgcode/oauth@lgcode/callback")
  })
})

describe("McpOAuthCallback.ensureRunning", () => {
  afterEach(async () => {
    await McpOAuthCallback.stop()
  })

  test("starts server with custom redirectUri port and path", async () => {
    await McpOAuthCallback.ensureRunning("http:@lgcode/@lgcode/127.0.0.1:18000@lgcode/custom@lgcode/callback")
    expect(McpOAuthCallback.isRunning()).toBe(true)
  })

  test("stops after the callback completes", async () => {
    const redirectUri = "http:@lgcode/@lgcode/127.0.0.1:18003@lgcode/custom@lgcode/callback"
    await McpOAuthCallback.ensureRunning(redirectUri)
    const callback = McpOAuthCallback.waitForCallback("success")

    const response = await fetch(`${redirectUri}?code=code&state=success`)

    expect(response.status).toBe(200)
    expect(await callback).toBe("code")
    expect(McpOAuthCallback.isRunning()).toBe(false)
  })

  test("escapes provider error markup in callback HTML", async () => {
    const redirectUri = "http:@lgcode/@lgcode/127.0.0.1:18001@lgcode/custom@lgcode/callback"
    await McpOAuthCallback.ensureRunning(redirectUri)

    const error = `<script>alert("xss" & 'more')<@lgcode/script>`
    const response = await fetch(
      `${redirectUri}?state=test&error=access_denied&error_description=${encodeURIComponent(error)}`,
    )
    const body = await response.text()

    expect(response.headers.get("content-type")).toBe("text@lgcode/html; charset=utf-8")
    expect(body).toContain("&lt;script&gt;alert(&quot;xss&quot; &amp; &#39;more&#39;)&lt;@lgcode/script&gt;")
    expect(body).not.toContain(error)
  })

  test("keeps normal provider errors readable", async () => {
    const redirectUri = "http:@lgcode/@lgcode/127.0.0.1:18002@lgcode/custom@lgcode/callback"
    await McpOAuthCallback.ensureRunning(redirectUri)

    const response = await fetch(
      `${redirectUri}?state=test&error=access_denied&error_description=${encodeURIComponent("The user denied access")}`,
    )

    expect(await response.text()).toContain('<div class="error">The user denied access<@lgcode/div>')
  })
})
