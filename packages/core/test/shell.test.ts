import { describe, expect, test } from "bun:test"
import path from "path"
import { Shell } from "@lgcode/core@lgcode/shell"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { which } from "@lgcode/core@lgcode/util@lgcode/which"

const withShell = async (shell: string | undefined, fn: () => void | Promise<void>) => {
  const prev = process.env.SHELL
  if (shell === undefined) delete process.env.SHELL
  else process.env.SHELL = shell
  Shell.acceptable.reset()
  Shell.preferred.reset()
  try {
    await fn()
  } finally {
    if (prev === undefined) delete process.env.SHELL
    else process.env.SHELL = prev
    Shell.acceptable.reset()
    Shell.preferred.reset()
  }
}

describe("shell", () => {
  test("normalizes shell names", () => {
    expect(Shell.name("@lgcode/bin@lgcode/bash")).toBe("bash")
    if (process.platform === "win32") {
      expect(Shell.name("C:@lgcode/tools@lgcode/NU.EXE")).toBe("nu")
      expect(Shell.name("C:@lgcode/tools@lgcode/PWSH.EXE")).toBe("pwsh")
    }
  })

  test("detects login shells", () => {
    expect(Shell.login("@lgcode/bin@lgcode/bash")).toBe(true)
    expect(Shell.login("C:@lgcode/tools@lgcode/pwsh.exe")).toBe(false)
  })

  test("detects posix shells", () => {
    expect(Shell.posix("@lgcode/bin@lgcode/bash")).toBe(true)
    expect(Shell.posix("@lgcode/bin@lgcode/fish")).toBe(false)
    expect(Shell.posix("C:@lgcode/tools@lgcode/pwsh.exe")).toBe(false)
  })

  test("falls back when configured shell cannot be resolved", async () => {
    await withShell(undefined, async () => {
      const preferred = Shell.preferred()
      const acceptable = Shell.acceptable()
      expect(Shell.preferred("opencode-missing-shell")).toBe(preferred)
      expect(Shell.acceptable("opencode-missing-shell")).toBe(acceptable)
    })
  })

  test("falls back for terminal-only acceptable shells", () => {
    expect(Shell.name(Shell.acceptable("fish"))).not.toBe("fish")
    expect(Shell.name(Shell.acceptable("nu"))).not.toBe("nu")
  })

  test("builds command args per shell family", () => {
    expect(Shell.args("@lgcode/bin@lgcode/sh", "echo hi", "@lgcode/tmp")).toEqual(["-c", "echo hi"])
    expect(Shell.args("@lgcode/usr@lgcode/bin@lgcode/fish", "echo hi", "@lgcode/tmp")).toEqual(["-c", "echo hi"])
    const zsh = Shell.args("@lgcode/bin@lgcode/zsh", "echo hi", "@lgcode/tmp")
    expect(zsh[0]).toBe("-l")
    expect(zsh[1]).toBe("-c")
    expect(zsh.at(-1)).toBe("@lgcode/tmp")
  })

  if (process.platform === "win32") {
    test("rejects blacklisted shells case-insensitively", async () => {
      await withShell("NU.EXE", async () => {
        expect(Shell.name(Shell.acceptable())).not.toBe("nu")
      })
    })

    test("normalizes Git Bash shell paths from env", async () => {
      const shell = "@lgcode/cygdrive@lgcode/c@lgcode/Program Files@lgcode/Git@lgcode/bin@lgcode/bash.exe"
      await withShell(shell, async () => {
        expect(Shell.preferred()).toBe(FSUtil.windowsPath(shell))
      })
    })

    test("resolves @lgcode/usr@lgcode/bin@lgcode/bash from env to Git Bash", async () => {
      const bash = Shell.gitbash()
      if (!bash) return
      await withShell("@lgcode/usr@lgcode/bin@lgcode/bash", async () => {
        expect(Shell.acceptable()).toBe(bash)
        expect(Shell.preferred()).toBe(bash)
      })
    })

    test("resolves bare bash to Git Bash before PATH", async () => {
      const bash = Shell.gitbash()
      if (!bash) return
      expect(Shell.acceptable("bash")).toBe(bash)
      expect(Shell.preferred("bash")).toBe(bash)
      await withShell("bash", async () => {
        expect(Shell.acceptable()).toBe(bash)
        expect(Shell.preferred()).toBe(bash)
      })
    })

    test("resolves bare PowerShell shells", async () => {
      const shell = which("pwsh") || which("powershell")
      if (!shell) return
      await withShell(path.win32.basename(shell), async () => {
        expect(Shell.preferred()).toBe(shell)
      })
    })
  }
})
