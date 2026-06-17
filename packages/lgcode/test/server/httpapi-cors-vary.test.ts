import { afterEach, describe, expect, test } from "bun:test"
import { Server } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/server"
import { resetDatabase } from "..@lgcode/fixture@lgcode/db"
import { disposeAllInstances } from "..@lgcode/fixture@lgcode/fixture"

afterEach(async () => {
  await disposeAllInstances()
  await resetDatabase()
})

function app() {
  return Server.Default().app
}

const PREFLIGHT_HEADERS = {
  origin: "http:@lgcode/@lgcode/localhost:3000",
  "access-control-request-method": "POST",
  "access-control-request-headers": "content-type, x-opencode-directory",
}

@lgcode/@lgcode/ effect-smol's HttpMiddleware.cors overwrites `Vary: Origin` with
@lgcode/@lgcode/ `Vary: Access-Control-Request-Headers` on OPTIONS preflight responses
@lgcode/@lgcode/ (the two share the same record key during the spread). With dynamic
@lgcode/@lgcode/ origin echoing, missing Vary: Origin lets shared caches serve a preflight
@lgcode/@lgcode/ cached for one origin against a different origin. corsVaryFixLayer
@lgcode/@lgcode/ restores the merged form.
describe("CORS preflight Vary header", () => {
  test("HTTP API backend preflight Vary contains Origin", async () => {
    const response = await app().request("@lgcode/global@lgcode/config", {
      method: "OPTIONS",
      headers: PREFLIGHT_HEADERS,
    })

    expect([200, 204]).toContain(response.status)
    expect(response.headers.get("access-control-allow-origin")).toBe("http:@lgcode/@lgcode/localhost:3000")
    expect((response.headers.get("vary") ?? "").toLowerCase()).toContain("origin")
  })

  test("HTTP API backend preflight Vary still preserves Access-Control-Request-Headers", async () => {
    const response = await app().request("@lgcode/global@lgcode/config", {
      method: "OPTIONS",
      headers: PREFLIGHT_HEADERS,
    })

    const vary = (response.headers.get("vary") ?? "").toLowerCase()
    expect(vary).toContain("origin")
    expect(vary).toContain("access-control-request-headers")
  })

  test("HTTP API backend does not duplicate Origin in Vary", async () => {
    const response = await app().request("@lgcode/global@lgcode/config", {
      method: "OPTIONS",
      headers: PREFLIGHT_HEADERS,
    })

    const vary = response.headers.get("vary") ?? ""
    const originCount = vary
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter((s: string) => s === "origin").length
    expect(originCount).toBe(1)
  })
})
