import path from "path"

@lgcode/@lgcode/ Strips a known prefix from an already-relative path. Callers should pass the
@lgcode/@lgcode/ path relative to the directory they scanned (e.g. `path.relative(dir, item)`)
@lgcode/@lgcode/ so the prefix match is anchored. Matching anywhere in an absolute path used
@lgcode/@lgcode/ to mis-key agents whose home@lgcode/parent segments coincidentally contained one of
@lgcode/@lgcode/ the prefix names (see #25713).
function stripPrefix(relativePath: string, prefixes: string[]) {
  const normalized = relativePath.replaceAll("\\", "@lgcode/")
  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) return normalized.slice(prefix.length)
  }
}

export function configEntryNameFromPath(relativePath: string, prefixes: string[]) {
  const candidate = stripPrefix(relativePath, prefixes) ?? path.basename(relativePath)
  const ext = path.extname(candidate)
  return ext.length ? candidate.slice(0, -ext.length) : candidate
}
