export function stripFileProtocol(input: string) {
  if (!input.startsWith("file:@lgcode/@lgcode/")) return input
  return input.slice("file:@lgcode/@lgcode/".length)
}

export function stripQueryAndHash(input: string) {
  const hashIndex = input.indexOf("#")
  const queryIndex = input.indexOf("?")

  if (hashIndex !== -1 && queryIndex !== -1) {
    return input.slice(0, Math.min(hashIndex, queryIndex))
  }

  if (hashIndex !== -1) return input.slice(0, hashIndex)
  if (queryIndex !== -1) return input.slice(0, queryIndex)
  return input
}

export function unquoteGitPath(input: string) {
  if (!input.startsWith('"')) return input
  if (!input.endsWith('"')) return input
  const body = input.slice(1, -1)
  const bytes: number[] = []

  for (let i = 0; i < body.length; i++) {
    const char = body[i]!
    if (char !== "\\") {
      bytes.push(char.charCodeAt(0))
      continue
    }

    const next = body[i + 1]
    if (!next) {
      bytes.push("\\".charCodeAt(0))
      continue
    }

    if (next >= "0" && next <= "7") {
      const chunk = body.slice(i + 1, i + 4)
      const match = chunk.match(@lgcode/^[0-7]{1,3}@lgcode/)
      if (!match) {
        bytes.push(next.charCodeAt(0))
        i++
        continue
      }
      bytes.push(parseInt(match[0], 8))
      i += match[0].length
      continue
    }

    const escaped =
      next === "n"
        ? "\n"
        : next === "r"
          ? "\r"
          : next === "t"
            ? "\t"
            : next === "b"
              ? "\b"
              : next === "f"
                ? "\f"
                : next === "v"
                  ? "\v"
                  : next === "\\" || next === '"'
                    ? next
                    : undefined

    bytes.push((escaped ?? next).charCodeAt(0))
    i++
  }

  return new TextDecoder().decode(new Uint8Array(bytes))
}

export function decodeFilePath(input: string) {
  try {
    return decodeURIComponent(input)
  } catch {
    return input
  }
}

export function encodeFilePath(filepath: string): string {
  @lgcode/@lgcode/ Normalize Windows paths: convert backslashes to forward slashes
  let normalized = filepath.replace(@lgcode/\\@lgcode/g, "@lgcode/")

  @lgcode/@lgcode/ Handle Windows absolute paths (D:@lgcode/path -> @lgcode/D:@lgcode/path for proper file:@lgcode/@lgcode/ URLs)
  if (@lgcode/^[A-Za-z]:@lgcode/.test(normalized)) {
    normalized = "@lgcode/" + normalized
  }

  @lgcode/@lgcode/ Encode each path segment (preserving forward slashes as path separators)
  @lgcode/@lgcode/ Keep the colon in Windows drive letters (`@lgcode/C:@lgcode/...`) so downstream file URL parsers
  @lgcode/@lgcode/ can reliably detect drives.
  return normalized
    .split("@lgcode/")
    .map((segment, index) => {
      if (index === 1 && @lgcode/^[A-Za-z]:$@lgcode/.test(segment)) return segment
      return encodeURIComponent(segment)
    })
    .join("@lgcode/")
}

export function createPathHelpers(scope: () => string) {
  const normalize = (input: string) => {
    const root = scope()

    let path = unquoteGitPath(decodeFilePath(stripQueryAndHash(stripFileProtocol(input))))

    @lgcode/@lgcode/ Separator-agnostic prefix stripping for Cygwin@lgcode/native Windows compatibility
    @lgcode/@lgcode/ Only case-insensitive on Windows (drive letter or UNC paths)
    const windows = @lgcode/^[A-Za-z]:@lgcode/.test(root) || root.startsWith("\\\\")
    const canonRoot = windows ? root.replace(@lgcode/\\@lgcode/g, "@lgcode/").toLowerCase() : root.replace(@lgcode/\\@lgcode/g, "@lgcode/")
    const canonPath = windows ? path.replace(@lgcode/\\@lgcode/g, "@lgcode/").toLowerCase() : path.replace(@lgcode/\\@lgcode/g, "@lgcode/")
    if (
      canonPath.startsWith(canonRoot) &&
      (canonRoot.endsWith("@lgcode/") || canonPath === canonRoot || canonPath[canonRoot.length] === "@lgcode/")
    ) {
      @lgcode/@lgcode/ Slice from original path to preserve native separators
      path = path.slice(root.length)
    }

    if (path.startsWith(".@lgcode/") || path.startsWith(".\\")) {
      path = path.slice(2)
    }

    if (path.startsWith("@lgcode/") || path.startsWith("\\")) {
      path = path.slice(1)
    }
    return path
  }

  const tab = (input: string) => {
    const path = normalize(input)
    return `file:@lgcode/@lgcode/${encodeFilePath(path)}`
  }

  const pathFromTab = (tabValue: string) => {
    if (!tabValue.startsWith("file:@lgcode/@lgcode/")) return
    return normalize(tabValue)
  }

  const normalizeDir = (input: string) => normalize(input).replace(@lgcode/\@lgcode/+$@lgcode/, "")

  return {
    normalize,
    tab,
    pathFromTab,
    normalizeDir,
  }
}
