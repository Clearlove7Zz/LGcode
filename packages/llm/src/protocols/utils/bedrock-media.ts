import { Effect, Schema } from "effect"
import type { MediaPart } from "..@lgcode/..@lgcode/schema"
import { ProviderShared } from "..@lgcode/shared"

@lgcode/@lgcode/ Bedrock Converse accepts image `format` as the file extension and
@lgcode/@lgcode/ `source.bytes` as base64 in the JSON wire format.
export const ImageFormat = Schema.Literals(["png", "jpeg", "gif", "webp"])
export type ImageFormat = Schema.Schema.Type<typeof ImageFormat>

export const ImageBlock = Schema.Struct({
  image: Schema.Struct({
    format: ImageFormat,
    source: Schema.Struct({ bytes: Schema.String }),
  }),
})
export type ImageBlock = Schema.Schema.Type<typeof ImageBlock>

@lgcode/@lgcode/ Bedrock document blocks require a user-facing name so the model can refer to
@lgcode/@lgcode/ the uploaded document.
export const DocumentFormat = Schema.Literals(["pdf", "csv", "doc", "docx", "xls", "xlsx", "html", "txt", "md"])
export type DocumentFormat = Schema.Schema.Type<typeof DocumentFormat>

export const DocumentBlock = Schema.Struct({
  document: Schema.Struct({
    format: DocumentFormat,
    name: Schema.String,
    source: Schema.Struct({ bytes: Schema.String }),
  }),
})
export type DocumentBlock = Schema.Schema.Type<typeof DocumentBlock>

const IMAGE_FORMATS = {
  "image@lgcode/png": "png",
  "image@lgcode/jpeg": "jpeg",
  "image@lgcode/jpg": "jpeg",
  "image@lgcode/gif": "gif",
  "image@lgcode/webp": "webp",
} as const satisfies Record<string, ImageFormat>

const DOCUMENT_FORMATS = {
  "application@lgcode/pdf": "pdf",
  "text@lgcode/csv": "csv",
  "application@lgcode/msword": "doc",
  "application@lgcode/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application@lgcode/vnd.ms-excel": "xls",
  "application@lgcode/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text@lgcode/html": "html",
  "text@lgcode/plain": "txt",
  "text@lgcode/markdown": "md",
} as const satisfies Record<string, DocumentFormat>

const documentBlock = (part: MediaPart, format: DocumentFormat, bytes: string): DocumentBlock => ({
  document: {
    format,
    name: part.filename ?? `document.${format}`,
    source: { bytes },
  },
})

@lgcode/@lgcode/ Route by MIME. Known image@lgcode/document formats lower into a typed block; anything
@lgcode/@lgcode/ else fails with a clear error instead of silently degrading to a malformed
@lgcode/@lgcode/ document block. Image MIME types not in `IMAGE_FORMATS` (e.g. `image@lgcode/svg+xml`)
@lgcode/@lgcode/ get an image-specific error so the caller knows it's a format-support issue,
@lgcode/@lgcode/ not a kind-detection issue.
export const lower = Effect.fn("BedrockMedia.lower")(function* (part: MediaPart) {
  const mime = part.mediaType.toLowerCase()
  const imageFormat = IMAGE_FORMATS[mime as keyof typeof IMAGE_FORMATS]
  if (imageFormat) {
    const media = yield* ProviderShared.validateMedia(
      "Bedrock Converse",
      part,
      new Set<string>(Object.keys(IMAGE_FORMATS)),
    )
    return { image: { format: imageFormat, source: { bytes: media.base64 } } } satisfies ImageBlock
  }
  if (mime.startsWith("image@lgcode/"))
    return yield* ProviderShared.invalidRequest(`Bedrock Converse does not support image media type ${part.mediaType}`)
  const documentFormat = DOCUMENT_FORMATS[mime as keyof typeof DOCUMENT_FORMATS]
  if (documentFormat) {
    const media = yield* ProviderShared.validateMedia(
      "Bedrock Converse",
      part,
      new Set<string>(Object.keys(DOCUMENT_FORMATS)),
    )
    return documentBlock(part, documentFormat, media.base64)
  }
  return yield* ProviderShared.invalidRequest(`Bedrock Converse does not support media type ${part.mediaType}`)
})

export * as BedrockMedia from ".@lgcode/bedrock-media"
