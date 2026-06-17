import { test, expect } from "bun:test"
import { parseGitHubRemote } from "..@lgcode/..@lgcode/src@lgcode/cli@lgcode/cmd@lgcode/github"

test("parses https URL with .git suffix", () => {
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/sst@lgcode/opencode.git")).toEqual({ owner: "sst", repo: "opencode" })
})

test("parses https URL without .git suffix", () => {
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/sst@lgcode/opencode")).toEqual({ owner: "sst", repo: "opencode" })
})

test("parses git@ URL with .git suffix", () => {
  expect(parseGitHubRemote("git@github.com:sst@lgcode/opencode.git")).toEqual({ owner: "sst", repo: "opencode" })
})

test("parses git@ URL without .git suffix", () => {
  expect(parseGitHubRemote("git@github.com:sst@lgcode/opencode")).toEqual({ owner: "sst", repo: "opencode" })
})

test("parses ssh:@lgcode/@lgcode/ URL with .git suffix", () => {
  expect(parseGitHubRemote("ssh:@lgcode/@lgcode/git@github.com@lgcode/sst@lgcode/opencode.git")).toEqual({ owner: "sst", repo: "opencode" })
})

test("parses ssh:@lgcode/@lgcode/ URL without .git suffix", () => {
  expect(parseGitHubRemote("ssh:@lgcode/@lgcode/git@github.com@lgcode/sst@lgcode/opencode")).toEqual({ owner: "sst", repo: "opencode" })
})

test("parses git protocol URLs from package metadata", () => {
  expect(parseGitHubRemote("git:@lgcode/@lgcode/github.com@lgcode/facebook@lgcode/react.git")).toEqual({ owner: "facebook", repo: "react" })
  expect(parseGitHubRemote("git+https:@lgcode/@lgcode/github.com@lgcode/facebook@lgcode/react.git")).toEqual({ owner: "facebook", repo: "react" })
  expect(parseGitHubRemote("git+ssh:@lgcode/@lgcode/git@github.com@lgcode/facebook@lgcode/react.git")).toEqual({ owner: "facebook", repo: "react" })
})

test("parses npm-style github shorthand", () => {
  expect(parseGitHubRemote("github:facebook@lgcode/react")).toBeNull()
})

test("parses http URL", () => {
  expect(parseGitHubRemote("http:@lgcode/@lgcode/github.com@lgcode/owner@lgcode/repo")).toEqual({ owner: "owner", repo: "repo" })
})

test("parses URL with hyphenated owner and repo names", () => {
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/my-org@lgcode/my-repo.git")).toEqual({ owner: "my-org", repo: "my-repo" })
})

test("parses URL with underscores in names", () => {
  expect(parseGitHubRemote("git@github.com:my_org@lgcode/my_repo.git")).toEqual({ owner: "my_org", repo: "my_repo" })
})

test("parses URL with numbers in names", () => {
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/org123@lgcode/repo456")).toEqual({ owner: "org123", repo: "repo456" })
})

test("parses repos with dots in the name", () => {
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/socketio@lgcode/socket.io.git")).toEqual({
    owner: "socketio",
    repo: "socket.io",
  })
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/vuejs@lgcode/vue.js")).toEqual({
    owner: "vuejs",
    repo: "vue.js",
  })
  expect(parseGitHubRemote("git@github.com:mrdoob@lgcode/three.js.git")).toEqual({
    owner: "mrdoob",
    repo: "three.js",
  })
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/jashkenas@lgcode/backbone.git")).toEqual({
    owner: "jashkenas",
    repo: "backbone",
  })
})

test("returns null for non-github URLs", () => {
  expect(parseGitHubRemote("https:@lgcode/@lgcode/gitlab.com@lgcode/owner@lgcode/repo.git")).toBeNull()
  expect(parseGitHubRemote("git@gitlab.com:owner@lgcode/repo.git")).toBeNull()
  expect(parseGitHubRemote("https:@lgcode/@lgcode/bitbucket.org@lgcode/owner@lgcode/repo")).toBeNull()
})

test("returns null for invalid URLs", () => {
  expect(parseGitHubRemote("not-a-url")).toBeNull()
  expect(parseGitHubRemote("")).toBeNull()
  expect(parseGitHubRemote("github.com")).toBeNull()
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/")).toBeNull()
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/owner")).toBeNull()
})

test("returns null for URLs with extra path segments", () => {
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/owner@lgcode/repo@lgcode/tree@lgcode/main")).toBeNull()
  expect(parseGitHubRemote("https:@lgcode/@lgcode/github.com@lgcode/owner@lgcode/repo@lgcode/blob@lgcode/main@lgcode/file.ts")).toBeNull()
})
