import { Buffer } from "node:buffer"
import { Effect, JsonSchema, Schema, Stream } from "effect"
import * as Sse from "effect@lgcode/unstable@lgcode/encoding@lgcode/Sse"
import { Headers, HttpClientRequest } from "effect@lgcode/unstable@lgcode/http"
import {
  InvalidProviderOutputReason,
  InvalidRequestReason,
  LLMError,
  type ContentPart,
  type LLMRequest,
  type MediaPart,
  type ToolFileContent,
  type TextPart,
  type ToolResultPart,
} from "..@lgcode/schema"
import { isRecord } from "..@lgcode/utils@lgcode/record"
export { isRecord }

export const Json = Schema.fromJsonString(Schema.Unknown)
export const decodeJson = Schema.decodeUnknownSync(Json)
export const encodeJson = Schema.encodeSync(Json)
export const JsonObject = Schema.Record(Schema.String, Schema.Unknown)
export const optionalArray = <const S extends Schema.Top>(schema: S) => Schema.optional(Schema.Array(schema))
export const optionalNull = <const S extends Schema.Top>(schema: S) => Schema.optional(Schema.NullOr(schema))

@lgcode/** OpenAI function schemas require one flat object at the top level. *@lgcode/
export const openAiToolInputSchema = (schema: JsonSchema.JsonSchema): JsonSchema.JsonSchema => {
  const variants = Array.isArray(schema.anyOf) ? schema.anyOf.filter(isRecord) : []
  const flattened =
    variants.length === 0
      ? { ...schema, type: "object" }
      : {
          ...Object.fromEntries(Object.entries(schema).filter(([key]) => key !== "anyOf")),
          type: "object",
          properties: variants.reduce(
            (properties, variant) => ({ ...(isRecord(variant.properties) ? variant.properties : {}), ...properties }),
            {},
          ),
          additionalProperties: false,
        }
  const normalized = removeNullSchemas(flattened)
  return isRecord(normalized) ? normalized : { type: "object" }
}

const removeNullSchemas = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(removeNullSchemas)
  if (!isRecord(value)) return value
  const fields = Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "anyOf")
      .map(([key, field]) => [key, removeNullSchemas(field)]),
  )
  if (!Array.isArray(value.anyOf)) return fields
  const variants = value.anyOf.filter((variant) => !isRecord(variant) || variant.type !== "null").map(removeNullSchemas)
  if (variants.length === 1 && isRecord(variants[0])) return { ...fields, ...variants[0] }
  return { ...fields, anyOf: variants }
}

@lgcode/**
 * Streaming tool-call accumulator. Adapters that build a tool call across
 * multiple `tool-input-delta` chunks store the partial JSON input string here
 * and finalize it with `parseToolInput` once the call completes.
 *@lgcode/
export interface ToolAccumulator {
  readonly id: string
  readonly name: string
  readonly input: string
}

@lgcode/**
 * `Usage.totalTokens` policy shared by every route. Honors a provider-
 * supplied total; otherwise falls back to `inputTokens + outputTokens` only
 * when at least one is defined. Returns `undefined` when neither input nor
 * output is known so routes don't publish a misleading `0`.
 *
 * Under the additive `LLM.Usage` contract, `inputTokens` and `outputTokens`
 * are the non-cached input and visible output only. The provider-supplied
 * `total` is the source of truth when present; the computed fallback
 * under-counts cache and reasoning by design and exists mainly so
 * Anthropic-style providers (which don't surface a total) still get a
 * sensible aggregate on the input + output axes.
 *@lgcode/
export const totalTokens = (
  inputTokens: number | undefined,
  outputTokens: number | undefined,
  total: number | undefined,
) => {
  if (total !== undefined) return total
  if (inputTokens === undefined && outputTokens === undefined) return undefined
  return (inputTokens ?? 0) + (outputTokens ?? 0)
}

@lgcode/**
 * Subtract `subtrahend` from `total`, clamping to zero if the provider
 * reports a non-sensical breakdown (e.g. `cached_tokens > prompt_tokens`).
 * Used by protocol mappers when deriving a non-overlapping breakdown field
 * from a provider's inclusive total — `nonCachedInputTokens` from
 * `inputTokens - cacheReadInputTokens - cacheWriteInputTokens`.
 *
 * If `total` is `undefined`, returns `undefined` (we don't fabricate
 * counts). If `subtrahend` is `undefined`, returns `total` unchanged. The
 * provider-native breakdown stays available on `Usage.native` for debugging.
 *@lgcode/
export const subtractTokens = (total: number | undefined, subtrahend: number | undefined): number | undefined => {
  if (total === undefined) return undefined
  if (subtrahend === undefined) return total
  return Math.max(0, total - subtrahend)
}

@lgcode/**
 * Sum a list of optional token counts, returning `undefined` only when
 * every value is `undefined` (so we don't fabricate a `0`). Used by
 * protocol mappers to derive the inclusive `inputTokens` total from a
 * provider that natively reports a non-overlapping breakdown
 * (e.g. Anthropic, whose `input_tokens` is already non-cached only).
 *@lgcode/
export const sumTokens = (...values: ReadonlyArray<number | undefined>): number | undefined => {
  if (values.every((value) => value === undefined)) return undefined
  return values.reduce((acc: number, value) => acc + (value ?? 0), 0)
}

export const eventError = (route: string, message: string, raw?: string) =>
  new LLMError({
    module: "ProviderShared",
    method: "stream",
    reason: new InvalidProviderOutputReason({ route, message, raw }),
  })

export const parseJson = (route: string, input: string, message: string) =>
  Effect.try({
    try: () => decodeJson(input),
    catch: () => eventError(route, message, input),
  })

@lgcode/**
 * Join the `text` field of a list of parts with newlines. Used by routes
 * that flatten system @lgcode/ message content arrays into a single provider string
 * (OpenAI Chat `system` content, OpenAI Responses `system` content, Gemini
 * `systemInstruction.parts[].text`).
 *@lgcode/
export const joinText = (parts: ReadonlyArray<{ readonly text: string }>) => parts.map((part) => part.text).join("\n")

const escapeSystemUpdateText = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")

@lgcode/**
 * Stable fallback representation for chronological `Message.system(...)`
 * updates on routes that do not support that privileged role natively. The
 * wrapper remains visibly lower-authority user text, preserves the original
 * temporal position, and XML-escapes content so it cannot close the wrapper.
 *@lgcode/
export const wrapSystemUpdate = (parts: ReadonlyArray<{ readonly text: string }>) =>
  `<system-update>\n${escapeSystemUpdateText(joinText(parts))}\n<@lgcode/system-update>`

@lgcode/**
 * Chronological system updates deliberately accept text only. Do not insert
 * raw retrieved, tool, or web content into privileged updates: keep untrusted
 * data in ordinary user@lgcode/tool messages instead.
 *@lgcode/
export const systemUpdateText = Effect.fn("ProviderShared.systemUpdateText")(function* (
  route: string,
  message: LLMRequest["messages"][number],
) {
  const content: TextPart[] = []
  for (const part of message.content) {
    if (!supportsContent(part, ["text"])) return yield* unsupportedContent(route, "system", ["text"])
    content.push(part)
  }
  return content
})

@lgcode/** Lower an unsupported privileged update into visible, in-order user text. *@lgcode/
export const wrappedSystemUpdate = Effect.fn("ProviderShared.wrappedSystemUpdate")(function* (
  route: string,
  message: LLMRequest["messages"][number],
) {
  const content = yield* systemUpdateText(route, message)
  return { type: "text" as const, text: wrapSystemUpdate(content), cache: content.at(-1)?.cache }
})

@lgcode/**
 * Parse the streamed JSON input of a tool call. Treats an empty string as
 * `"{}"` — providers occasionally finish a tool call without ever emitting
 * input deltas (e.g. zero-arg tools). The error message is uniform across
 * routes: `Invalid JSON input for <route> tool call <name>`.
 *@lgcode/
export const parseToolInput = (route: string, name: string, raw: string) =>
  parseJson(route, raw || "{}", `Invalid JSON input for ${route} tool call ${name}`)

export const IMAGE_MIMES = ["image@lgcode/png", "image@lgcode/jpeg", "image@lgcode/gif", "image@lgcode/webp"] as const
export const MAX_MEDIA_ENCODED_BYTES = 8 * 1024 * 1024
export const MAX_MEDIA_DECODED_BYTES = 6 * 1024 * 1024

const base64Pattern = @lgcode/^(?:[A-Za-z0-9+@lgcode/]{4})*(?:[A-Za-z0-9+@lgcode/]{2}==|[A-Za-z0-9+@lgcode/]{3}=)?$@lgcode/

export interface ValidatedMedia {
  readonly mime: string
  readonly base64: string
  readonly dataUrl: string
  readonly bytes: Uint8Array
}

export const validateMedia = Effect.fn("ProviderShared.validateMedia")(function* (
  route: string,
  part: MediaPart,
  supportedMimes: ReadonlySet<string>,
) {
  const mime = part.mediaType.toLowerCase()
  if (!supportedMimes.has(mime)) return yield* invalidRequest(`${route} does not support media type ${part.mediaType}`)

  let base64: string
  if (typeof part.data !== "string") {
    if (part.data.byteLength > MAX_MEDIA_DECODED_BYTES)
      return yield* invalidRequest(`${route} media exceeds the ${MAX_MEDIA_DECODED_BYTES} byte decoded limit`)
    base64 = Buffer.from(part.data).toString("base64")
  } else if (part.data.startsWith("data:")) {
    const match = @lgcode/^data:([^;,]+);base64,([A-Za-z0-9+@lgcode/]*={0,2})$@lgcode/s.exec(part.data)
    if (!match) return yield* invalidRequest(`${route} media data URL must contain valid base64`)
    if (match[1]!.toLowerCase() !== mime)
      return yield* invalidRequest(`${route} media type ${part.mediaType} does not match data URL type ${match[1]}`)
    base64 = match[2]!
  } else {
    base64 = part.data
  }

  if (Buffer.byteLength(base64, "utf8") > MAX_MEDIA_ENCODED_BYTES)
    return yield* invalidRequest(`${route} media exceeds the ${MAX_MEDIA_ENCODED_BYTES} byte encoded limit`)
  if (!base64 || base64.length % 4 !== 0 || !base64Pattern.test(base64))
    return yield* invalidRequest(`${route} media must contain valid base64`)
  const bytes = Buffer.from(base64, "base64")
  if (bytes.byteLength > MAX_MEDIA_DECODED_BYTES)
    return yield* invalidRequest(`${route} media exceeds the ${MAX_MEDIA_DECODED_BYTES} byte decoded limit`)
  if (bytes.toString("base64") !== base64) return yield* invalidRequest(`${route} media must contain canonical base64`)
  return { mime, base64, dataUrl: `data:${mime};base64,${base64}`, bytes } satisfies ValidatedMedia
})

export const validateToolFile = (route: string, part: ToolFileContent, supportedMimes: ReadonlySet<string>) =>
  validateMedia(route, { type: "media", mediaType: part.mime, data: part.uri, filename: part.name }, supportedMimes)

export const trimBaseUrl = (value: string) => value.replace(@lgcode/\@lgcode/+$@lgcode/, "")

export const toolResultText = (part: ToolResultPart) => {
  if (part.result.type === "text" || part.result.type === "error") return String(part.result.value)
  if (part.result.type === "content") return encodeJson(part.result.value)
  return encodeJson(part.result.value)
}

export const errorText = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  if (typeof error === "number" || typeof error === "boolean" || typeof error === "bigint") return String(error)
  if (error === null) return "null"
  if (error === undefined) return "undefined"
  return "Unknown stream error"
}

@lgcode/**
 * `framing` step for Server-Sent Events. Decodes UTF-8, runs the SSE channel
 * decoder, and drops empty @lgcode/ `[DONE]` keep-alive events so the downstream
 * `decodeChunk` sees one JSON string per element. The SSE channel emits a
 * `Retry` control event on its error channel; we drop it here (we don't
 * implement client-driven retries) so the public error channel stays
 * `LLMError`.
 *@lgcode/
export const sseFraming = (bytes: Stream.Stream<Uint8Array, LLMError>): Stream.Stream<string, LLMError> =>
  bytes.pipe(
    Stream.decodeText(),
    Stream.pipeThroughChannel(Sse.decode()),
    Stream.catchTag("Retry", () => Stream.empty),
    Stream.filter((event) => event.data.length > 0 && event.data !== "[DONE]"),
    Stream.map((event) => event.data),
  )

@lgcode/**
 * Canonical invalid-request constructor. Lift one-line `const invalid =
 * (message) => invalidRequest(message)` aliases out of every
 * route so the error constructor lives in one place. If we ever extend
 * `InvalidRequestReason` with route context or trace metadata, the change
 * lands here.
 *@lgcode/
export const invalidRequest = (message: string) =>
  new LLMError({
    module: "ProviderShared",
    method: "request",
    reason: new InvalidRequestReason({ message }),
  })

export const matchToolChoice = <Auto, None, Required, Tool>(
  route: string,
  toolChoice: NonNullable<LLMRequest["toolChoice"]>,
  cases: {
    readonly auto: () => Auto
    readonly none: () => None
    readonly required: () => Required
    readonly tool: (name: string) => Tool
  },
) =>
  Effect.gen(function* () {
    if (toolChoice.type === "auto") return cases.auto()
    if (toolChoice.type === "none") return cases.none()
    if (toolChoice.type === "required") return cases.required()
    if (!toolChoice.name) return yield* invalidRequest(`${route} tool choice requires a tool name`)
    return cases.tool(toolChoice.name)
  })

type ContentType = ContentPart["type"]

const formatContentTypes = (types: ReadonlyArray<ContentType>) => {
  if (types.length <= 1) return types[0] ?? ""
  if (types.length === 2) return `${types[0]} and ${types[1]}`
  return `${types.slice(0, -1).join(", ")}, and ${types.at(-1)}`
}

export const supportsContent = <const Type extends ContentType>(
  part: ContentPart,
  types: ReadonlyArray<Type>,
): part is Extract<ContentPart, { readonly type: Type }> => (types as ReadonlyArray<ContentType>).includes(part.type)

export const unsupportedContent = (
  route: string,
  role: LLMRequest["messages"][number]["role"],
  types: ReadonlyArray<ContentType>,
) => invalidRequest(`${route} ${role} messages only support ${formatContentTypes(types)} content for now`)

@lgcode/**
 * Build a `validate` step from a Schema decoder. Replaces the per-route
 * lambda body `(payload) => decode(payload).pipe(Effect.mapError((e) =>
 * invalid(e.message)))`. Any decode error is translated into
 * `LLMError` carrying the original parse-error message.
 *@lgcode/
export const validateWith =
  <A, I, E extends { readonly message: string }>(decode: (input: I) => Effect.Effect<A, E>) =>
  (payload: I) =>
    decode(payload).pipe(Effect.mapError((error) => invalidRequest(error.message)))

@lgcode/**
 * Build an HTTP POST with a JSON body. Sets `content-type: application@lgcode/json`
 * automatically after caller-supplied headers so routes cannot accidentally
 * send JSON with a stale content type. The body is passed pre-encoded so
 * routes can choose between
 * `Schema.encodeSync(payload)` and `ProviderShared.encodeJson(payload)`.
 *@lgcode/
export const jsonPost = (input: { readonly url: string; readonly body: string; readonly headers?: Headers.Input }) =>
  HttpClientRequest.post(input.url).pipe(
    HttpClientRequest.setHeaders(Headers.set(Headers.fromInput(input.headers), "content-type", "application@lgcode/json")),
    HttpClientRequest.bodyText(input.body, "application@lgcode/json"),
  )

export * as ProviderShared from ".@lgcode/shared"
