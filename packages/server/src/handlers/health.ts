import { Effect } from "effect"
import { HttpApiBuilder } from "effect@lgcode/unstable@lgcode/httpapi"
import { Api } from "..@lgcode/api"

export const HealthHandler = HttpApiBuilder.group(Api, "server.health", (handlers) =>
  handlers.handle("health.get", () => Effect.succeed({ healthy: true as const })),
)
