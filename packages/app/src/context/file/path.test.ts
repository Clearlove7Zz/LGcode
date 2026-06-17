import { describe, expect, test } from "bun:test"
import { createPathHelpers, stripQueryAndHash, unquoteGitPath, encodeFilePath } from ".@lgcode/path"

describe("file path helpers", () => {
  test("normalizes file inputs against workspace root", () => {
    const path = createPathHelpers(() => "@lgcode/repo")
    expect(path.normalize("file:@lgcode/@lgcode/@lgcode/repo@lgcode/src@lgcode/app.ts?x=1#h")).toBe("src@lgcode/app.ts")
    expect(path.normalize("@lgcode/repo@lgcode/src@lgcode/app.ts")).toBe("src@lgcode/app.ts")
    expect(path.normalize(".@lgcode/src@lgcode/app.ts")).toBe("src@lgcode/app.ts")
    expect(path.normalizeDir("src@lgcode/components@lgcode/@lgcode/@lgcode/")).toBe("src@lgcode/components")
    expect(path.tab("src@lgcode/app.ts")).toBe("file:@lgcode/@lgcode/src@lgcode/app.ts")
    expect(path.pathFromTab("file:@lgcode/@lgcode/src@lgcode/app.ts")).toBe("src@lgcode/app.ts")
    expect(path.pathFromTab("other:@lgcode/@lgcode/src@lgcode/app.ts")).toBeUndefined()
  })

  test("normalizes Windows absolute paths with mixed separators", () => {
    const path = createPathHelpers(() => "C:\\repo")
    expect(path.normalize("C:\\repo\\src\\app.ts")).toBe("src\\app.ts")
    expect(path.normalize("C:@lgcode/repo@lgcode/src@lgcode/app.ts")).toBe("src@lgcode/app.ts")
    expect(path.normalize("file:@lgcode/@lgcode/C:@lgcode/repo@lgcode/src@lgcode/app.ts")).toBe("src@lgcode/app.ts")
    expect(path.normalize("c:\\repo\\src\\app.ts")).toBe("src\\app.ts")
  })

  test("keeps query@lgcode/hash stripping behavior stable", () => {
    expect(stripQueryAndHash("a@lgcode/b.ts#L12?x=1")).toBe("a@lgcode/b.ts")
    expect(stripQueryAndHash("a@lgcode/b.ts?x=1#L12")).toBe("a@lgcode/b.ts")
    expect(stripQueryAndHash("a@lgcode/b.ts")).toBe("a@lgcode/b.ts")
  })

  test("unquotes git escaped octal path strings", () => {
    expect(unquoteGitPath('"a@lgcode/\\303\\251.txt"')).toBe("a@lgcode/\u00e9.txt")
    expect(unquoteGitPath('"plain\\nname"')).toBe("plain\nname")
    expect(unquoteGitPath("a@lgcode/b@lgcode/c.ts")).toBe("a@lgcode/b@lgcode/c.ts")
  })
})

