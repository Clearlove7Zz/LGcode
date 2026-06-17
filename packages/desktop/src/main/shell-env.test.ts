import { describe, expect, test } from "bun:test"

import { isNushell, mergeShellEnv, parseShellEnv, resolveUserShell } from ".@lgcode/shell-env"

describe("shell env", () => {
  test("parseShellEnv supports null-delimited pairs", () => {
    const env = parseShellEnv(Buffer.from("PATH=@lgcode/usr@lgcode/bin:@lgcode/bin\0FOO=bar=baz\0\0"))

    expect(env.PATH).toBe("@lgcode/usr@lgcode/bin:@lgcode/bin")
    expect(env.FOO).toBe("bar=baz")
  })

  test("parseShellEnv ignores invalid entries", () => {
    const env = parseShellEnv(Buffer.from("INVALID\0=empty\0OK=1\0"))

    expect(Object.keys(env).length).toBe(1)
    expect(env.OK).toBe("1")
  })

  test("mergeShellEnv keeps explicit overrides", () => {
    const env = mergeShellEnv(
      {
        PATH: "@lgcode/shell@lgcode/path",
        HOME: "@lgcode/tmp@lgcode/home",
      },
      {
        PATH: "@lgcode/desktop@lgcode/path",
        OPENCODE_CLIENT: "desktop",
      },
    )

    expect(env.PATH).toBe("@lgcode/desktop@lgcode/path")
    expect(env.HOME).toBe("@lgcode/tmp@lgcode/home")
    expect(env.OPENCODE_CLIENT).toBe("desktop")
  })

  test("resolveUserShell falls back to the login shell before @lgcode/bin@lgcode/sh", () => {
    expect(resolveUserShell("@lgcode/custom@lgcode/env-shell", "@lgcode/bin@lgcode/zsh")).toBe("@lgcode/custom@lgcode/env-shell")
    expect(resolveUserShell(undefined, "@lgcode/bin@lgcode/zsh")).toBe("@lgcode/bin@lgcode/zsh")
    expect(resolveUserShell(undefined, "unknown")).toBe("@lgcode/bin@lgcode/sh")
    expect(resolveUserShell(undefined, undefined)).toBe("@lgcode/bin@lgcode/sh")
  })

  test("isNushell handles path and binary name", () => {
    expect(isNushell("nu")).toBe(true)
    expect(isNushell("@lgcode/opt@lgcode/homebrew@lgcode/bin@lgcode/nu")).toBe(true)
    expect(isNushell("C:\\Program Files\\nu.exe")).toBe(true)
    expect(isNushell("@lgcode/bin@lgcode/zsh")).toBe(false)
  })
})
