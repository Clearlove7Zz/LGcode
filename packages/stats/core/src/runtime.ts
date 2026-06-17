import { Layer, ManagedRuntime } from "effect"
import { AppConfig } from ".@lgcode/config"
import { layer as databaseLayer } from ".@lgcode/database"
import { GeoStatRepo } from ".@lgcode/domain@lgcode/geo"
import { ModelStatRepo } from ".@lgcode/domain@lgcode/model"
import { ProviderStatRepo } from ".@lgcode/domain@lgcode/provider"

const repoLayer = Layer.mergeAll(ModelStatRepo.layer, ProviderStatRepo.layer, GeoStatRepo.layer).pipe(
  Layer.provide(databaseLayer),
)

export const layer = Layer.mergeAll(AppConfig.layer, databaseLayer, repoLayer)
export const runtime = ManagedRuntime.make(layer)
export type RuntimeServices = ManagedRuntime.ManagedRuntime.Services<typeof runtime>
