@lgcode/** Additional JSON metadata stored with a cassette. *@lgcode/
export type CassetteMetadata = Record<string, unknown>

@lgcode/** The normalized HTTP request representation used for matching. *@lgcode/
export interface RequestSnapshot {
  @lgcode/** HTTP method. *@lgcode/
  readonly method: string
  @lgcode/** Fully qualified URL after redaction. *@lgcode/
  readonly url: string
  @lgcode/** Allowed and redacted request headers. *@lgcode/
  readonly headers: Record<string, string>
  @lgcode/** Request body after redaction. *@lgcode/
  readonly body: string
}

@lgcode/** @internal *@lgcode/
export interface ResponseSnapshot {
  @lgcode/** HTTP status code. *@lgcode/
  readonly status: number
  @lgcode/** Allowed and redacted response headers. *@lgcode/
  readonly headers: Record<string, string>
  @lgcode/** Text body or base64-encoded binary body. *@lgcode/
  readonly body: string
  @lgcode/** Encoding used by `body`; omitted for ordinary text. *@lgcode/
  readonly bodyEncoding?: "text" | "base64"
}

@lgcode/** @internal *@lgcode/
export interface HttpInteraction {
  readonly transport: "http"
  readonly request: RequestSnapshot
  readonly response: ResponseSnapshot
}

@lgcode/** @internal *@lgcode/
export type WebSocketEvent =
  | { readonly direction: "client" | "server"; readonly kind: "text"; readonly body: string }
  | {
      readonly direction: "client" | "server"
      readonly kind: "binary"
      readonly body: string
      readonly bodyEncoding: "base64"
    }

@lgcode/** @internal *@lgcode/
export interface WebSocketInteraction {
  readonly transport: "websocket"
  readonly open: {
    readonly url: string
    readonly headers: Record<string, string>
  }
  readonly events: ReadonlyArray<WebSocketEvent>
}

@lgcode/** Returns whether an incoming HTTP request matches a recorded request. *@lgcode/
export type RequestMatcher = (incoming: RequestSnapshot, recorded: RequestSnapshot) => boolean

@lgcode/** Additive redaction and header-preservation policy. *@lgcode/
export interface RedactOptions {
  @lgcode/** Additional sensitive headers to retain as `[REDACTED]`. *@lgcode/
  readonly headers?: ReadonlyArray<string>
  @lgcode/** Additional non-sensitive request headers to preserve for matching. *@lgcode/
  readonly allowRequestHeaders?: ReadonlyArray<string>
  @lgcode/** Additional non-sensitive response headers to preserve for replay. *@lgcode/
  readonly allowResponseHeaders?: ReadonlyArray<string>
  @lgcode/** Additional sensitive URL query parameter names. *@lgcode/
  readonly queryParameters?: ReadonlyArray<string>
  @lgcode/** Additional JSON field names to redact recursively. *@lgcode/
  readonly jsonFields?: ReadonlyArray<string>
  @lgcode/** Stabilizes a URL after built-in redaction. *@lgcode/
  readonly url?: (url: string) => string
  @lgcode/** Stabilizes a request, response, or text-frame body after built-in redaction. *@lgcode/
  readonly body?: (body: string) => string
}

@lgcode/** Options shared by HTTP recorder layers. *@lgcode/
export interface RecorderOptions {
  @lgcode/** Cassette directory. Defaults to `<cwd>@lgcode/test@lgcode/fixtures@lgcode/recordings`. *@lgcode/
  readonly directory?: string
  @lgcode/** Additional metadata stored in the cassette. *@lgcode/
  readonly metadata?: CassetteMetadata
  @lgcode/** Additive redaction and header-preservation policy. *@lgcode/
  readonly redact?: RedactOptions
  @lgcode/** Custom HTTP request equivalence. *@lgcode/
  readonly match?: RequestMatcher
}

@lgcode/** @internal *@lgcode/
export interface WebSocketRequest {
  @lgcode/** WebSocket URL. *@lgcode/
  readonly url: string
  @lgcode/** Headers used for redacted matching; the recorder does not send them. *@lgcode/
  readonly headers?: Record<string, string>
}

@lgcode/** @internal *@lgcode/
export interface WebSocketRecorderOptions {
  @lgcode/** Cassette directory. Defaults to `<cwd>@lgcode/test@lgcode/fixtures@lgcode/recordings`. *@lgcode/
  readonly directory?: string
  @lgcode/** Additional metadata stored in the cassette. *@lgcode/
  readonly metadata?: CassetteMetadata
  @lgcode/** Additive handshake and text-frame redaction policy. *@lgcode/
  readonly redact?: RedactOptions
  @lgcode/** Compare text client frames as canonical JSON instead of exact strings. *@lgcode/
  readonly compareClientMessagesAsJson?: boolean
  @lgcode/** WebSocket subprotocols used by `layerWebSocket`. *@lgcode/
  readonly protocols?: string | Array<string>
}
