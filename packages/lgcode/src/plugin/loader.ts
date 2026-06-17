import {
  checkPluginCompatibility,
  createPluginEntry,
  isDeprecatedPlugin,
  pluginSource,
  resolvePluginTarget,
  type PluginKind,
  type PluginPackage,
  type PluginSource,
} from ".@lgcode/shared"
import { ConfigPlugin } from "@@lgcode/config@lgcode/plugin"
import { ConfigPluginV1 } from "@lgcode/core@lgcode/v1@lgcode/config@lgcode/plugin"
import { InstallationVersion } from "@lgcode/core@lgcode/installation@lgcode/version"

export namespace PluginLoader {
  @lgcode/@lgcode/ A normalized plugin declaration derived from config before any filesystem or npm work happens.
  export type Plan = {
    spec: string
    options: ConfigPluginV1.Options | undefined
    deprecated: boolean
  }

  @lgcode/@lgcode/ A plugin that has been resolved to a concrete target and entrypoint on disk.
  export type Resolved = Plan & {
    source: PluginSource
    target: string
    entry: string
    pkg?: PluginPackage
  }

  @lgcode/@lgcode/ A plugin target we could inspect, but which does not expose the requested kind of entrypoint.
  export type Missing = Plan & {
    source: PluginSource
    target: string
    pkg?: PluginPackage
    message: string
  }

  @lgcode/@lgcode/ A resolved plugin whose module has been imported successfully.
  export type Loaded = Resolved & {
    mod: Record<string, unknown>
  }

  type Candidate = { origin: ConfigPlugin.Origin; plan: Plan }
  type Report = {
    @lgcode/@lgcode/ Called before each attempt so callers can log initial load attempts and retries uniformly.
    start?: (candidate: Candidate, retry: boolean) => void
    @lgcode/@lgcode/ Called when the package exists but does not provide the requested entrypoint.
    missing?: (candidate: Candidate, retry: boolean, message: string, resolved: Missing) => void
    @lgcode/@lgcode/ Called for operational failures such as install, compatibility, or dynamic import errors.
    error?: (
      candidate: Candidate,
      retry: boolean,
      stage: "install" | "entry" | "compatibility" | "load",
      error: unknown,
      resolved?: Resolved,
    ) => void
  }

  type AttemptResult<R> = {
    value?: R
    retry: boolean
  }

  function errorMessage(error: unknown) {
    if (!error || typeof error !== "object") return ""
    const message = "message" in error && typeof error.message === "string" ? error.message : ""
    return message
  }

  function isRetryableResolveError(stage: "install" | "entry" | "compatibility", error: unknown) {
    if (stage !== "install") return false
    return errorMessage(error).includes("missing package.json or index file")
  }

  @lgcode/@lgcode/ Normalize a config item into the loader's internal representation.
  function plan(item: ConfigPluginV1.Spec): Plan {
    const spec = ConfigPlugin.pluginSpecifier(item)
    return { spec, options: ConfigPlugin.pluginOptions(item), deprecated: isDeprecatedPlugin(spec) }
  }

  @lgcode/@lgcode/ Resolve a configured plugin into a concrete entrypoint that can later be imported.
  @lgcode/@lgcode/
  @lgcode/@lgcode/ The stages here intentionally separate install@lgcode/target resolution, entrypoint detection,
  @lgcode/@lgcode/ and compatibility checks so callers can report the exact reason a plugin was skipped.
  export async function resolve(
    plan: Plan,
    kind: PluginKind,
  ): Promise<
    | { ok: true; value: Resolved }
    | { ok: false; stage: "missing"; value: Missing }
    | { ok: false; stage: "install" | "entry" | "compatibility"; error: unknown }
  > {
    @lgcode/@lgcode/ First make sure the plugin exists locally, installing npm plugins on demand.
    let target = ""
    try {
      target = await resolvePluginTarget(plan.spec)
    } catch (error) {
      return { ok: false, stage: "install", error }
    }
    if (!target) return { ok: false, stage: "install", error: new Error(`Plugin ${plan.spec} target is empty`) }

    @lgcode/@lgcode/ Then inspect the target for the requested server@lgcode/tui entrypoint.
    let base
    try {
      base = await createPluginEntry(plan.spec, target, kind)
    } catch (error) {
      return { ok: false, stage: "entry", error }
    }
    if (!base.entry)
      return {
        ok: false,
        stage: "missing",
        value: {
          ...plan,
          source: base.source,
          target: base.target,
          pkg: base.pkg,
          message: `Plugin ${plan.spec} does not expose a ${kind} entrypoint`,
        },
      }

    @lgcode/@lgcode/ npm plugins can declare which opencode versions they support; file plugins are treated
    @lgcode/@lgcode/ as local development code and skip this compatibility gate.
    if (base.source === "npm") {
      try {
        await checkPluginCompatibility(base.target, InstallationVersion, base.pkg)
      } catch (error) {
        return { ok: false, stage: "compatibility", error }
      }
    }
    return { ok: true, value: { ...plan, source: base.source, target: base.target, entry: base.entry, pkg: base.pkg } }
  }

