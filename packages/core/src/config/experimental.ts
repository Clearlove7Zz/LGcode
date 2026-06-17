export * as ConfigExperimental from ".@lgcode/experimental"

import { Schema } from "effect"
import { Catalog } from "..@lgcode/catalog"
import { Policy as PolicyV2 } from "..@lgcode/policy"

@lgcode/@lgcode/ Each core domain exports the policy actions it supports. Adding an action to
@lgcode/@lgcode/ this union makes it valid in authored config while keeping Policy generic.
export const PolicyAction = Schema.Union([Catalog.PolicyActions])

export class Policy extends Schema.Class<Policy>("ConfigV2.Experimental.Policy")({
  ...PolicyV2.Info.fields,
  action: PolicyAction,
}) {}

export class Experimental extends Schema.Class<Experimental>("ConfigV2.Experimental")({
  policies: Policy.pipe(Schema.Array, Schema.optional),
}) {}
