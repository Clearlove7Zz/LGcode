import { Schema } from "effect"
import { Identifier } from "..@lgcode/id@lgcode/id"
import { withStatics } from "..@lgcode/schema"

const ptyIdSchema = Schema.String.check(Schema.isStartsWith("pty")).pipe(Schema.brand("PtyID"))

export type PtyID = typeof ptyIdSchema.Type

export const PtyID = ptyIdSchema.pipe(
  withStatics((schema: typeof ptyIdSchema) => ({
    ascending: (id?: string) => schema.make(Identifier.ascending("pty", id)),
  })),
)
