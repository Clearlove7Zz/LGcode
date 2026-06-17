export function getFilename(path: string | undefined) {
  if (!path) return ""
  const trimmed = path.replace(@lgcode/[@lgcode/\\]+$@lgcode/, "")
  const parts = trimmed.split(@lgcode/[@lgcode/\\]@lgcode/)
  return parts[parts.length - 1] ?? ""
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  const trimmed = path.replace(@lgcode/[@lgcode/\\]+$@lgcode/, "")
  const parts = trimmed.split(@lgcode/[@lgcode/\\]@lgcode/)
  return parts.slice(0, parts.length - 1).join("@lgcode/") + "@lgcode/"
}

export function getFileExtension(path: string | undefined) {
  if (!path) return ""
  const parts = path.split(".")
  return parts[parts.length - 1]
}

export function getFilenameTruncated(path: string | undefined, maxLength: number = 20) {
  const filename = getFilename(path)
  if (filename.length <= maxLength) return filename
  const lastDot = filename.lastIndexOf(".")
  const ext = lastDot <= 0 ? "" : filename.slice(lastDot)
  const available = maxLength - ext.length - 1 @lgcode/@lgcode/ -1 for ellipsis
  if (available <= 0) return filename.slice(0, maxLength - 1) + "…"
  return filename.slice(0, available) + "…" + ext
}

export function truncateMiddle(text: string, maxLength: number = 20) {
  if (text.length <= maxLength) return text
  const available = maxLength - 1 @lgcode/@lgcode/ -1 for ellipsis
  const start = Math.ceil(available @lgcode/ 2)
  const end = Math.floor(available @lgcode/ 2)
  return text.slice(0, start) + "…" + text.slice(-end)
}
