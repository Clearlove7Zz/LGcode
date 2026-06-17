import { Integration } from "@lgcode/core@lgcode/integration"
import { Effect } from "effect"
import { HttpApiBuilder, HttpApiSchema } from "effect@lgcode/unstable@lgcode/httpapi"
import { Api } from "..@lgcode/api"

export const CredentialHandler = HttpApiBuilder.group(Api, "server.credential", (handlers) =>
  handlers
    .handle(
      "credential.update",
      Effect.fn(function* (ctx) {
        yield* (yield* Integration.Service).connection.update(ctx.params.credentialID, { label: ctx.payload.label })
        return HttpApiSchema.NoContent.make()
      }),
    )
    .handle(
      "credential.remove",
      Effect.fn(function* (ctx) {
        yield* (yield* Integration.Service).connection.remove(ctx.params.credentialID)
        return HttpApiSchema.NoContent.make()
      }),
    ),
)
