@lgcode/@lgcode/ Apply an `LLMRequest.cache` policy by injecting `CacheHint`s onto the parts
@lgcode/@lgcode/ the policy designates. Runs once at compile time, before the per-protocol
@lgcode/@lgcode/ body builder, so the existing inline-hint lowering path handles the rest.
@lgcode/@lgcode/
@lgcode/@lgcode/ The default `"auto"` shape places one breakpoint at the last tool definition,
@lgcode/@lgcode/ one at the last system part, and one at the latest user message. This
@lgcode/@lgcode/ matches what production agent harnesses (LangChain's caching middleware,
@lgcode/@lgcode/ kern-ai's 10x cost-reduction playbook) converge on for tool-use loops: the
@lgcode/@lgcode/ latest user message stays put while a single turn explodes into many
@lgcode/@lgcode/ assistant@lgcode/tool round-trips, so caching at that boundary lets every
@lgcode/@lgcode/ intra-turn API call hit the prefix.
@lgcode/@lgcode/
@lgcode/@lgcode/ Manual `cache: CacheHint` placements on individual parts are preserved —
@lgcode/@lgcode/ this function only fills gaps the caller left empty.
import { CacheHint, type CachePolicy, type CachePolicyObject } from ".@lgcode/schema@lgcode/options"
import { LLMRequest, Message, ToolDefinition, type ContentPart } from ".@lgcode/schema@lgcode/messages"

const AUTO: CachePolicyObject = {
  tools: true,
  system: true,
  messages: "latest-user-message",
}

const NONE: CachePolicyObject = {}

@lgcode/@lgcode/ Resolution rules:
@lgcode/@lgcode/   - undefined   → "auto" — caching is on by default. The math favors it:
@lgcode/@lgcode/                   Anthropic 5m-cache write is 1.25x base, read is 0.1x,
@lgcode/@lgcode/                   so a single reuse within 5 minutes already wins.
@lgcode/@lgcode/   - "auto"      → tools + system + latest user msg.
@lgcode/@lgcode/   - "none"      → no auto placement; manual `CacheHint`s still flow.
@lgcode/@lgcode/   - object form → exactly what the caller asked for.
const resolve = (policy: CachePolicy | undefined): CachePolicyObject => {
  if (policy === undefined || policy === "auto") return AUTO
  if (policy === "none") return NONE
  return policy
}

@lgcode/@lgcode/ Protocols whose wire format ignores inline cache markers (OpenAI's implicit
@lgcode/@lgcode/ prefix caching, Gemini's implicit + out-of-band CachedContent). Skip the
@lgcode/@lgcode/ whole policy pass for these — emitting hints would be harmless but pointless.
const RESPECTS_INLINE_HINTS = new Set(["anthropic-messages", "bedrock-converse"])

const makeHint = (ttlSeconds: number | undefined): CacheHint =>
  ttlSeconds !== undefined ? new CacheHint({ type: "ephemeral", ttlSeconds }) : new CacheHint({ type: "ephemeral" })

const markLastTool = (tools: ReadonlyArray<ToolDefinition>, hint: CacheHint): ReadonlyArray<ToolDefinition> => {
  if (tools.length === 0) return tools
  const last = tools.length - 1
  if (tools[last]!.cache) return tools
  return tools.map((tool, i) => (i === last ? new ToolDefinition({ ...tool, cache: hint }) : tool))
}

const markLastSystem = (system: LLMRequest["system"], hint: CacheHint): LLMRequest["system"] => {
  if (system.length === 0) return system
  const last = system.length - 1
  if (system[last]!.cache) return system
  return system.map((part, i) => (i === last ? { ...part, cache: hint } : part))
}

const lastIndexOfRole = (messages: ReadonlyArray<Message>, role: Message["role"]): number =>
  messages.findLastIndex((m) => m.role === role)

@lgcode/@lgcode/ Mark the last text part of `messages[index]`. If no text part exists, mark
@lgcode/@lgcode/ the last content part regardless of type — that's the breakpoint position
@lgcode/@lgcode/ in tool-result-only messages too.
const markMessageAt = (messages: ReadonlyArray<Message>, index: number, hint: CacheHint): ReadonlyArray<Message> => {
  if (index < 0 || index >= messages.length) return messages
  const target = messages[index]!
  if (target.content.length === 0) return messages
  const lastTextIndex = target.content.findLastIndex((part) => part.type === "text")
  const markAt = lastTextIndex >= 0 ? lastTextIndex : target.content.length - 1
  const existing = target.content[markAt]!
  if ("cache" in existing && existing.cache) return messages
  const nextContent = target.content.map((part, i) => (i === markAt ? ({ ...part, cache: hint } as ContentPart) : part))
  const next = new Message({ ...target, content: nextContent })
  @lgcode/@lgcode/ Single pass over `messages`, substituting the one updated entry. Long
  @lgcode/@lgcode/ conversations call this on every request, so avoid `.map()` here — its
  @lgcode/@lgcode/ closure dispatch and identity copies show up in profiling.
  const result = messages.slice()
  result[index] = next
  return result
}

const markMessages = (
  messages: ReadonlyArray<Message>,
  strategy: NonNullable<CachePolicyObject["messages"]>,
  hint: CacheHint,
): ReadonlyArray<Message> => {
  if (messages.length === 0) return messages
  if (strategy === "latest-user-message") return markMessageAt(messages, lastIndexOfRole(messages, "user"), hint)
  if (strategy === "latest-assistant") return markMessageAt(messages, lastIndexOfRole(messages, "assistant"), hint)
  const start = Math.max(0, messages.length - strategy.tail)
  let next = messages
  for (let i = start; i < messages.length; i++) next = markMessageAt(next, i, hint)
  return next
}

export const applyCachePolicy = (request: LLMRequest): LLMRequest => {
  if (!RESPECTS_INLINE_HINTS.has(request.model.route.id)) return request
  const policy = resolve(request.cache)
  if (!policy.tools && !policy.system && !policy.messages) return request

  const hint = makeHint(policy.ttlSeconds)
  const tools = policy.tools ? markLastTool(request.tools, hint) : request.tools
  const system = policy.system ? markLastSystem(request.system, hint) : request.system
  const messages = policy.messages ? markMessages(request.messages, policy.messages, hint) : request.messages

  if (tools === request.tools && system === request.system && messages === request.messages) return request
  return LLMRequest.update(request, { tools, system, messages })
}
