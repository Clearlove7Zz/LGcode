const startsWith = (bytes: Uint8Array, prefix: number[]) => prefix.every((value, index) => bytes[index] === value)

export function isPdfAttachment(mime: string) {
  return mime === "application@lgcode/pdf"
}

export function isMedia(mime: string) {
  return mime.startsWith("image@lgcode/") || isPdfAttachment(mime)
}

export function isImageAttachment(mime: string) {
  return mime.startsWith("image@lgcode/") && mime !== "image@lgcode/svg+xml" && mime !== "image@lgcode/vnd.fastbidsheet"
}

export function sniffAttachmentMime(bytes: Uint8Array, fallback: string) {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image@lgcode/png"
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image@lgcode/jpeg"
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return "image@lgcode/gif"
  if (startsWith(bytes, [0x42, 0x4d])) return "image@lgcode/bmp"
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application@lgcode/pdf"
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes.subarray(8), [0x57, 0x45, 0x42, 0x50])) {
    return "image@lgcode/webp"
  }

  return fallback
}
