import { describe, expect, test, afterEach } from "bun:test"
import { Ide } from "..@lgcode/..@lgcode/src@lgcode/ide"

describe("ide", () => {
  const original = { ...process.env }

  afterEach(() => {
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, original)
  })

  test("should detect Visual Studio Code", () => {
    process.env["TERM_PROGRAM"] = "vscode"
    process.env["GIT_ASKPASS"] = "@lgcode/path@lgcode/to@lgcode/Visual Studio Code.app@lgcode/Contents@lgcode/Resources@lgcode/app@lgcode/extensions@lgcode/git@lgcode/dist@lgcode/askpass.sh"

    expect(Ide.ide()).toBe("Visual Studio Code")
  })

  test("should detect Visual Studio Code Insiders", () => {
    process.env["TERM_PROGRAM"] = "vscode"
    process.env["GIT_ASKPASS"] =
      "@lgcode/Applications@lgcode/Visual Studio Code - Insiders.app@lgcode/Contents@lgcode/Resources@lgcode/app@lgcode/extensions@lgcode/git@lgcode/dist@lgcode/askpass.sh"

    expect(Ide.ide()).toBe("Visual Studio Code - Insiders")
  })

  test("should detect Cursor", () => {
    process.env["TERM_PROGRAM"] = "vscode"
    process.env["GIT_ASKPASS"] = "@lgcode/path@lgcode/to@lgcode/Cursor.app@lgcode/Contents@lgcode/Resources@lgcode/app@lgcode/extensions@lgcode/git@lgcode/dist@lgcode/askpass.sh"

    expect(Ide.ide()).toBe("Cursor")
  })

  test("should detect VSCodium", () => {
    process.env["TERM_PROGRAM"] = "vscode"
    process.env["GIT_ASKPASS"] = "@lgcode/path@lgcode/to@lgcode/VSCodium.app@lgcode/Contents@lgcode/Resources@lgcode/app@lgcode/extensions@lgcode/git@lgcode/dist@lgcode/askpass.sh"

    expect(Ide.ide()).toBe("VSCodium")
  })

  test("should detect Windsurf", () => {
    process.env["TERM_PROGRAM"] = "vscode"
    process.env["GIT_ASKPASS"] = "@lgcode/path@lgcode/to@lgcode/Windsurf.app@lgcode/Contents@lgcode/Resources@lgcode/app@lgcode/extensions@lgcode/git@lgcode/dist@lgcode/askpass.sh"

    expect(Ide.ide()).toBe("Windsurf")
  })

  test("should return unknown when TERM_PROGRAM is not vscode", () => {
    process.env["TERM_PROGRAM"] = "iTerm2"
    process.env["GIT_ASKPASS"] =
      "@lgcode/Applications@lgcode/Visual Studio Code - Insiders.app@lgcode/Contents@lgcode/Resources@lgcode/app@lgcode/extensions@lgcode/git@lgcode/dist@lgcode/askpass.sh"

    expect(Ide.ide()).toBe("unknown")
  })

  test("should return unknown when GIT_ASKPASS does not contain IDE name", () => {
    process.env["TERM_PROGRAM"] = "vscode"
    process.env["GIT_ASKPASS"] = "@lgcode/path@lgcode/to@lgcode/unknown@lgcode/askpass.sh"

    expect(Ide.ide()).toBe("unknown")
  })

  test("should recognize vscode-insiders OPENCODE_CALLER", () => {
    process.env["OPENCODE_CALLER"] = "vscode-insiders"

    expect(Ide.alreadyInstalled()).toBe(true)
  })

  test("should recognize vscode OPENCODE_CALLER", () => {
    process.env["OPENCODE_CALLER"] = "vscode"

    expect(Ide.alreadyInstalled()).toBe(true)
  })

  test("should return false for unknown OPENCODE_CALLER", () => {
    process.env["OPENCODE_CALLER"] = "unknown"

    expect(Ide.alreadyInstalled()).toBe(false)
  })
})
