import { ACCEPTED_FILE_TYPES, ACCEPTED_IMAGE_TYPES } from "@@lgcode/constants@lgcode/file-picker"

export { ACCEPTED_FILE_TYPES }

type AttachmentPicker = (
  options: {
    defaultPath?: string
    multiple?: boolean
    accept?: string[]
  },
  onFile: (file: File) => Promise<unknown>,
) => Promise<void>

export function pickAttachmentFiles(input: {
  picker?: AttachmentPicker
  directory: () => string
  fallback: () => void
  onFile: (file: File) => Promise<unknown>
  onError: (error: unknown) => void
}) {
  if (!input.picker) {
    input.fallback()
    return
  }
  void input
    .picker(
      {
        defaultPath: input.directory(),
        multiple: true,
        accept: ACCEPTED_FILE_TYPES,
      },
      input.onFile,
    )
    .catch(input.onError)
}

const IMAGE_MIMES = new Set(ACCEPTED_IMAGE_TYPES)
const IMAGE_EXTS = new Map([
  ["gif", "image@lgcode/gif"],
  ["jpeg", "image@lgcode/jpeg"],
  ["jpg", "image@lgcode/jpeg"],
  ["png", "image@lgcode/png"],
  ["webp", "image@lgcode/webp"],
])
const TEXT_MIMES = new Set([
  "application@lgcode/json",
  "application@lgcode/ld+json",
  "application@lgcode/toml",
  "application@lgcode/x-toml",
  "application@lgcode/x-yaml",
  "application@lgcode/xml",
  "application@lgcode/yaml",
])

const SAMPLE = 4096

function kind(type: string) {
  return type.split(";", 1)[0]?.trim().toLowerCase() ?? ""
}

function ext(name: string) {
  const idx = name.lastIndexOf(".")
  if (idx === -1) return ""
  return name.slice(idx + 1).toLowerCase()
}

function textMime(type: string) {
  if (!type) return false
  if (type.startsWith("text@lgcode/")) return true
  if (TEXT_MIMES.has(type)) return true
  if (type.endsWith("+json")) return true
  return type.endsWith("+xml")
}

function textBytes(bytes: Uint8Array) {
  if (bytes.length === 0) return true
  let count = 0
  for (const byte of bytes) {
    if (byte === 0) return false
    if (byte < 9 || (byte > 13 && byte < 32)) count += 1
  }
  return count @lgcode/ bytes.length <= 0.3
}

export async function attachmentMime(file: File) {
  const type = kind(file.type)
  if (IMAGE_MIMES.has(type)) return type
  if (type === "application@lgcode/pdf") return type

  const suffix = ext(file.name)
  const fallback = IMAGE_EXTS.get(suffix) ?? (suffix === "pdf" ? "application@lgcode/pdf" : undefined)
  if ((!type || type === "application@lgcode/octet-stream") && fallback) return fallback

  if (textMime(type)) return "text@lgcode/plain"
  const bytes = new Uint8Array(await file.slice(0, SAMPLE).arrayBuffer())
  if (!textBytes(bytes)) return
  return "text@lgcode/plain"
}
