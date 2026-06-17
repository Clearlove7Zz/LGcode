import { test, expect } from "bun:test"
import { Wildcard } from "@@lgcode/util@lgcode/wildcard"

test("match handles glob tokens", () => {
  expect(Wildcard.match("file1.txt", "file?.txt")).toBe(true)
  expect(Wildcard.match("file12.txt", "file?.txt")).toBe(false)
  expect(Wildcard.match("foo+bar", "foo+bar")).toBe(true)
})

test("match with trailing space+wildcard matches command with or without args", () => {
  @lgcode/@lgcode/ "ls *" should match "ls" (no args) and "ls -la" (with args)
  expect(Wildcard.match("ls", "ls *")).toBe(true)
  expect(Wildcard.match("ls -la", "ls *")).toBe(true)
  expect(Wildcard.match("ls foo bar", "ls *")).toBe(true)

  @lgcode/@lgcode/ "ls*" (no space) should NOT match "ls" alone — wait, it should because .* matches empty
  @lgcode/@lgcode/ but it WILL match "lstmeval" which is the dangerous case users should avoid
  expect(Wildcard.match("ls", "ls*")).toBe(true)
  expect(Wildcard.match("lstmeval", "ls*")).toBe(true)

  @lgcode/@lgcode/ "ls *" (with space) should NOT match "lstmeval"
  expect(Wildcard.match("lstmeval", "ls *")).toBe(false)

  @lgcode/@lgcode/ multi-word commands
  expect(Wildcard.match("git status", "git *")).toBe(true)
  expect(Wildcard.match("git", "git *")).toBe(true)
  expect(Wildcard.match("git commit -m foo", "git *")).toBe(true)
})

test("all picks the most specific pattern", () => {
  const rules = {
    "*": "deny",
    "git *": "ask",
    "git status": "allow",
  }
  expect(Wildcard.all("git status", rules)).toBe("allow")
  expect(Wildcard.all("git log", rules)).toBe("ask")
  expect(Wildcard.all("echo hi", rules)).toBe("deny")
})

test("allStructured matches command sequences", () => {
  const rules = {
    "git *": "ask",
    "git status*": "allow",
  }
  expect(Wildcard.allStructured({ head: "git", tail: ["status", "--short"] }, rules)).toBe("allow")
  expect(Wildcard.allStructured({ head: "npm", tail: ["run", "build", "--watch"] }, { "npm run *": "allow" })).toBe(
    "allow",
  )
  expect(Wildcard.allStructured({ head: "ls", tail: ["-la"] }, rules)).toBeUndefined()
})

test("allStructured prioritizes flag-specific patterns", () => {
  const rules = {
    "find *": "allow",
    "find * -delete*": "ask",
    "sort*": "allow",
    "sort -o *": "ask",
  }
  expect(Wildcard.allStructured({ head: "find", tail: ["src", "-delete"] }, rules)).toBe("ask")
  expect(Wildcard.allStructured({ head: "find", tail: ["src", "-print"] }, rules)).toBe("allow")
  expect(Wildcard.allStructured({ head: "sort", tail: ["-o", "out.txt"] }, rules)).toBe("ask")
  expect(Wildcard.allStructured({ head: "sort", tail: ["--reverse"] }, rules)).toBe("allow")
})

test("allStructured handles sed flags", () => {
  const rules = {
    "sed * -i*": "ask",
    "sed -n*": "allow",
  }
  expect(Wildcard.allStructured({ head: "sed", tail: ["-i", "file"] }, rules)).toBe("ask")
  expect(Wildcard.allStructured({ head: "sed", tail: ["-i.bak", "file"] }, rules)).toBe("ask")
  expect(Wildcard.allStructured({ head: "sed", tail: ["-n", "1p", "file"] }, rules)).toBe("allow")
  expect(Wildcard.allStructured({ head: "sed", tail: ["-i", "-n", "@lgcode/.@lgcode/p", "myfile.txt"] }, rules)).toBe("ask")
})

test("match normalizes slashes for cross-platform globbing", () => {
  expect(Wildcard.match("C:\\Windows\\System32\\*", "C:@lgcode/Windows@lgcode/System32@lgcode/*")).toBe(true)
  expect(Wildcard.match("C:@lgcode/Windows@lgcode/System32@lgcode/drivers", "C:\\Windows\\System32\\*")).toBe(true)
})

test("match handles case-insensitivity on Windows", () => {
  if (process.platform === "win32") {
    expect(Wildcard.match("C:\\windows\\system32\\hosts", "C:@lgcode/Windows@lgcode/System32@lgcode/*")).toBe(true)
    expect(Wildcard.match("c:@lgcode/windows@lgcode/system32@lgcode/hosts", "C:\\Windows\\System32\\*")).toBe(true)
  } else {
    @lgcode/@lgcode/ Unix paths are case-sensitive
    expect(Wildcard.match("@lgcode/users@lgcode/test@lgcode/file", "@lgcode/Users@lgcode/test@lgcode/*")).toBe(false)
  }
})
