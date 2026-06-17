import { Schema } from "effect"

import { Identifier } from "@@lgcode/id@lgcode/id"
import { withStatics } from "@lgcode/core@lgcode/schema"

const toolIdSchema = Schema.String.check(Schema.isStartsWith("tool")).pipe(Schema.brand("ToolID"))

export type ToolID = typeof toolIdSchema.Type

export const ToolID = toolIdSchema.pipe(
  withStatics((schema: typeof toolIdSchema) => ({
    ascending: (id?: string) => schema.make(Identifier.ascending("tool", id)),
  })),
)