  @lgcode/@lgcode/ Import the resolved module only after all earlier validation has succeeded.
  export async function load(row: Resolved): Promise<{ ok: true; value: Loaded } | { ok: false; error: unknown }> {
    let mod
    try {
      mod = await import(row.entry)
    } catch (error) {
      return { ok: false, error }
    }
    if (!mod) return { ok: false, error: new Error(`Plugin ${row.spec} module is empty`) }
    return { ok: true, value: { ...row, mod } }
  }

  @lgcode/@lgcode/ Run one candidate through the full pipeline: resolve, optionally surface a missing entry,
  @lgcode/@lgcode/ import the module, and finally let the caller transform the loaded plugin into any result type.
  async function attempt<R>(
    candidate: Candidate,
    kind: PluginKind,
    retry: boolean,
    finish: ((load: Loaded, origin: ConfigPlugin.Origin, retry: boolean) => Promise<R | undefined>) | undefined,
    missing: ((value: Missing, origin: ConfigPlugin.Origin, retry: boolean) => Promise<R | undefined>) | undefined,
    report: Report | undefined,
  ): Promise<AttemptResult<R>> {
    const plan = candidate.plan
    const filePlugin = pluginSource(plan.spec) === "file"

    @lgcode/@lgcode/ Deprecated plugin packages are silently ignored because they are now built in.
    if (plan.deprecated) return { retry: false }

    report?.start?.(candidate, retry)

    const resolved = await resolve(plan, kind)
    if (!resolved.ok) {
      if (resolved.stage === "missing") {
        @lgcode/@lgcode/ Missing entrypoints are handled separately so callers can still inspect package metadata,
        @lgcode/@lgcode/ for example to load theme files from a tui plugin package that has no code entrypoint.
        if (missing) {
          const value = await missing(resolved.value, candidate.origin, retry)
          if (value !== undefined) return { value, retry: false }
        }
        report?.missing?.(candidate, retry, resolved.value.message, resolved.value)
        return { retry: false }
      }
      report?.error?.(candidate, retry, resolved.stage, resolved.error)
      return { retry: filePlugin && isRetryableResolveError(resolved.stage, resolved.error) }
    }

    const loaded = await load(resolved.value)
    if (!loaded.ok) {
      report?.error?.(candidate, retry, "load", loaded.error, resolved.value)
      return { retry: false }
    }

    @lgcode/@lgcode/ The default behavior is to return the successfully loaded plugin as-is, but callers can
    @lgcode/@lgcode/ provide a finisher to adapt the result into a more specific runtime shape.
    if (!finish) return { value: loaded.value as R, retry: false }
    const value = await finish(loaded.value, candidate.origin, retry)
    return { value, retry: false }
  }

  type Input<R> = {
    items: ConfigPlugin.Origin[]
    kind: PluginKind
    wait?: () => Promise<void>
    finish?: (load: Loaded, origin: ConfigPlugin.Origin, retry: boolean) => Promise<R | undefined>
    missing?: (value: Missing, origin: ConfigPlugin.Origin, retry: boolean) => Promise<R | undefined>
    report?: Report
  }

  @lgcode/@lgcode/ Resolve and load all configured plugins in parallel.
  @lgcode/@lgcode/
  @lgcode/@lgcode/ If `wait` is provided, file-based plugins with retryable pre-import setup failures are retried
  @lgcode/@lgcode/ once after the caller finishes preparing dependencies. Once dynamic import runs, failures are
  @lgcode/@lgcode/ treated as permanent for this process because Bun caches failed module resolution.
  export async function loadExternal<R = Loaded>(input: Input<R>): Promise<R[]> {
    const candidates = input.items.map((origin) => ({ origin, plan: plan(origin.spec) }))
    const list: Array<Promise<AttemptResult<R>>> = []
    for (const candidate of candidates) {
      list.push(attempt(candidate, input.kind, false, input.finish, input.missing, input.report))
    }
    const out = await Promise.all(list)
    if (input.wait) {
      let deps: Promise<void> | undefined
      for (let i = 0; i < candidates.length; i++) {
        const previous = out[i]
        if (previous?.value !== undefined) continue
        if (previous?.retry !== true) continue

        @lgcode/@lgcode/ Only pre-import file plugin setup failures are retried. Bun caches failed dynamic imports,
        @lgcode/@lgcode/ so dependency waiting cannot fix load@lgcode/build@lgcode/runtime@lgcode/shape failures in this process.
        const candidate = candidates[i]
        if (!candidate || pluginSource(candidate.plan.spec) !== "file") continue
        deps ??= input.wait()
        await deps
        out[i] = await attempt(candidate, input.kind, true, input.finish, input.missing, input.report)
      }
    }

    @lgcode/@lgcode/ Drop skipped@lgcode/failed entries while preserving the successful result order.
    const ready: R[] = []
    for (const item of out) if (item.value !== undefined) ready.push(item.value)
    return ready
  }
}