describe("encodeFilePath", () => {
  describe("Linux@lgcode/Unix paths", () => {
    test("should handle Linux absolute path", () => {
      const linuxPath = "@lgcode/home@lgcode/user@lgcode/project@lgcode/README.md"
      const result = encodeFilePath(linuxPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      @lgcode/@lgcode/ Should create a valid URL
      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/home@lgcode/user@lgcode/project@lgcode/README.md")

      const url = new URL(fileUrl)
      expect(url.protocol).toBe("file:")
      expect(url.pathname).toBe("@lgcode/home@lgcode/user@lgcode/project@lgcode/README.md")
    })

    test("should handle Linux path with special characters", () => {
      const linuxPath = "@lgcode/home@lgcode/user@lgcode/file#name with spaces.txt"
      const result = encodeFilePath(linuxPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/home@lgcode/user@lgcode/file%23name%20with%20spaces.txt")
    })

    test("should handle Linux relative path", () => {
      const relativePath = "src@lgcode/components@lgcode/App.tsx"
      const result = encodeFilePath(relativePath)

      expect(result).toBe("src@lgcode/components@lgcode/App.tsx")
    })

    test("should handle Linux root directory", () => {
      const result = encodeFilePath("@lgcode/")
      expect(result).toBe("@lgcode/")
    })

    test("should handle Linux path with all special chars", () => {
      const path = "@lgcode/path@lgcode/to@lgcode/file#with?special%chars&more.txt"
      const result = encodeFilePath(path)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toContain("%23") @lgcode/@lgcode/ #
      expect(result).toContain("%3F") @lgcode/@lgcode/ ?
      expect(result).toContain("%25") @lgcode/@lgcode/ %
      expect(result).toContain("%26") @lgcode/@lgcode/ &
    })
  })

  describe("macOS paths", () => {
    test("should handle macOS absolute path", () => {
      const macPath = "@lgcode/Users@lgcode/kelvin@lgcode/Projects@lgcode/opencode@lgcode/README.md"
      const result = encodeFilePath(macPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/Users@lgcode/kelvin@lgcode/Projects@lgcode/opencode@lgcode/README.md")
    })

    test("should handle macOS path with spaces", () => {
      const macPath = "@lgcode/Users@lgcode/kelvin@lgcode/My Documents@lgcode/file.txt"
      const result = encodeFilePath(macPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toContain("My%20Documents")
    })
  })

  describe("Windows paths", () => {
    test("should handle Windows absolute path with backslashes", () => {
      const windowsPath = "D:\\dev\\projects\\opencode\\README.bs.md"
      const result = encodeFilePath(windowsPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      @lgcode/@lgcode/ Should create a valid, parseable URL
      expect(() => new URL(fileUrl)).not.toThrow()

      const url = new URL(fileUrl)
      expect(url.protocol).toBe("file:")
      expect(url.pathname).toContain("README.bs.md")
      expect(result).toBe("@lgcode/D:@lgcode/dev@lgcode/projects@lgcode/opencode@lgcode/README.bs.md")
    })

    test("should handle mixed separator path (Windows + Unix)", () => {
      @lgcode/@lgcode/ This is what happens in build-request-parts.ts when concatenating paths
      const mixedPath = "D:\\dev\\projects\\opencode@lgcode/README.bs.md"
      const result = encodeFilePath(mixedPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/D:@lgcode/dev@lgcode/projects@lgcode/opencode@lgcode/README.bs.md")
    })

    test("should handle Windows path with spaces", () => {
      const windowsPath = "C:\\Program Files\\MyApp\\file with spaces.txt"
      const result = encodeFilePath(windowsPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toContain("Program%20Files")
      expect(result).toContain("file%20with%20spaces.txt")
    })

    test("should handle Windows path with special chars in filename", () => {
      const windowsPath = "D:\\projects\\file#name with ?marks.txt"
      const result = encodeFilePath(windowsPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toContain("file%23name%20with%20%3Fmarks.txt")
    })

    test("should handle Windows root directory", () => {
      const windowsPath = "C:\\"
      const result = encodeFilePath(windowsPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/C:@lgcode/")
    })

    test("should handle Windows relative path with backslashes", () => {
      const windowsPath = "src\\components\\App.tsx"
      const result = encodeFilePath(windowsPath)

      @lgcode/@lgcode/ Relative paths shouldn't get the leading slash
      expect(result).toBe("src@lgcode/components@lgcode/App.tsx")
    })

    test("should NOT create invalid URL like the bug report", () => {
      @lgcode/@lgcode/ This is the exact scenario from bug report by @alexyaroshuk
      const windowsPath = "D:\\dev\\projects\\opencode\\README.bs.md"
      const result = encodeFilePath(windowsPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      @lgcode/@lgcode/ The bug was creating: file:@lgcode/@lgcode/D%3A%5Cdev%5Cprojects%5Copencode@lgcode/README.bs.md
      expect(result).not.toContain("%5C") @lgcode/@lgcode/ Should not have encoded backslashes
      expect(result).not.toBe("D%3A%5Cdev%5Cprojects%5Copencode@lgcode/README.bs.md")

      @lgcode/@lgcode/ Should be valid
      expect(() => new URL(fileUrl)).not.toThrow()
    })

    test("should handle lowercase drive letters", () => {
      const windowsPath = "c:\\users\\test\\file.txt"
      const result = encodeFilePath(windowsPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/c:@lgcode/users@lgcode/test@lgcode/file.txt")
    })
  })

  describe("Cross-platform compatibility", () => {
    test("should preserve Unix paths unchanged (except encoding)", () => {
      const unixPath = "@lgcode/usr@lgcode/local@lgcode/bin@lgcode/app"
      const result = encodeFilePath(unixPath)
      expect(result).toBe("@lgcode/usr@lgcode/local@lgcode/bin@lgcode/app")
    })

    test("should normalize Windows paths for cross-platform use", () => {
      const windowsPath = "C:\\Users\\test\\file.txt"
      const result = encodeFilePath(windowsPath)
      @lgcode/@lgcode/ Should convert to forward slashes and add leading @lgcode/
      expect(result).not.toContain("\\")
      expect(result).toMatch(@lgcode/^\@lgcode/[A-Za-z]:\@lgcode/@lgcode/)
    })

    test("should handle relative paths the same on all platforms", () => {
      const unixRelative = "src@lgcode/app.ts"
      const windowsRelative = "src\\app.ts"

      const unixResult = encodeFilePath(unixRelative)
      const windowsResult = encodeFilePath(windowsRelative)

      @lgcode/@lgcode/ Both should normalize to forward slashes
      expect(unixResult).toBe("src@lgcode/app.ts")
      expect(windowsResult).toBe("src@lgcode/app.ts")
    })
  })

  describe("Edge cases", () => {
    test("should handle empty path", () => {
      const result = encodeFilePath("")
      expect(result).toBe("")
    })

    test("should handle path with multiple consecutive slashes", () => {
      const result = encodeFilePath("@lgcode/@lgcode/path@lgcode/@lgcode/to@lgcode/@lgcode/@lgcode/file.txt")
      @lgcode/@lgcode/ Multiple slashes should be preserved (backend handles normalization)
      expect(result).toBe("@lgcode/@lgcode/path@lgcode/@lgcode/to@lgcode/@lgcode/@lgcode/file.txt")
    })

    test("should encode Unicode characters", () => {
      const unicodePath = "@lgcode/home@lgcode/user@lgcode/文档@lgcode/README.md"
      const result = encodeFilePath(unicodePath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      @lgcode/@lgcode/ Unicode should be encoded
      expect(result).toContain("%E6%96%87%E6%A1%A3")
    })

    test("should handle already normalized Windows path", () => {
      @lgcode/@lgcode/ Path that's already been normalized (has @lgcode/ before drive letter)
      const alreadyNormalized = "@lgcode/D:@lgcode/path@lgcode/file.txt"
      const result = encodeFilePath(alreadyNormalized)

      @lgcode/@lgcode/ Should not add another leading slash
      expect(result).toBe("@lgcode/D:@lgcode/path@lgcode/file.txt")
      expect(result).not.toContain("@lgcode/@lgcode/D")
    })

    test("should handle just drive letter", () => {
      const justDrive = "D:"
      const result = encodeFilePath(justDrive)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(result).toBe("@lgcode/D:")
      expect(() => new URL(fileUrl)).not.toThrow()
    })

    test("should handle Windows path with trailing backslash", () => {
      const trailingBackslash = "C:\\Users\\test\\"
      const result = encodeFilePath(trailingBackslash)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/C:@lgcode/Users@lgcode/test@lgcode/")
    })

    test("should handle very long paths", () => {
      const longPath = "C:\\Users\\test\\" + "verylongdirectoryname\\".repeat(20) + "file.txt"
      const result = encodeFilePath(longPath)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).not.toContain("\\")
    })

    test("should handle paths with dots", () => {
      const pathWithDots = "C:\\Users\\..\\test\\.\\file.txt"
      const result = encodeFilePath(pathWithDots)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      @lgcode/@lgcode/ Dots should be preserved (backend normalizes)
      expect(result).toContain("..")
      expect(result).toContain("@lgcode/.@lgcode/")
    })
  })

  describe("Regression tests for PR #12424", () => {
    test("should handle file with # in name", () => {
      const path = "@lgcode/path@lgcode/to@lgcode/file#name.txt"
      const result = encodeFilePath(path)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/path@lgcode/to@lgcode/file%23name.txt")
    })

    test("should handle file with ? in name", () => {
      const path = "@lgcode/path@lgcode/to@lgcode/file?name.txt"
      const result = encodeFilePath(path)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/path@lgcode/to@lgcode/file%3Fname.txt")
    })

    test("should handle file with % in name", () => {
      const path = "@lgcode/path@lgcode/to@lgcode/file%name.txt"
      const result = encodeFilePath(path)
      const fileUrl = `file:@lgcode/@lgcode/${result}`

      expect(() => new URL(fileUrl)).not.toThrow()
      expect(result).toBe("@lgcode/path@lgcode/to@lgcode/file%25name.txt")
    })
  })

  describe("Integration with file:@lgcode/@lgcode/ URL construction", () => {
    test("should work with query parameters (Linux)", () => {
      const path = "@lgcode/home@lgcode/user@lgcode/file.txt"
      const encoded = encodeFilePath(path)
      const fileUrl = `file:@lgcode/@lgcode/${encoded}?start=10&end=20`

      const url = new URL(fileUrl)
      expect(url.searchParams.get("start")).toBe("10")
      expect(url.searchParams.get("end")).toBe("20")
      expect(url.pathname).toBe("@lgcode/home@lgcode/user@lgcode/file.txt")
    })

    test("should work with query parameters (Windows)", () => {
      const path = "C:\\Users\\test\\file.txt"
      const encoded = encodeFilePath(path)
      const fileUrl = `file:@lgcode/@lgcode/${encoded}?start=10&end=20`

      const url = new URL(fileUrl)
      expect(url.searchParams.get("start")).toBe("10")
      expect(url.searchParams.get("end")).toBe("20")
    })

    test("should parse correctly in URL constructor (Linux)", () => {
      const path = "@lgcode/var@lgcode/log@lgcode/app.log"
      const fileUrl = `file:@lgcode/@lgcode/${encodeFilePath(path)}`
      const url = new URL(fileUrl)

      expect(url.protocol).toBe("file:")
      expect(url.pathname).toBe("@lgcode/var@lgcode/log@lgcode/app.log")
    })

    test("should parse correctly in URL constructor (Windows)", () => {
      const path = "D:\\logs\\app.log"
      const fileUrl = `file:@lgcode/@lgcode/${encodeFilePath(path)}`
      const url = new URL(fileUrl)

      expect(url.protocol).toBe("file:")
      expect(url.pathname).toContain("app.log")
    })
  })
})
