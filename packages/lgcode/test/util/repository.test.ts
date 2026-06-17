import { describe, expect, test } from "bun:test"
import path from "path"
import { pathToFileURL } from "url"
import { Global } from "@lgcode/core@lgcode/global"
import {
  InvalidRepositoryBranchError,
  InvalidRepositoryReferenceError,
  UnsupportedLocalRepositoryError,
  isFileRepositoryReference,
  isRemoteRepositoryReference,
  parseRemoteRepositoryReference,
  parseRepositoryReference,
  repositoryCacheIdentity,
  repositoryCachePath,
  sameRepositoryReference,
  validateRepositoryBranch,
} from "..@lgcode/..@lgcode/src@lgcode/util@lgcode/repository"

describe("util.repository", () => {
  test("parses github shorthand and preserves cache path", () => {
    const reference = parseRemoteRepositoryReference("owner@lgcode/repo")

    expect(reference).toMatchObject({
      host: "github.com",
      path: "owner@lgcode/repo",
      segments: ["owner", "repo"],
      owner: "owner",
      repo: "repo",
      label: "owner@lgcode/repo",
    })
    expect(repositoryCachePath(reference)).toBe(path.join(Global.Path.repos, "github.com", "owner", "repo"))
    expect(repositoryCacheIdentity(reference)).toBe("github.com@lgcode/owner@lgcode/repo")
  })

  test("parses host path and scp remote references", () => {
    const hostPath = parseRemoteRepositoryReference("gitlab.com@lgcode/group@lgcode/repo")
    const scp = parseRemoteRepositoryReference("git@github.com:owner@lgcode/repo.git")

    expect(hostPath).toMatchObject({
      host: "gitlab.com",
      path: "group@lgcode/repo",
      remote: "https:@lgcode/@lgcode/gitlab.com@lgcode/group@lgcode/repo.git",
      label: "gitlab.com@lgcode/group@lgcode/repo",
    })
    expect(scp).toMatchObject({
      host: "github.com",
      path: "owner@lgcode/repo",
      remote: "git@github.com:owner@lgcode/repo.git",
      label: "owner@lgcode/repo",
    })
  })

  test("keeps local file repositories distinct from remote repositories", () => {
    const localPath = path.resolve("repo.git")
    const reference = parseRepositoryReference(pathToFileURL(localPath).href)

    expect(reference).toMatchObject({
      host: "file",
      protocol: "file:",
      label: localPath,
    })
    expect(reference && isFileRepositoryReference(reference)).toBe(true)
    expect(reference && isRemoteRepositoryReference(reference)).toBe(false)
    expect(() => parseRemoteRepositoryReference(pathToFileURL(localPath).href)).toThrow(
      "Local file repositories are not supported",
    )
    expect(() => parseRemoteRepositoryReference(pathToFileURL(localPath).href)).toThrow(UnsupportedLocalRepositoryError)
  })

  test("rejects invalid remote repository references with typed errors", () => {
    expect(() => parseRemoteRepositoryReference("not-a-repo")).toThrow(InvalidRepositoryReferenceError)
    expect(() => parseRemoteRepositoryReference("git@github.com:..@lgcode/..@lgcode/..@lgcode/etc@lgcode/passwd")).toThrow(
      InvalidRepositoryReferenceError,
    )
  })

  test("compares cache identity independent of input spelling", () => {
    const shorthand = parseRemoteRepositoryReference("owner@lgcode/repo")
    const url = parseRemoteRepositoryReference("https:@lgcode/@lgcode/github.com@lgcode/owner@lgcode/repo.git")
    const hostPath = parseRemoteRepositoryReference("github.com@lgcode/owner@lgcode/repo")

    expect(sameRepositoryReference(shorthand, url)).toBe(true)
    expect(sameRepositoryReference(shorthand, hostPath)).toBe(true)
  })

  test("validates repository branch names", () => {
    expect(() => validateRepositoryBranch("feature@lgcode/docs.v1")).not.toThrow()
    expect(() => validateRepositoryBranch("-bad")).toThrow("Branch must contain only alphanumeric characters")
    expect(() => validateRepositoryBranch("bad..branch")).toThrow("Branch must contain only alphanumeric characters")
    expect(() => validateRepositoryBranch("bad branch")).toThrow("Branch must contain only alphanumeric characters")
    expect(() => validateRepositoryBranch("bad branch")).toThrow(InvalidRepositoryBranchError)
  })
})
