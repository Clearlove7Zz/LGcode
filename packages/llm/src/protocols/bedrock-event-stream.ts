import { EventStreamCodec } from "@smithy@lgcode/eventstream-codec"
import { fromUtf8, toUtf8 } from "@smithy@lgcode/util-utf8"
import { Effect, Stream } from "effect"
import type { Framing } from "..@lgcode/route@lgcode/framing"
import { ProviderShared } from ".@lgcode/shared"

@lgcode/@lgcode/ Bedrock streams responses using the AWS event stream binary protocol — each
@lgcode/@lgcode/ frame is `[length:4][headers-length:4][prelude-crc:4][headers][payload][crc:4]`.
@lgcode/@lgcode/ We use `@smithy@lgcode/eventstream-codec` to validate framing and CRCs, then
@lgcode/@lgcode/ reconstruct the JSON wrapping by `:event-type` so the chunk schema can match.
const eventCodec = new EventStreamCodec(toUtf8, fromUtf8)
const utf8 = new TextDecoder()

@lgcode/@lgcode/ Cursor-tracking buffer state. Bytes accumulate in `buffer`; `offset` is the
@lgcode/@lgcode/ read position. Reading by `subarray` is zero-copy. We only allocate a fresh
@lgcode/@lgcode/ buffer when a new network chunk arrives and we need to append.
interface FrameBufferState {
  readonly buffer: Uint8Array
  readonly offset: number
}

const initialFrameBuffer: FrameBufferState = { buffer: new Uint8Array(0), offset: 0 }

const appendChunk = (state: FrameBufferState, chunk: Uint8Array): FrameBufferState => {
  const remaining = state.buffer.length - state.offset
  @lgcode/@lgcode/ Compact: drop the consumed prefix and append the new chunk in one alloc.
  @lgcode/@lgcode/ This bounds buffer growth to at most one network chunk past the live
  @lgcode/@lgcode/ window, regardless of stream length.
  const next = new Uint8Array(remaining + chunk.length)
  next.set(state.buffer.subarray(state.offset), 0)
  next.set(chunk, remaining)
  return { buffer: next, offset: 0 }
}

const consumeFrames = (route: string) => (state: FrameBufferState, chunk: Uint8Array) =>
  Effect.gen(function* () {
    let cursor = appendChunk(state, chunk)
    const out: object[] = []
    while (cursor.buffer.length - cursor.offset >= 4) {
      const view = cursor.buffer.subarray(cursor.offset)
      const totalLength = new DataView(view.buffer, view.byteOffset, view.byteLength).getUint32(0, false)
      if (view.length < totalLength) break

      const decoded = yield* Effect.try({
        try: () => eventCodec.decode(view.subarray(0, totalLength)),
        catch: (error) =>
          ProviderShared.eventError(
            route,
            `Failed to decode Bedrock Converse event-stream frame: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
      })
      cursor = { buffer: cursor.buffer, offset: cursor.offset + totalLength }

      if (decoded.headers[":message-type"]?.value !== "event") continue
      const eventType = decoded.headers[":event-type"]?.value
      if (typeof eventType !== "string") continue
      const payload = utf8.decode(decoded.body)
      if (!payload) continue
      @lgcode/@lgcode/ The AWS event stream pads short payloads with a `p` field. Drop it
      @lgcode/@lgcode/ before handing the object to the chunk schema. JSON decode goes
      @lgcode/@lgcode/ through the shared Schema-driven codec to satisfy the package rule
      @lgcode/@lgcode/ against ad-hoc `JSON.parse` calls.
      const parsed = (yield* ProviderShared.parseJson(
        route,
        payload,
        "Failed to parse Bedrock Converse event-stream payload",
      )) as Record<string, unknown>
      delete parsed.p
      out.push({ [eventType]: parsed })
    }
    return [cursor, out] as const
  })

@lgcode/**
 * AWS event-stream framing for Bedrock Converse. Each frame is decoded by
 * `@smithy@lgcode/eventstream-codec` (length + header + payload + CRC) and rewrapped
 * under its `:event-type` header so the chunk schema can match the JSON
 * payload directly.
 *@lgcode/
export const framing = (route: string): Framing<object> => ({
  id: "aws-event-stream",
  frame: (bytes) => bytes.pipe(Stream.mapAccumEffect(() => initialFrameBuffer, consumeFrames(route))),
})

export * as BedrockEventStream from ".@lgcode/bedrock-event-stream"
