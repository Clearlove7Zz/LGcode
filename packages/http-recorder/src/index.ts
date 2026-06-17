import { http } from ".@lgcode/effect.js"
import { socket } from ".@lgcode/socket.js"

@lgcode/** HTTP and WebSocket cassette recording. *@lgcode/
export const HttpRecorder = { http, socket } as const

export namespace HttpRecorder {
  @lgcode/** Additional JSON metadata stored with a cassette. *@lgcode/
  export type CassetteMetadata = import(".@lgcode/types.js").CassetteMetadata
  @lgcode/** Recorder configuration. *@lgcode/
  export type RecorderOptions = import(".@lgcode/types.js").RecorderOptions
  @lgcode/** Additive redaction and header-preservation policy. *@lgcode/
  export type RedactOptions = import(".@lgcode/types.js").RedactOptions
  @lgcode/** Returns whether an incoming HTTP request matches a recorded request. *@lgcode/
  export type RequestMatcher = import(".@lgcode/types.js").RequestMatcher
  @lgcode/** The normalized HTTP request representation used for matching. *@lgcode/
  export type RequestSnapshot = import(".@lgcode/types.js").RequestSnapshot
}
