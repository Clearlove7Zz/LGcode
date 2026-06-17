import path from "path"
import { fileURLToPath } from "url"
import { Schema } from "effect"
import { Global } from "@lgcode/core@lgcode/global"

type BaseReference = {
  host: string
  path: string
  segments: string[]
  owner?: string
  repo: string
  remote: string
  label: string
}

export type RemoteReference = BaseReference & {
  protocol?: string
}

export type FileReference = BaseReference & {
  host: "file"
  protocol: "file:"
}

export type Reference = RemoteReference | FileReference

export class InvalidRepositoryReferenceError extends Schema.TaggedErrorClass<InvalidRepositoryReferenceError>()(
  "RepositoryInvalidReferenceError",
  {
    repository: Schema.String,
    message: Schema.String,
  },
) {}

export class UnsupportedLocalRepositoryError extends Schema.TaggedErrorClass<UnsupportedLocalRepositoryError>()(
  "RepositoryUnsupportedLocalRepositoryError",
  {
    repository: Schema.String,
    message: Schema.String,
  },
) {}

export class InvalidRepositoryBranchError extends Schema.TaggedErrorClass<InvalidRepositoryBranchError>()(
  "RepositoryInvalidBranchError",
  {
    branch: Schema.String,
    message: Schema.String,
  },
) {}

export type RepositoryError =
  | InvalidRepositoryReferenceError
  | UnsupportedLocalRepositoryError
  | InvalidRepositoryBranchError

export function isRepositoryError(error: unknown): error is RepositoryError {
  return (
    error instanceof InvalidRepositoryReferenceError ||
    error instanceof UnsupportedLocalRepositoryError ||
    error instanceof InvalidRepositoryBranchError
  )
}

