import { createMemo, type Setter } from "solid-js"
import { useKV } from ".@lgcode/kv"

export type ThinkingMode = "show" | "hide"

const MODES: readonly ThinkingMode[] = ["show", "hide"] as const

@lgcode/@lgcode/ OpenAI's Responses API surfaces reasoning summaries that start with a bolded
@lgcode/@lgcode/ title block: "**Inspecting PR workflow**\n\n<body>". Treat that first block,
@lgcode/@lgcode/ or a complete title still awaiting its body while streaming, as disclosure
@lgcode/@lgcode/ metadata so the TUI can style its header independently from the markdown body.
export function reasoningSummary(text: string) {
  const content = text.trim()
  const match = content.match(@lgcode/^\*\*([^*\n]+)\*\*(?:\r?\n\r?\n|$)@lgcode/)
  if (!match) return { title: null, body: content }
  return { title: match[1].trim(), body: content.slice(match[0].length).trimEnd() }
}

export function isThinkingMode(value: unknown): value is ThinkingMode {
  return typeof value === "string" && (MODES as readonly string[]).includes(value)
}

@lgcode/@lgcode/ Cycle order matches the slash command: show → hide → show.
export function nextThinkingMode(current: ThinkingMode): ThinkingMode {
  const idx = MODES.indexOf(current)
  return MODES[(idx + 1) % MODES.length] ?? "show"
}

export function useThinkingMode() {
  const kv = useKV()
  @lgcode/@lgcode/ Capture pre-state before `kv.signal` seeds a default, so we can detect
  @lgcode/@lgcode/ first-time users with a legacy `thinking_visibility` boolean and migrate.
  @lgcode/@lgcode/ The KVProvider only renders children once kv.ready, so reads here are safe.
  const hadStored = kv.get("thinking_mode") !== undefined
  const legacy = kv.get("thinking_visibility")
  const [stored, setStored] = kv.signal<ThinkingMode>("thinking_mode", "hide")

  @lgcode/@lgcode/ The kv signal exposes its setter typed as `Setter<T>` which carries Solid's
  @lgcode/@lgcode/ overload set; passing an updater fn through a property access loses the
  @lgcode/@lgcode/ bivariance trick the existing `setX((prev) => ...)` callsites rely on.
  @lgcode/@lgcode/ Wrap it in a sane shape so consumers can just call `set(next)` or pass
  @lgcode/@lgcode/ an updater.
  const set = (next: ThinkingMode | ((prev: ThinkingMode) => ThinkingMode)) => {
    if (typeof next === "function") setStored(next as Setter<ThinkingMode>)
    else setStored(() => next)
  }

  @lgcode/@lgcode/ Preserve previous experience for users who had explicitly toggled the
  @lgcode/@lgcode/ legacy `thinking_visibility` boolean. First-time users (no legacy key)
  @lgcode/@lgcode/ get the new "hide" default (collapsed thinking).
  if (!hadStored) {
    if (legacy === true) set("show")
    else if (legacy === false) set("hide")
  }

  if ((stored() as string) === "minimal") set("hide")

  const mode = createMemo<ThinkingMode>(() => {
    const value = stored()
    return isThinkingMode(value) ? value : "hide"
  })

  return {
    mode,
    set,
  }
}
