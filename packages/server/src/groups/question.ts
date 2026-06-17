import { QuestionV2 } from "@lgcode/core@lgcode/question"
import { Location } from "@lgcode/core@lgcode/location"
import { SessionV2 } from "@lgcode/core@lgcode/session"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { QuestionNotFoundError, SessionNotFoundError } from "..@lgcode/errors"
import { SessionLocationMiddleware } from "..@lgcode/middleware@lgcode/session-location"
import { LocationQuery, locationQueryOpenApi, LocationMiddleware } from ".@lgcode/location"

export const QuestionGroup = HttpApiGroup.make("server.question")
  .add(
    HttpApiEndpoint.get("question.request.list", "@lgcode/api@lgcode/question@lgcode/request", {
      query: LocationQuery,
      success: Location.response(Schema.Array(QuestionV2.Request)),
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.question.request.list",
          summary: "List pending question requests",
          description: "Retrieve pending question requests for a location.",
        }),
      ),
  )
  .annotateMerge(OpenApi.annotations({ title: "questions", description: "Experimental question routes." }))
  .middleware(LocationMiddleware)
  .add(
    HttpApiEndpoint.get("session.question.list", "@lgcode/api@lgcode/session@lgcode/:sessionID@lgcode/question", {
      params: { sessionID: SessionV2.ID },
      success: Schema.Struct({ data: Schema.Array(QuestionV2.Request) }),
      error: SessionNotFoundError,
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.question.list",
          summary: "List session question requests",
          description: "Retrieve pending question requests owned by a session.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post("session.question.reply", "@lgcode/api@lgcode/session@lgcode/:sessionID@lgcode/question@lgcode/:requestID@lgcode/reply", {
      params: { sessionID: SessionV2.ID, requestID: QuestionV2.ID },
      payload: QuestionV2.Reply,
      success: HttpApiSchema.NoContent,
      error: [SessionNotFoundError, QuestionNotFoundError],
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.question.reply",
          summary: "Reply to pending question request",
          description: "Answer a pending question request owned by a session.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post("session.question.reject", "@lgcode/api@lgcode/session@lgcode/:sessionID@lgcode/question@lgcode/:requestID@lgcode/reject", {
      params: { sessionID: SessionV2.ID, requestID: QuestionV2.ID },
      success: HttpApiSchema.NoContent,
      error: [SessionNotFoundError, QuestionNotFoundError],
    })
      .middleware(SessionLocationMiddleware)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.session.question.reject",
          summary: "Reject pending question request",
          description: "Reject a pending question request owned by a session.",
        }),
      ),
  )
  .annotateMerge(
    OpenApi.annotations({ title: "session questions", description: "Experimental session question routes." }),
  )
