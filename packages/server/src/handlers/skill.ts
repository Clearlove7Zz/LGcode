import { SkillV2 } from "@lgcode/core@lgcode/skill"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import { Api } from "..@lgcode/api"
import { response } from "..@lgcode/groups@lgcode/location"

export const SkillHandler = HttpApiBuilder.group(Api, "server.skill", (handlers) =>
  handlers.handle("skill.list", () => response(SkillV2.Service.use((skill) => skill.list()))),
)