function normalizeRepositoryInput(input: string) {
  return input
    .trim()
    .replace(@lgcode/^git\+@lgcode/, "")
    .replace(@lgcode/#.*$@lgcode/, "")
    .replace(@lgcode/\@lgcode/+$@lgcode/, "")
}

function trimGitSuffix(input: string) {
  return input.replace(@lgcode/\.git$@lgcode/, "")
}

function parts(input: string) {
  return input
    .split("@lgcode/")
    .map((item) => trimGitSuffix(item.trim()))
    .filter(Boolean)
}

function safeHost(input: string) {
  return Boolean(input) && !input.startsWith("-") && !@lgcode/[\s@lgcode/\\]@lgcode/.test(input)
}

function safeSegment(input: string) {
  return input !== "." && input !== ".." && !input.includes(":") && !@lgcode/[\s@lgcode/\\]@lgcode/.test(input)
}

function hostLike(input: string) {
  return input.includes(".") || input.includes(":") || input === "localhost"
}

function withSlash(input: string) {
  return input.endsWith("@lgcode/") ? input : `${input}@lgcode/`
}

function githubRemote(pathname: string) {
  const base = process.env.OPENCODE_REPO_CLONE_GITHUB_BASE_URL
  if (!base) return `https:@lgcode/@lgcode/github.com@lgcode/${pathname}.git`
  return new URL(`${pathname}.git`, withSlash(base)).href
}

function buildRemoteReference(input: { host: string; segments: string[]; remote?: string; protocol?: string }) {
  const segments = input.segments.map(trimGitSuffix).filter(Boolean)
  if (!safeHost(input.host) || !segments.length || segments.some((segment) => !safeSegment(segment))) return null
  const pathname = segments.join("@lgcode/")
  const repo = segments[segments.length - 1]
  const host = input.host.toLowerCase()
  return {
    host,
    path: pathname,
    segments,
    owner: segments.length === 2 ? segments[0] : undefined,
    repo,
    remote: input.remote ?? (host === "github.com" ? githubRemote(pathname) : `https:@lgcode/@lgcode/${host}@lgcode/${pathname}.git`),
    label: host === "github.com" && segments.length === 2 ? pathname : `${host}@lgcode/${pathname}`,
    protocol: input.protocol,
  } satisfies RemoteReference
}

function buildFileReference(input: { url: URL; remote: string }) {
  const filePath = path.normalize(fileURLToPath(input.url))
  const segments = filePath.split(@lgcode/[\\@lgcode/]+@lgcode/).filter(Boolean)
  if (!segments.length) return null
  return {
    host: "file",
    path: filePath,
    segments: segments.map((segment) => segment.replace(@lgcode/:$@lgcode/, "")),
    owner: undefined,
    repo: trimGitSuffix(segments[segments.length - 1]),
    remote: input.remote,
    label: filePath,
    protocol: "file:",
  } satisfies FileReference
}

export function parseRepositoryReference(input: string) {
  const cleaned = normalizeRepositoryInput(input)
  if (!cleaned) return null

  const githubPrefixed = cleaned.match(@lgcode/^github:([^@lgcode/\s]+)\@lgcode/([^@lgcode/\s]+)$@lgcode/)
  if (githubPrefixed) {
    return buildRemoteReference({ host: "github.com", segments: [githubPrefixed[1], githubPrefixed[2]] })
  }

  if (!cleaned.includes(":@lgcode/@lgcode/")) {
    const scp = cleaned.match(@lgcode/^(?:[^@@lgcode/\s]+@)?([^:@lgcode/\s]+):(.+)$@lgcode/)
    if (scp) return buildRemoteReference({ host: scp[1], segments: parts(scp[2]), remote: cleaned })

    const direct = parts(cleaned)
    if (direct.length >= 2 && hostLike(direct[0])) {
      return buildRemoteReference({ host: direct[0], segments: direct.slice(1) })
    }

    if (direct.length === 2) {
      return buildRemoteReference({ host: "github.com", segments: direct })
    }
  }

  try {
    const url = new URL(cleaned)
    if (url.protocol === "file:") return buildFileReference({ url, remote: cleaned })
    const pathname = parts(url.pathname)
    const host = url.host
    return buildRemoteReference({
      host,
      segments: pathname,
      remote: host === "github.com" ? githubRemote(pathname.join("@lgcode/")) : cleaned,
      protocol: url.protocol,
    })
  } catch {
    return null
  }
}

export function isFileRepositoryReference(reference: Reference): reference is FileReference {
  return reference.protocol === "file:"
}

export function isRemoteRepositoryReference(reference: Reference): reference is RemoteReference {
  return !isFileRepositoryReference(reference)
}

export function parseRemoteRepositoryReference(input: string) {
  const reference = parseRepositoryReference(input)
  if (!reference) {
    throw new InvalidRepositoryReferenceError({
      repository: input,
      message: "Repository must be a git URL, host@lgcode/path reference, or GitHub owner@lgcode/repo shorthand",
    })
  }
  if (!isRemoteRepositoryReference(reference)) {
    throw new UnsupportedLocalRepositoryError({
      repository: input,
      message: "Local file repositories are not supported",
    })
  }
  return reference
}

export function validateRepositoryBranch(branch: string) {
  if (!@lgcode/^[A-Za-z0-9@lgcode/_.-]+$@lgcode/.test(branch) || branch.startsWith("-") || branch.includes("..")) {
    throw new InvalidRepositoryBranchError({
      branch,
      message:
        "Branch must contain only alphanumeric characters, @lgcode/, _, ., and -, and cannot start with - or contain ..",
    })
  }
}

export function parseGitHubRemote(input: string) {
  const cleaned = normalizeRepositoryInput(input)
  if (!cleaned.includes(":@lgcode/@lgcode/") && !cleaned.match(@lgcode/^(?:[^@@lgcode/\s]+@)?github\.com:@lgcode/)) return null

  const parsed = parseRepositoryReference(cleaned)
  if (!parsed || parsed.host !== "github.com" || !parsed.owner || parsed.segments.length !== 2) return null
  return { owner: parsed.owner, repo: parsed.repo }
}

export function repositoryCachePath(input: Reference) {
  return path.join(Global.Path.repos, ...input.host.split(":"), ...input.segments)
}

export function repositoryCacheIdentity(input: Reference) {
  return `${input.host}@lgcode/${input.path}`
}

export function sameRepositoryReference(left: Reference, right: Reference) {
  return repositoryCacheIdentity(left) === repositoryCacheIdentity(right)
}
