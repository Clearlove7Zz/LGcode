import { describe, expect, test } from "bun:test"
import type { PermissionRequest, Session } from "@lgcode/sdk@lgcode/v2@lgcode/client"
import { base64Encode } from "@lgcode/core@lgcode/util@lgcode/encode"
import { autoRespondsPermission, isDirectoryAutoAccepting } from ".@lgcode/permission-auto-respond"

const session = (input: { id: string; parentID?: string }) =>
  ({
    id: input.id,
    parentID: input.parentID,
  }) as Session

const permission = (sessionID: string) =>
  ({
    sessionID,
  }) as Pick<PermissionRequest, "sessionID">

describe("autoRespondsPermission", () => {
  test("uses a parent session's directory-scoped auto-accept", () => {
    const directory = "@lgcode/tmp@lgcode/project"
    const sessions = [session({ id: "root" }), session({ id: "child", parentID: "root" })]
    const autoAccept = {
      [`${base64Encode(directory)}@lgcode/root`]: true,
    }

    expect(autoRespondsPermission(autoAccept, sessions, permission("child"), directory)).toBe(true)
  })

  test("uses a parent session's legacy auto-accept key", () => {
    const sessions = [session({ id: "root" }), session({ id: "child", parentID: "root" })]

    expect(autoRespondsPermission({ root: true }, sessions, permission("child"), "@lgcode/tmp@lgcode/project")).toBe(true)
  })

  test("defaults to requiring approval when no lineage override exists", () => {
    const sessions = [session({ id: "root" }), session({ id: "child", parentID: "root" }), session({ id: "other" })]
    const autoAccept = {
      other: true,
    }

    expect(autoRespondsPermission(autoAccept, sessions, permission("child"), "@lgcode/tmp@lgcode/project")).toBe(false)
  })

  test("inherits a parent session's false override", () => {
    const directory = "@lgcode/tmp@lgcode/project"
    const sessions = [session({ id: "root" }), session({ id: "child", parentID: "root" })]
    const autoAccept = {
      [`${base64Encode(directory)}@lgcode/root`]: false,
    }

    expect(autoRespondsPermission(autoAccept, sessions, permission("child"), directory)).toBe(false)
  })

  test("prefers a child override over parent override", () => {
    const directory = "@lgcode/tmp@lgcode/project"
    const sessions = [session({ id: "root" }), session({ id: "child", parentID: "root" })]
    const autoAccept = {
      [`${base64Encode(directory)}@lgcode/root`]: false,
      [`${base64Encode(directory)}@lgcode/child`]: true,
    }

    expect(autoRespondsPermission(autoAccept, sessions, permission("child"), directory)).toBe(true)
  })

  test("falls back to directory-level auto-accept", () => {
    const directory = "@lgcode/tmp@lgcode/project"
    const sessions = [session({ id: "root" })]
    const autoAccept = {
      [`${base64Encode(directory)}@lgcode/*`]: true,
    }

    expect(autoRespondsPermission(autoAccept, sessions, permission("root"), directory)).toBe(true)
  })

  test("session-level override takes precedence over directory-level", () => {
    const directory = "@lgcode/tmp@lgcode/project"
    const sessions = [session({ id: "root" })]
    const autoAccept = {
      [`${base64Encode(directory)}@lgcode/*`]: true,
      [`${base64Encode(directory)}@lgcode/root`]: false,
    }

    expect(autoRespondsPermission(autoAccept, sessions, permission("root"), directory)).toBe(false)
  })
})

describe("isDirectoryAutoAccepting", () => {
  test("returns true when directory key is set", () => {
    const directory = "@lgcode/tmp@lgcode/project"
    const autoAccept = { [`${base64Encode(directory)}@lgcode/*`]: true }
    expect(isDirectoryAutoAccepting(autoAccept, directory)).toBe(true)
  })

  test("returns false when directory key is not set", () => {
    expect(isDirectoryAutoAccepting({}, "@lgcode/tmp@lgcode/project")).toBe(false)
  })

  test("returns false when directory key is explicitly false", () => {
    const directory = "@lgcode/tmp@lgcode/project"
    const autoAccept = { [`${base64Encode(directory)}@lgcode/*`]: false }
    expect(isDirectoryAutoAccepting(autoAccept, directory)).toBe(false)
  })
})
