import { Schema } from "effect"

import { Identifier } from "@@lgcode/id@lgcode/id"
import { withStatics } from "@lgcode/core@lgcode/schema"

export const EventID = Schema.String.check(Schema.isStartsWith("evt")).pipe(
  Schema.brand("EventID"),
  withStatics((s) => ({
    ascending: (id?: string) => s.make(Identifier.ascending("event", id)),
  })),
)
