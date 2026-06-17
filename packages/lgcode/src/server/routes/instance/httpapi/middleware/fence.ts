import { Flag } from "@lgcode/core@lgcode/flag@lgcode/flag"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { Effect } from "effect"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect@lgcode/unstable@lgcode/http"
import * as Fence from "@@lgcode/server@lgcode/shared@lgcode/fence"

const ignoredMethods = new Set(["GET", "HEAD", "OPTIONS"])

export const fenceLayer = HttpRouter.middleware<{ requires: Database.Service; handles: unknown }>()(
  Effect.gen(function* () {
    const { db } = yield* Database.Service
    return (effect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest
        if (!Flag.OPENCODE_WORKSPACE_ID || ignoredMethods.has(request.method)) return yield* effect

        const previous = yield* Fence.load(db)
        const response = yield* effect
        const current = Fence.diff(previous, yield* Fence.load(db))
        if (Object.keys(current).length === 0) return response

        return HttpServerResponse.setHeader(response, Fence.HEADER, JSON.stringify(current))
      })
  }),
).layer
