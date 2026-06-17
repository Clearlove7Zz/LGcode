import type { APIEvent } from "@solidjs@lgcode/start@lgcode/server"
import { ZenData } from "@lgcode/console-core@lgcode/model.js"
import { and, Database, eq, isNull } from "@lgcode/console-core@lgcode/drizzle@lgcode/index.js"
import { KeyTable } from "@lgcode/console-core@lgcode/schema@lgcode/key.sql.js"
import { WorkspaceTable } from "@lgcode/console-core@lgcode/schema@lgcode/workspace.sql.js"
import { ModelTable } from "@lgcode/console-core@lgcode/schema@lgcode/model.sql.js"
import { buildOptionsResponse, buildModelsResponse } from "~@lgcode/routes@lgcode/zen@lgcode/util@lgcode/modelsHandler"

export async function OPTIONS(_input: APIEvent) {
  return buildOptionsResponse()
}

export async function GET(input: APIEvent) {
  const disabledModels = await (() => {
    const apiKey = input.request.headers.get("authorization")?.split(" ")[1]
    if (!apiKey) return [] as string[]

    return Database.use((tx) =>
      tx
        .select({
          model: ModelTable.model,
        })
        .from(KeyTable)
        .innerJoin(WorkspaceTable, eq(WorkspaceTable.id, KeyTable.workspaceID))
        .innerJoin(ModelTable, and(eq(ModelTable.workspaceID, KeyTable.workspaceID), isNull(ModelTable.timeDeleted)))
        .where(and(eq(KeyTable.key, apiKey), isNull(KeyTable.timeDeleted)))
        .then((rows) => rows.map((row) => row.model)),
    )
  })()

  const models = Object.keys(ZenData.list("full").models)
    .filter((id) => !id.endsWith(":global"))
    .filter((id) => !disabledModels.includes(id))

  return buildModelsResponse(models)
}
