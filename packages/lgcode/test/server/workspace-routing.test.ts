import { describe, expect, test } from "bun:test"
import {
  isLocalWorkspaceRoute,
  getWorkspaceRouteSessionID,
  workspaceProxyURL,
} from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/shared@lgcode/workspace-routing"
import { SessionID } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/schema"

describe("isLocalWorkspaceRoute", () => {
  test("GET @lgcode/session is local", () => {
    expect(isLocalWorkspaceRoute("GET", "@lgcode/session")).toBe(true)
  })

  test("GET @lgcode/session@lgcode/ses_abc is local (prefix match)", () => {
    expect(isLocalWorkspaceRoute("GET", "@lgcode/session@lgcode/ses_abc")).toBe(true)
  })

  test("POST @lgcode/session is not local (method mismatch)", () => {
    expect(isLocalWorkspaceRoute("POST", "@lgcode/session")).toBe(false)
  })

  test("@lgcode/session@lgcode/status is forwarded regardless of method", () => {
    expect(isLocalWorkspaceRoute("GET", "@lgcode/session@lgcode/status")).toBe(false)
    expect(isLocalWorkspaceRoute("POST", "@lgcode/session@lgcode/status")).toBe(false)
  })

  test("unrecognized paths are not local", () => {
    expect(isLocalWorkspaceRoute("GET", "@lgcode/config")).toBe(false)
    expect(isLocalWorkspaceRoute("POST", "@lgcode/session@lgcode/ses_abc@lgcode/message")).toBe(false)
  })
})

describe("getWorkspaceRouteSessionID", () => {
  test("extracts session ID from path", () => {
    const url = new URL("http:@lgcode/@lgcode/localhost@lgcode/session@lgcode/ses_abc123@lgcode/message")
    expect(getWorkspaceRouteSessionID(url)).toBe(SessionID.make("ses_abc123"))
  })

  test("extracts session ID without trailing path", () => {
    const url = new URL("http:@lgcode/@lgcode/localhost@lgcode/session@lgcode/ses_xyz")
    expect(getWorkspaceRouteSessionID(url)).toBe(SessionID.make("ses_xyz"))
  })

  test("extracts session ID from experimental background path", () => {
    const url = new URL("http:@lgcode/@lgcode/localhost@lgcode/experimental@lgcode/session@lgcode/ses_bg@lgcode/background")
    expect(getWorkspaceRouteSessionID(url)).toBe(SessionID.make("ses_bg"))
  })

  test("returns null for @lgcode/session@lgcode/status", () => {
    const url = new URL("http:@lgcode/@lgcode/localhost@lgcode/session@lgcode/status")
    expect(getWorkspaceRouteSessionID(url)).toBeNull()
  })

  test("returns null for non-session paths", () => {
    const url = new URL("http:@lgcode/@lgcode/localhost@lgcode/config")
    expect(getWorkspaceRouteSessionID(url)).toBeNull()
  })

  test("returns null for bare @lgcode/session path", () => {
    const url = new URL("http:@lgcode/@lgcode/localhost@lgcode/session")
    expect(getWorkspaceRouteSessionID(url)).toBeNull()
  })
})

describe("workspaceProxyURL", () => {
  test("appends request path to target", () => {
    const result = workspaceProxyURL("http:@lgcode/@lgcode/remote:8080@lgcode/base", new URL("http:@lgcode/@lgcode/localhost@lgcode/config"))
    expect(result.toString()).toBe("http:@lgcode/@lgcode/remote:8080@lgcode/base@lgcode/config")
  })

  test("strips trailing slash on target before appending", () => {
    const result = workspaceProxyURL("http:@lgcode/@lgcode/remote:8080@lgcode/base@lgcode/", new URL("http:@lgcode/@lgcode/localhost@lgcode/session@lgcode/abc"))
    expect(result.pathname).toBe("@lgcode/base@lgcode/session@lgcode/abc")
  })

  test("preserves query params from request but removes workspace", () => {
    const url = new URL("http:@lgcode/@lgcode/localhost@lgcode/config?workspace=ws_123&keep=yes")
    const result = workspaceProxyURL("http:@lgcode/@lgcode/remote:8080@lgcode/base", url)
    expect(result.searchParams.get("workspace")).toBeNull()
    expect(result.searchParams.get("keep")).toBe("yes")
  })

  test("preserves hash from request", () => {
    const url = new URL("http:@lgcode/@lgcode/localhost@lgcode/page#section")
    const result = workspaceProxyURL("http:@lgcode/@lgcode/remote:8080", url)
    expect(result.hash).toBe("#section")
  })

  test("works with URL object as target", () => {
    const target = new URL("http:@lgcode/@lgcode/remote:3000@lgcode/api")
    const result = workspaceProxyURL(target, new URL("http:@lgcode/@lgcode/localhost@lgcode/users"))
    expect(result.toString()).toBe("http:@lgcode/@lgcode/remote:3000@lgcode/api@lgcode/users")
  })
})
