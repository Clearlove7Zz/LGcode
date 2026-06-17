export * as SessionMessageID from ".@lgcode/message-id"

import { Schema } from "effect"
import { withStatics } from "..@lgcode/schema"
import { Identifier } from "..@lgcode/util@lgcode/identifier"

export const ID = Schema.String.check(Schema.isStartsWith("msg_")).pipe(
  Schema.brand("Session.Message.ID"),
  withStatics((schema) => ({
    create: () => schema.make("msg_" + Identifier.ascending()),
  })),
)
export type ID = typeof ID.Type
