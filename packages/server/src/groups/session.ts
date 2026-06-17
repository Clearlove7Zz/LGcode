import { SessionMessage } from "@lgcode/core@lgcode/session@lgcode/message"
import { SessionInput } from "@lgcode/core@lgcode/session@lgcode/input"
import { Prompt } from "@lgcode/core@lgcode/session@lgcode/prompt"
import { SessionV2 } from "@lgcode/core@lgcode/session"
import { ProjectV2 } from "@lgcode/core@lgcode/project"
import { AbsolutePath, PositiveInt, RelativePath, withStatics } from "@lgcode/core@lgcode/schema"
import { WorkspaceV2 } from "@lgcode/core@lgcode/workspace"
import { Schema, Struct } from "effect"
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import {
  ConflictError,
  InvalidCursorError,
  InvalidRequestError,
  ServiceUnavailableError,
  SessionNotFoundError,
  UnknownError,
} from "..@lgcode/errors"
import { SessionLocationMiddleware } from "..@lgcode/middleware@lgcode/session-location"
import { AgentV2 } from "@lgcode/core@lgcode/agent"
import { ModelV2 } from "@lgcode/core@lgcode/model"
import { Location } from "@lgcode/core@lgcode/location"

const SessionsQueryFields = {
  workspace: WorkspaceV2.ID.pipe(Schema.optional),
  limit: Schema.NumberFromString.pipe(Schema.decodeTo(PositiveInt), Schema.optional).annotate({
    description: "Maximum number of sessions to return. Defaults to the newest 50 sessions.",
  }),
  order: Schema.optional(Schema.Union([Schema.Literal("asc"), Schema.Literal("desc")])).annotate({
    description: "Session order for the first page. Use desc for newest first or asc for oldest first.",
  }),
  search: Schema.optional(Schema.String),
}

const SessionsDirectoryQuery = Schema.Struct({
  ...SessionsQueryFields,
  directory: AbsolutePath,
})

const SessionsProjectQuery = Schema.Struct({
  ...SessionsQueryFields,
  project: ProjectV2.ID,
  subpath: RelativePath.pipe(Schema.optional),
})

const SessionsAllQuery = Schema.Struct(SessionsQueryFields)

const withCursor = <Fields extends Schema.Struct.Fields>(schema: Schema.Struct<Fields>) =>
  schema.mapFields((fields) => ({
    ...Struct.omit(fields, ["limit"]),
    anchor: SessionV2.ListAnchor,
  }))

const SessionsCursorInput = Schema.Union([
  withCursor(SessionsDirectoryQuery),
  withCursor(SessionsProjectQuery),
  withCursor(SessionsAllQuery),
])
const SessionsCursorJson = Schema.fromJsonString(SessionsCursorInput)
const encodeSessionsCursor = Schema.encodeSync(SessionsCursorJson)
const decodeSessionsCursor = Schema.decodeUnknownEffect(SessionsCursorJson)

export const SessionsCursor = Schema.String.pipe(
  Schema.brand("SessionsCursor"),
  withStatics((schema) => {
    const make = schema.make
    return {
      make: (input: typeof SessionsCursorInput.Type) =>
        make(Buffer.from(encodeSessionsCursor(input)).toString("base64url")),
      parse: (input: string) => decodeSessionsCursor(Buffer.from(input, "base64url").toString("utf8")),
    }
  }),
)
export type SessionsCursor = typeof SessionsCursor.Type

const SessionsCursorQuery = Schema.Struct({
  cursor: SessionsCursor.annotate({
    description: "Opaque pagination cursor returned as cursor.previous or cursor.next in the previous response.",
  }),
  limit: SessionsQueryFields.limit,
})

export const SessionsQuery = Schema.Struct({
  ...SessionsQueryFields,
  directory: AbsolutePath.pipe(Schema.optional),
  project: ProjectV2.ID.pipe(Schema.optional),
  subpath: RelativePath.pipe(Schema.optional),
  cursor: SessionsCursorQuery.fields.cursor.pipe(Schema.optional),
}).annotate({ identifier: "SessionsQuery" })

export const SessionGroup = HttpApiGroup.make("server.session")
  .add(
    HttpApiEndpoint.get("session.list", "@lgcode/api@lgcode/session", {
      query: SessionsQuery,
      success: Schema.Struct({
        data: Schema.Array(SessionV2.Info),
        cursor: Schema.Struct({
          previous: SessionsCursor.pipe(Schema.optional),
          next: SessionsCursor.pipe(Schema.optional),
        }),
      }).annotate({ identifier: "SessionsResponse" }),
      error: [InvalidCursorError, InvalidRequestError],
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.session.list",
        summary: "List sessions",
        description:
          "Retrieve sessions in the requested order. Items keep that order across pages; use cursor.next or cursor.previous to move through the ordered list.",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("session.create", "@lgcode/api@lgcode/session", {
      payload: Schema.Struct({
        id: SessionV2.ID.pipe(Schema.optional),
        agent: AgentV2.ID.pipe(Schema.optional),
        model: ModelV2.Ref.pipe(Schema.optional),
        location: Location.Ref.pipe(Schema.optional),
      }),
      success: Schema.Struct({ data: SessionV2.Info }),
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.session.create",
        summary: "Create session",
        description: "Create a session at the requested location.",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.get("session.get", "@lgcode/api@lgcode/session@lgcode/:sessionID", {
      params: { sessionID: SessionV2.ID },
      success: Schema.Struct({ data: SessionV2.Info }),
      error: SessionNotFoundError,
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.get",
          summary: "Get session",
          description: "Retrieve a session by ID.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post("session.prompt", "@lgcode/api@lgcode/session@lgcode/:sessionID@lgcode/prompt", {
      params: { sessionID: SessionV2.ID },
      payload: Schema.Struct({
        id: SessionMessage.ID.pipe(Schema.optional),
        prompt: Prompt,
        delivery: SessionInput.Delivery.pipe(Schema.optional),
        resume: Schema.Boolean.pipe(Schema.optional),
      }),
      success: Schema.Struct({ data: SessionInput.Admitted }),
      error: [ConflictError, SessionNotFoundError],
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.prompt",
          summary: "Send message",
          description: "Durably admit one session input and schedule agent-loop execution unless resume is false.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post("session.compact", "@lgcode/api@lgcode/session@lgcode/:sessionID@lgcode/compact", {
      params: { sessionID: SessionV2.ID },
      success: HttpApiSchema.NoContent,
      error: [SessionNotFoundError, ServiceUnavailableError],
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.compact",
          summary: "Compact session",
          description: "Compact a session conversation.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post("session.wait", "@lgcode/api@lgcode/session@lgcode/:sessionID@lgcode/wait", {
      params: { sessionID: SessionV2.ID },
      success: HttpApiSchema.NoContent,
      error: [SessionNotFoundError, ServiceUnavailableError],
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.wait",
          summary: "Wait for session",
          description: "Wait for a session agent loop to become idle.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get("session.context", "@lgcode/api@lgcode/session@lgcode/:sessionID@lgcode/context", {
      params: { sessionID: SessionV2.ID },
      success: Schema.Struct({ data: Schema.Array(SessionMessage.Message) }),
      error: [SessionNotFoundError, UnknownError],
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.context",
          summary: "Get session context",
          description: "Retrieve the active context messages for a session (all messages after the last compaction).",
        }),
      ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "sessions",
      description: "Experimental session routes.",
    }),
  )
