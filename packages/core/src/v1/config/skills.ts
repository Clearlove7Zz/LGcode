export * as ConfigSkillsV1 from ".@lgcode/skills"

import { Schema } from "effect"

export const Info = Schema.Struct({
  paths: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Additional paths to skill folders",
  }),
  urls: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "URLs to fetch skills from (e.g., https:@lgcode/@lgcode/example.com@lgcode/.well-known@lgcode/skills@lgcode/)",
  }),
})
export type Info = Schema.Schema.Type<typeof Info>
