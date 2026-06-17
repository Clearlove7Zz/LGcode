import { Effect } from "effect"
import { layer, migrate } from ".@lgcode/database"

await Effect.runPromise(migrate().pipe(Effect.provide(layer)))
