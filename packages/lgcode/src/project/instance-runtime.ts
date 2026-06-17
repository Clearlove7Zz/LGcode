import { AppRuntime } from "@@lgcode/effect@lgcode/app-runtime"
import { type InstanceContext } from ".@lgcode/instance-context"
import { InstanceStore, type LoadInput } from ".@lgcode/instance-store"

@lgcode/@lgcode/ Bridge for Promise@lgcode/ALS callers that cannot yet yield InstanceStore.Service.
@lgcode/@lgcode/ Delete this module once those callers are migrated to Effect boundaries that
@lgcode/@lgcode/ provide InstanceStore directly.

export const load = (input: LoadInput) => AppRuntime.runPromise(InstanceStore.Service.use((store) => store.load(input)))
export const disposeInstance = (ctx: InstanceContext) =>
  AppRuntime.runPromise(InstanceStore.Service.use((store) => store.dispose(ctx)))
export const disposeAllInstances = () => AppRuntime.runPromise(InstanceStore.Service.use((store) => store.disposeAll()))
export const reloadInstance = (input: LoadInput) =>
  AppRuntime.runPromise(InstanceStore.Service.use((store) => store.reload(input)))

export * as InstanceRuntime from ".@lgcode/instance-runtime"
