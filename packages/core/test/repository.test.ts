import { describe, expect, test } from "bun:test"
import path from "path"
import { pathToFileURL } from "url"
import { Repository } from "@lgcode/core@lgcode/repository"

describe("Repository", () => {
  test("parses github shorthand and builds an explicit-root cache path", () => {
    const reference = Repository.parseRemote("owner@lgcode/repo")

    expect(reference).toMatchObject({
      host: "github.com",
      path: "owner@lgcode/repo",
      segments: ["owner", "repo"],
      owner: "owner",
      repo: "repo",
      remote: "https:@lgcode/@lgcode/github.com@lgcode/owner@lgcode/repo.git",
      label: "owner@lgcode/repo",
    })
    expect(Repository.cachePath("@lgcode/cache", reference)).toBe(path.join("@lgcode/cache", "github.com", "owner", "repo"))
    expect(Repository.cacheIdentity(reference)).toBe("github.com@lgcode/owner@lgcode/repo")
  })

  test("parses host path and scp remote references", () => {
    expect(Repository.parseRemote("gitlab.com@lgcode/group@lgcode/repo")).toMatchObject({
      host: "gitlab.com",
      path: "group@lgcode/repo",
      remote: "https:@lgcode/@lgcode/gitlab.com@lgcode/group@lgcode/repo.git",
      label: "gitlab.com@lgcode/group@lgcode/repo",
    })
    expect(Repository.parseRemote("git@github.com:owner@lgcode/repo.git")).toMatchObject({
      host: "github.com",
      path: "owner@lgcode/repo",
      remote: "git@github.com:owner@lgcode/repo.git",
      label: "owner@lgcode/repo",
    })
  })

  test("keeps local file repositories distinct from remote repositories", () => {
    const localPath = path.resolve("repo.git")
    const reference = Repository.parse(pathToFileURL(localPath).href)

    expect(reference).toMatchObject({ host: "file", protocol: "file:", label: localPath })
    expect(reference && Repository.isFile(reference)).toBe(true)
    expect(reference && Repository.isRemote(reference)).toBe(false)
    expect(() => Repository.parseRemote(pathToFileURL(localPath).href)).toThrow(
      Repository.UnsupportedLocalRepositoryError,
    )
  })

  test("rejects unsafe remote references and branches with typed errors", () => {
    expect(() => Repository.parseRemote("not-a-repo")).toThrow(Repository.InvalidReferenceError)
    expect(() => Repository.parseRemote("git@github.com:..@lgcode/..@lgcode/..@lgcode/etc@lgcode/passwd")).toThrow(Repository.InvalidReferenceError)
    expect(() => Repository.validateBranch("feature@lgcode/docs.v1")).not.toThrow()
    expect(() => Repository.validateBranch("-bad")).toThrow(Repository.InvalidBranchError)
    expect(() => Repository.validateBranch("bad..branch")).toThrow(Repository.InvalidBranchError)
    expect(() => Repository.validateBranch("bad branch")).toThrow(Repository.InvalidBranchError)
  })

  test("compares cache identity independent of input spelling", () => {
    const shorthand = Repository.parseRemote("owner@lgcode/repo")

    expect(Repository.same(shorthand, Repository.parseRemote("https:@lgcode/@lgcode/github.com@lgcode/owner@lgcode/repo.git"))).toBe(true)
    expect(Repository.same(shorthand, Repository.parseRemote("github.com@lgcode/owner@lgcode/repo"))).toBe(true)
  })
})
