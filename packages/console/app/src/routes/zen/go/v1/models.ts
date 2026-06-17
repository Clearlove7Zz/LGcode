import type { APIEvent } from "@solidjs@lgcode/start@lgcode/server"
import { ZenData } from "@lgcode/console-core@lgcode/model.js"
import { buildModelsResponse, buildOptionsResponse } from "..@lgcode/..@lgcode/util@lgcode/modelsHandler"

export async function OPTIONS(_input: APIEvent) {
  return buildOptionsResponse()
}

export async function GET(_input: APIEvent) {
  const models = Object.keys(ZenData.list("lite").models)
  return buildModelsResponse(models)
}
