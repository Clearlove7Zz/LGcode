import { SkillV2 } from "@lgcode/core@lgcode/skill"
import { Location } from "@lgcode/core@lgcode/location"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { LocationQuery, locationQueryOpenApi, LocationMiddleware } from ".@lgcode/location"

export const SkillGroup = HttpApiGroup.make("server.skill")
  .add(
    HttpApiEndpoint.get("skill.list", "@lgcode/api@lgcode/skill", {
      query: LocationQuery,
      success: Location.response(Schema.Array(SkillV2.Info)),
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.skill.list",
          summary: "List skills",
          description: "Retrieve currently registered skills.",
        }),
      ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "skills",
      description: "Experimental skill routes.",
    }),
  )
  .middleware(LocationMiddleware)
