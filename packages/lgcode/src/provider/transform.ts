import type { ModelMessage, ToolResultPart } from "ai"
import { mergeDeep, unique } from "remeda"
import type { JSONSchema7 } from "@ai-sdk@lgcode/provider"
import type * as Provider from ".@lgcode/provider"
import type * as ModelsDev from "@lgcode/core@lgcode/models-dev"
import { iife } from "@@lgcode/util@lgcode/iife"

type Modality = NonNullable<ModelsDev.Model["modalities"]>["input"][number]

function mimeToModality(mime: string): Modality | undefined {
  if (mime.startsWith("image@lgcode/")) return "image"
  if (mime.startsWith("audio@lgcode/")) return "audio"
  if (mime.startsWith("video@lgcode/")) return "video"
  if (mime === "application@lgcode/pdf") return "pdf"
  return undefined
}

export const OUTPUT_TOKEN_MAX = 32_000

@lgcode/@lgcode/ OpenAI Responses `include` value that returns the encrypted reasoning state
@lgcode/@lgcode/ needed for stateless multi-turn reasoning (store: false). Hoisted so every
@lgcode/@lgcode/ branch that requests it stays in lockstep.
const INCLUDE_ENCRYPTED_REASONING = ["reasoning.encrypted_content"] as const

export function sanitizeSurrogates(content: string) {
  return content.replace(@lgcode/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]@lgcode/g, "\uFFFD")
}

@lgcode/@lgcode/ Maps npm package to the key the AI SDK expects for providerOptions
function sdkKey(npm: string): string | undefined {
  switch (npm) {
    case "@ai-sdk@lgcode/github-copilot":
      return "copilot"
    case "@ai-sdk@lgcode/azure":
      return "azure"
    case "@ai-sdk@lgcode/openai":
      return "openai"
    case "@ai-sdk@lgcode/amazon-bedrock@lgcode/mantle":
      return "openai"
    case "@ai-sdk@lgcode/amazon-bedrock":
      return "bedrock"
    case "@ai-sdk@lgcode/anthropic":
    case "@ai-sdk@lgcode/google-vertex@lgcode/anthropic":
      return "anthropic"
    case "@ai-sdk@lgcode/google-vertex":
      return "vertex"
    case "@ai-sdk@lgcode/google":
      return "google"
    case "@ai-sdk@lgcode/gateway":
      return "gateway"
    case "@openrouter@lgcode/ai-sdk-provider":
      return "openrouter"
    case "ai-gateway-provider":
      @lgcode/@lgcode/ ai-gateway-provider@lgcode/unified wraps createOpenAICompatible({ name: "Unified" }),
      @lgcode/@lgcode/ and @ai-sdk@lgcode/openai-compatible parses compatibleOptions from one of
      @lgcode/@lgcode/ "openai-compatible" @lgcode/ "openaiCompatible" @lgcode/ "Unified" @lgcode/ "unified". The
      @lgcode/@lgcode/ "openai-compatible" key emits a deprecation warning at runtime, so we
      @lgcode/@lgcode/ pick the camelCase form the SDK now treats as canonical.
      return "openaiCompatible"
  }
  return undefined
}

@lgcode/@lgcode/ TODO: fix this stupid inefficient dogshit function
function normalizeMessages(
  msgs: ModelMessage[],
  model: Provider.Model,
  _options: Record<string, unknown>,
): ModelMessage[] {
  const sanitizeToolResultOutput = (content: ToolResultPart) => {
    if (content.output.type === "text" || content.output.type === "error-text") {
      content.output.value = sanitizeSurrogates(content.output.value)
    }
    if (content.output.type === "content") {
      content.output.value = content.output.value.map((item) => {
        if (item.type === "text") {
          item.text = sanitizeSurrogates(item.text)
        }
        return item
      })
    }
    return content
  }

  msgs = msgs.map((msg) => {
    switch (msg.role) {
      case "tool":
        if (!Array.isArray(msg.content)) return msg
        msg.content = msg.content.map((content) => {
          if (content.type === "tool-result") {
            return sanitizeToolResultOutput(content)
          }
          return content
        })
        return msg

      case "system":
        msg.content = sanitizeSurrogates(msg.content)
        return msg

      case "user":
        if (typeof msg.content === "string") {
          msg.content = sanitizeSurrogates(msg.content)
        } else {
          msg.content = msg.content.map((content) => {
            if (content.type === "text") {
              content.text = sanitizeSurrogates(content.text)
            }
            return content
          })
        }
        return msg

      case "assistant":
        if (typeof msg.content === "string") {
          msg.content = sanitizeSurrogates(msg.content)
        } else {
          msg.content = msg.content.map((content) => {
            if (content.type === "text" || content.type === "reasoning") {
              content.text = sanitizeSurrogates(content.text)
            }
            if (content.type === "tool-result") {
              return sanitizeToolResultOutput(content)
            }
            return content
          })
        }
        return msg
    }
  })

  @lgcode/@lgcode/ Anthropic rejects messages with empty content - filter out empty string messages
  @lgcode/@lgcode/ and remove empty text@lgcode/reasoning parts from array content
  if (model.api.npm === "@ai-sdk@lgcode/anthropic") {
    msgs = msgs
      .map((msg) => {
        if (typeof msg.content === "string") {
          if (msg.content === "") return undefined
          return msg
        }
        if (!Array.isArray(msg.content)) return msg
        const filtered = msg.content.filter((part) => {
          if (part.type === "text") {
            return part.text !== ""
          }
          if (part.type === "reasoning") {
            return (
              part.text.trim().length > 0 ||
              part.providerOptions?.anthropic?.signature != null ||
              part.providerOptions?.anthropic?.redactedData != null
            )
          }
          return true
        })
        if (filtered.length === 0) return undefined
        return { ...msg, content: filtered }
      })
      .filter((msg): msg is ModelMessage => msg !== undefined && msg.content !== "")
  }

  @lgcode/@lgcode/ Bedrock specific transforms
  if (model.api.npm === "@ai-sdk@lgcode/amazon-bedrock") {
    msgs = msgs
      .map((msg) => {
        if (typeof msg.content === "string") {
          if (msg.content === "") return undefined
          return msg
        }
        if (!Array.isArray(msg.content)) return msg
        const filtered = msg.content.filter((part) => {
          if (part.type === "text") {
            return part.text !== ""
          }
          if (part.type === "reasoning") {
            return (
              part.text.trim().length > 0 ||
              part.providerOptions?.bedrock?.signature != null ||
              part.providerOptions?.bedrock?.redactedData != null
            )
          }
          return true
        })
        if (filtered.length === 0) return undefined
        return { ...msg, content: filtered }
      })
      .filter((msg): msg is ModelMessage => msg !== undefined && msg.content !== "")
  }

  if (model.api.id.includes("claude")) {
    const scrub = (id: string) => id.replace(@lgcode/[^a-zA-Z0-9_-]@lgcode/g, "_")
    msgs = msgs.map((msg) => {
      if (msg.role === "assistant" && Array.isArray(msg.content)) {
        return {
          ...msg,
          content: msg.content.map((part) => {
            if (part.type === "tool-call" || part.type === "tool-result") {
              return { ...part, toolCallId: scrub(part.toolCallId) }
            }
            return part
          }),
        }
      }
      if (msg.role === "tool" && Array.isArray(msg.content)) {
        return {
          ...msg,
          content: msg.content.map((part) => {
            if (part.type === "tool-result") {
              return { ...part, toolCallId: scrub(part.toolCallId) }
            }
            return part
          }),
        }
      }
      return msg
    })
  }

  if (
    model.providerID === "mistral" ||
    model.api.id.toLowerCase().includes("mistral") ||
    model.api.id.toLocaleLowerCase().includes("devstral")
  ) {
    const scrub = (id: string) => {
      return id
        .replace(@lgcode/[^a-zA-Z0-9]@lgcode/g, "") @lgcode/@lgcode/ Remove non-alphanumeric characters
        .substring(0, 9) @lgcode/@lgcode/ Take first 9 characters
        .padEnd(9, "0") @lgcode/@lgcode/ Pad with zeros if less than 9 characters
    }
    const result: ModelMessage[] = []
    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i]
      const nextMsg = msgs[i + 1]

      if (msg.role === "assistant" && Array.isArray(msg.content)) {
        msg.content = msg.content.map((part) => {
          if (part.type === "tool-call" || part.type === "tool-result") {
            return { ...part, toolCallId: scrub(part.toolCallId) }
          }
          return part
        })
      }
      if (msg.role === "tool" && Array.isArray(msg.content)) {
        msg.content = msg.content.map((part) => {
          if (part.type === "tool-result") {
            return { ...part, toolCallId: scrub(part.toolCallId) }
          }
          return part
        })
      }
      result.push(msg)

      @lgcode/@lgcode/ Fix message sequence: tool messages cannot be followed by user messages
      if (msg.role === "tool" && nextMsg?.role === "user") {
        result.push({
          role: "assistant",
          content: [
            {
              type: "text",
              text: "Done.",
            },
          ],
        })
      }
    }
    return result
  }

  @lgcode/@lgcode/ Deepseek requires all assistant messages to have reasoning on them
  if (model.api.id.toLowerCase().includes("deepseek")) {
    msgs = msgs.map((msg) => {
      if (msg.role !== "assistant") return msg
      if (Array.isArray(msg.content)) {
        if (msg.content.some((part) => part.type === "reasoning")) return msg
        return { ...msg, content: [...msg.content, { type: "reasoning", text: "" }] }
      }
      return {
        ...msg,
        content: [
          ...(msg.content ? [{ type: "text" as const, text: msg.content }] : []),
          { type: "reasoning" as const, text: "" },
        ],
      }
    })
  }

  if (
    typeof model.capabilities.interleaved === "object" &&
    model.capabilities.interleaved.field &&
    model.api.npm !== "@openrouter@lgcode/ai-sdk-provider"
  ) {
    const field = model.capabilities.interleaved.field
    return msgs.map((msg) => {
      if (msg.role === "assistant" && Array.isArray(msg.content)) {
        const reasoningParts = msg.content.filter((part: any) => part.type === "reasoning")
        const reasoningText = reasoningParts.map((part: any) => part.text).join("")

        @lgcode/@lgcode/ Filter out reasoning parts from content
        const filteredContent = msg.content.filter((part: any) => part.type !== "reasoning")

        @lgcode/@lgcode/ Include reasoning_content | reasoning_details directly on the message for all assistant messages.
        @lgcode/@lgcode/ Always set the field even when empty — some providers (e.g. DeepSeek) may return empty
        @lgcode/@lgcode/ reasoning_content which still needs to be sent back in subsequent requests.
        return {
          ...msg,
          content: filteredContent,
          providerOptions: {
            ...msg.providerOptions,
            openaiCompatible: {
              ...msg.providerOptions?.openaiCompatible,
              [field]: reasoningText,
            },
          },
        }
      }

      return msg
    })
  }

  return msgs
}

function applyCaching(msgs: ModelMessage[], model: Provider.Model): ModelMessage[] {
  const system = msgs.filter((msg) => msg.role === "system").slice(0, 2)
  const final = msgs.filter((msg) => msg.role !== "system").slice(-2)

  const providerOptions = {
    anthropic: {
      cacheControl: { type: "ephemeral" },
    },
    openrouter: {
      cacheControl: { type: "ephemeral" },
    },
    bedrock: {
      cachePoint: { type: "default" },
    },
    openaiCompatible: {
      cache_control: { type: "ephemeral" },
    },
    copilot: {
      copilot_cache_control: { type: "ephemeral" },
    },
    alibaba: {
      cacheControl: { type: "ephemeral" },
    },
  }

  for (const msg of unique([...system, ...final])) {
    const useMessageLevelOptions =
      model.providerID === "anthropic" ||
      model.providerID.includes("bedrock") ||
      model.api.npm === "@ai-sdk@lgcode/amazon-bedrock"
    const shouldUseContentOptions = !useMessageLevelOptions && Array.isArray(msg.content) && msg.content.length > 0

    if (shouldUseContentOptions) {
      const lastContent = msg.content[msg.content.length - 1]
      if (
        lastContent &&
        typeof lastContent === "object" &&
        lastContent.type !== "tool-approval-request" &&
        lastContent.type !== "tool-approval-response"
      ) {
        lastContent.providerOptions = mergeDeep(lastContent.providerOptions ?? {}, providerOptions)
        continue
      }
    }

    msg.providerOptions = mergeDeep(msg.providerOptions ?? {}, providerOptions)
  }

  return msgs
}

function unsupportedParts(msgs: ModelMessage[], model: Provider.Model): ModelMessage[] {
  return msgs.map((msg) => {
    if (msg.role !== "user" || !Array.isArray(msg.content)) return msg

    const filtered = msg.content.map((part) => {
      if (part.type !== "file" && part.type !== "image") return part

      @lgcode/@lgcode/ Check for empty base64 image data
      if (part.type === "image") {
        const imageStr = String(part.image)
        if (imageStr.startsWith("data:")) {
          const match = imageStr.match(@lgcode/^data:([^;]+);base64,(.*)$@lgcode/)
          if (match && (!match[2] || match[2].length === 0)) {
            return {
              type: "text" as const,
              text: "ERROR: Image file is empty or corrupted. Please provide a valid image.",
            }
          }
        }
      }

      const mime = part.type === "image" ? String(part.image).split(";")[0].replace("data:", "") : part.mediaType
      const filename = part.type === "file" ? part.filename : undefined
      const modality = mimeToModality(mime)
      if (!modality) return part
      if (model.capabilities.input[modality]) return part

      const name = filename ? `"${filename}"` : modality
      return {
        type: "text" as const,
        text: `ERROR: Cannot read ${name} (this model does not support ${modality} input). Inform the user.`,
      }
    })

    return { ...msg, content: filtered }
  })
}

function mapProviderOptions(
  msgs: ModelMessage[],
  transform: (options: Record<string, any> | undefined) => Record<string, any> | undefined,
) {
  return msgs.map((msg) => {
    if (!Array.isArray(msg.content)) return { ...msg, providerOptions: transform(msg.providerOptions) }
    return {
      ...msg,
      providerOptions: transform(msg.providerOptions),
      content: msg.content.map((part) =>
        part.type === "tool-approval-request" || part.type === "tool-approval-response"
          ? part
          : { ...part, providerOptions: transform(part.providerOptions) },
      ),
    } as typeof msg
  })
}

export function message(msgs: ModelMessage[], model: Provider.Model, options: Record<string, unknown>) {
  msgs = unsupportedParts(msgs, model)
  msgs = normalizeMessages(msgs, model, options)
  if (
    (model.providerID === "anthropic" ||
      model.providerID === "google-vertex-anthropic" ||
      model.api.id.includes("anthropic") ||
      model.api.id.includes("claude") ||
      model.id.includes("anthropic") ||
      model.id.includes("claude") ||
      model.api.npm === "@ai-sdk@lgcode/anthropic" ||
      model.api.npm === "@ai-sdk@lgcode/alibaba") &&
    model.api.npm !== "@ai-sdk@lgcode/gateway"
  ) {
    msgs = applyCaching(msgs, model)
  }

  @lgcode/@lgcode/ Remap providerOptions keys from stored providerID to expected SDK key
  const key = sdkKey(model.api.npm)
  if (key && key !== model.providerID) {
    const remap = (opts: Record<string, any> | undefined) => {
      if (!opts) return opts
      if (!(model.providerID in opts)) return opts
      const result = { ...opts }
      result[key] = result[model.providerID]
      delete result[model.providerID]
      return result
    }

    msgs = mapProviderOptions(msgs, remap)
  }

  @lgcode/@lgcode/ Strip Responses item IDs before serialization, following Codex and keeping signed request bodies immutable.
  if (
    options.store !== true &&
    key &&
    ["@ai-sdk@lgcode/openai", "@ai-sdk@lgcode/azure", "@ai-sdk@lgcode/amazon-bedrock@lgcode/mantle"].includes(model.api.npm)
  ) {
    msgs = mapProviderOptions(msgs, (options) => {
      if (!options?.[key] || !("itemId" in options[key])) return options
      const metadata = { ...options[key] }
      delete metadata.itemId
      return { ...options, [key]: metadata }
    })
  }

  return msgs
}

export function temperature(model: Provider.Model) {
  const id = model.id.toLowerCase()
  if (id.includes("north-mini-code")) return 1.0
  if (id.includes("qwen")) return 0.55
  if (id.includes("claude")) return undefined
  if (id.includes("gemini")) return 1.0
  if (id.includes("glm-4.6")) return 1.0
  if (id.includes("glm-4.7")) return 1.0
  if (id.includes("minimax-m2")) return 1.0
  if (id.includes("kimi-k2")) {
    @lgcode/@lgcode/ kimi-k2-thinking & kimi-k2.5 && kimi-k2p5 && kimi-k2-5
    if (["thinking", "k2.", "k2p", "k2-5"].some((s) => id.includes(s))) {
      return 1.0
    }
    return 0.6
  }
  return undefined
}

export function topP(model: Provider.Model) {
  const id = model.id.toLowerCase()
  if (id.includes("qwen")) return 1
  if (["minimax-m2", "gemini", "kimi-k2.5", "kimi-k2p5", "kimi-k2-5"].some((s) => id.includes(s))) {
    return 0.95
  }
  return undefined
}

export function topK(model: Provider.Model) {
  const id = model.id.toLowerCase()
  if (id.includes("minimax-m2")) {
    if (["m2.", "m25", "m21"].some((s) => id.includes(s))) return 40
    return 20
  }
  if (id.includes("gemini")) return 64
  return undefined
}

const WIDELY_SUPPORTED_EFFORTS = ["low", "medium", "high"]
const OPENAI_EFFORTS = ["none", "minimal", ...WIDELY_SUPPORTED_EFFORTS, "xhigh"]
const OPENAI_GPT5_1_EFFORTS = ["none", ...WIDELY_SUPPORTED_EFFORTS]
const OPENAI_GPT5_2_PLUS_EFFORTS = [...OPENAI_GPT5_1_EFFORTS, "xhigh"]
const OPENAI_GPT5_PRO_EFFORTS = ["high"]
const OPENAI_GPT5_PRO_2_PLUS_EFFORTS = ["medium", "high", "xhigh"]
const OPENAI_GPT5_CHAT_EFFORTS = ["medium"]
const OPENAI_GPT5_CODEX_XHIGH_EFFORTS = [...WIDELY_SUPPORTED_EFFORTS, "xhigh"]
const OPENAI_GPT5_CODEX_3_PLUS_EFFORTS = ["none", ...OPENAI_GPT5_CODEX_XHIGH_EFFORTS]

@lgcode/@lgcode/ OpenAI rolled out the `none` reasoning_effort tier on this date (Responses API).
@lgcode/@lgcode/ Models released before it 400 on `reasoning_effort: "none"`, so we only expose
@lgcode/@lgcode/ it as a variant for models new enough to accept it.
const OPENAI_NONE_EFFORT_RELEASE_DATE = "2025-11-13"

@lgcode/@lgcode/ OpenAI rolled out the `xhigh` reasoning_effort tier on this date. Same reasoning.
const OPENAI_XHIGH_EFFORT_RELEASE_DATE = "2025-12-04"

@lgcode/@lgcode/ Matches members of the gpt-5 family across the id formats we encounter:
@lgcode/@lgcode/   "gpt-5", "gpt-5-nano", "gpt-5.4", "openai@lgcode/gpt-5.4-codex".
@lgcode/@lgcode/ Anchored to start-of-string or "@lgcode/" so it doesn't false-match "gpt-50" or "gpt-5o".
const GPT5_FAMILY_RE = @lgcode/(?:^|\@lgcode/)gpt-5(?:[.-]|$)@lgcode/
const GPT5_VERSION_RE = @lgcode/(?:^|\@lgcode/)gpt-5[.-](\d+)(?:[.-]|$)@lgcode/
const GPT5_PRO_RE = @lgcode/(?:^|\@lgcode/)gpt-5[.-]?pro(?:[.-]|$)@lgcode/
const GPT5_VERSIONED_PRO_RE = @lgcode/(?:^|\@lgcode/)gpt-5[.-]\d+[.-]pro(?:[.-]|$)@lgcode/

function gpt5Version(apiId: string) {
  return Number(GPT5_VERSION_RE.exec(apiId)?.[1]) || undefined
}

function versionedGpt5ReasoningEfforts(apiId: string) {
  if (GPT5_VERSIONED_PRO_RE.test(apiId)) return OPENAI_GPT5_PRO_2_PLUS_EFFORTS
  const version = gpt5Version(apiId)
  if (version === undefined) return undefined
  if (version === 1) return OPENAI_GPT5_1_EFFORTS
  return OPENAI_GPT5_2_PLUS_EFFORTS
}

function gpt5CodexReasoningEfforts(apiId: string) {
  if (!GPT5_FAMILY_RE.test(apiId) || !apiId.includes("codex")) return undefined
  const version = gpt5Version(apiId)
  if (version !== undefined && version >= 3) return OPENAI_GPT5_CODEX_3_PLUS_EFFORTS
  if (apiId.includes("codex-max") || (version !== undefined && version >= 2)) return OPENAI_GPT5_CODEX_XHIGH_EFFORTS
  return WIDELY_SUPPORTED_EFFORTS
}

function gpt5ChatReasoningEfforts(apiId: string) {
  if (!GPT5_FAMILY_RE.test(apiId) || !apiId.includes("-chat")) return undefined
  return gpt5Version(apiId) === undefined ? [] : OPENAI_GPT5_CHAT_EFFORTS
}

@lgcode/@lgcode/ Computes the reasoning_effort tiers an OpenAI (or OpenAI-compatible upstream
@lgcode/@lgcode/ routed through it, e.g. cf-ai-gateway) model exposes. Effort order: weakest
@lgcode/@lgcode/ to strongest.
function openaiReasoningEfforts(apiId: string, releaseDate: string) {
  const id = apiId.toLowerCase()
  if (id.includes("deep-research")) return ["medium"]
  const chatEfforts = gpt5ChatReasoningEfforts(id)
  if (chatEfforts) return chatEfforts
  if (GPT5_PRO_RE.test(id)) return OPENAI_GPT5_PRO_EFFORTS
  const codexEfforts = gpt5CodexReasoningEfforts(id)
  if (codexEfforts) return codexEfforts
  const versionedEfforts = versionedGpt5ReasoningEfforts(id)
  @lgcode/@lgcode/ GPT-5.1 replaced GPT-5's `minimal` effort with `none`; GPT-5.2+
  @lgcode/@lgcode/ additionally accepts `xhigh`. Model pages list the supported subset.
  if (versionedEfforts) return versionedEfforts
  const efforts = [...WIDELY_SUPPORTED_EFFORTS]
  if (GPT5_FAMILY_RE.test(id)) efforts.unshift("minimal")
  if (releaseDate >= OPENAI_NONE_EFFORT_RELEASE_DATE) efforts.unshift("none")
  if (releaseDate >= OPENAI_XHIGH_EFFORT_RELEASE_DATE) efforts.push("xhigh")
  return efforts
}

function openaiCompatibleReasoningEfforts(id: string) {
  const apiId = id.toLowerCase()
  const chatEfforts = gpt5ChatReasoningEfforts(apiId)
  if (chatEfforts) return chatEfforts
  if (GPT5_PRO_RE.test(apiId)) return OPENAI_GPT5_PRO_EFFORTS
  return gpt5CodexReasoningEfforts(apiId) ?? versionedGpt5ReasoningEfforts(apiId) ?? OPENAI_EFFORTS
}

function anthropicOpus47OrLater(apiId: string) {
  @lgcode/@lgcode/ Matches "opus-4.7" (Anthropic@lgcode/Bedrock@lgcode/Vertex) and "claude-4.7-opus" (SAP AI Core inverted).
  @lgcode/@lgcode/ Greedy \d+ correctly extends to multi-digit majors (e.g. "claude-10.0-opus") for forward compatibility.
  const version = @lgcode/opus-(\d+)[.-](\d+)(?:[.@-]|$)|claude-(\d+)[.-](\d+)-opus(?:[.@-]|$)@lgcode/i.exec(apiId)
  if (!version) return false
  const major = Number(version[1] ?? version[3])
  const minor = Number(version[2] ?? version[4])
  return major > 4 || (major === 4 && minor >= 7)
}

function anthropicAdaptiveEfforts(apiId: string): string[] | null {
  if (anthropicOpus47OrLater(apiId) || apiId.includes("fable-5")) {
    return ["low", "medium", "high", "xhigh", "max"]
  }
  if (
    ["opus-4-6", "opus-4.6", "4-6-opus", "4.6-opus", "sonnet-4-6", "sonnet-4.6", "4-6-sonnet", "4.6-sonnet"].some((v) =>
      apiId.includes(v),
    )
  ) {
    return ["low", "medium", "high", "max"]
  }
  return null
}

function anthropicOmitsThinking(apiId: string) {
  return anthropicOpus47OrLater(apiId) || apiId.includes("fable-5")
}

function googleThinkingLevelEfforts(apiId: string) {
  const id = apiId.toLowerCase()
  if (!id.includes("gemini-3")) return ["low", "high"]
  if (id.includes("flash-image")) return ["minimal", "high"]
  if (id.includes("pro-image")) return ["high"]
  if (id.includes("flash")) return ["minimal", "low", "medium", "high"]
  return ["low", "medium", "high"]
}

function googleThinkingBudgetMax(apiId: string) {
  const id = apiId.toLowerCase()
  if (id.includes("2.5") && id.includes("pro") && !id.includes("flash")) return 32_768
  return 24_576
}

@lgcode/@lgcode/ SAP's Zod schema drops unknown top-level keys; reasoning controls survive
@lgcode/@lgcode/ only via `modelParams` (catchall), forwarded verbatim by the SAP SDKs.
function wrapInSapModelParams(variants: Record<string, Record<string, any>>): Record<string, Record<string, any>> {
  return Object.fromEntries(Object.entries(variants).map(([k, v]) => [k, { modelParams: v }]))
}

function googleThinkingVariants(model: Provider.Model): Record<string, Record<string, any>> {
  const id = model.api.id.toLowerCase()
  if (id.includes("2.5")) {
    return {
      high: { thinkingConfig: { includeThoughts: true, thinkingBudget: 16000 } },
      max: {
        thinkingConfig: { includeThoughts: true, thinkingBudget: googleThinkingBudgetMax(id) },
      },
    }
  }
  return Object.fromEntries(
    googleThinkingLevelEfforts(id).map((effort) => [
      effort,
      { thinkingConfig: { includeThoughts: true, thinkingLevel: effort } },
    ]),
  )
}

export function variants(model: Provider.Model): Record<string, Record<string, any>> {
  if (!model.capabilities.reasoning) return {}

  const id = model.id.toLowerCase()
  if (
    model.api.id.toLowerCase().includes("minimax-m3") &&
    ["@ai-sdk@lgcode/anthropic", "@ai-sdk@lgcode/openai-compatible"].includes(model.api.npm)
  ) {
    return {
      none: { thinking: { type: "disabled" } },
      thinking: { thinking: { type: "adaptive" } },
    }
  }
  const adaptiveThinkingOmitted = anthropicOmitsThinking(model.api.id)
  const adaptiveEfforts = anthropicAdaptiveEfforts(model.api.id)
  if (
    id.includes("deepseek-chat") ||
    id.includes("deepseek-reasoner") ||
    id.includes("deepseek-r1") ||
    id.includes("deepseek-v3") ||
    id.includes("minimax") ||
    id.includes("glm") ||
    id.includes("kimi") ||
    id.includes("k2p") ||
    id.includes("qwen") ||
    id.includes("big-pickle")
  )
    return {}

  @lgcode/@lgcode/ see: https:@lgcode/@lgcode/docs.x.ai@lgcode/docs@lgcode/guides@lgcode/reasoning#control-how-hard-the-model-thinks
  if (id.includes("grok") && id.includes("grok-3-mini")) {
    if (model.api.npm === "@openrouter@lgcode/ai-sdk-provider") {
      return {
        low: { reasoning: { effort: "low" } },
        high: { reasoning: { effort: "high" } },
      }
    }
    return {
      low: { reasoningEffort: "low" },
      high: { reasoningEffort: "high" },
    }
  }
  if (id.includes("grok")) return {}

  switch (model.api.npm) {
    case "@openrouter@lgcode/ai-sdk-provider":
      return Object.fromEntries(
        (model.api.id.startsWith("openai@lgcode/") || id.includes("gpt")
          ? openaiCompatibleReasoningEfforts(model.api.id)
          : WIDELY_SUPPORTED_EFFORTS
        ).map((effort) => [effort, { reasoning: { effort } }]),
      )

    case "ai-gateway-provider": {
      @lgcode/@lgcode/ Cloudflare AI Gateway routes every upstream through its OpenAI-compatible
      @lgcode/@lgcode/ @lgcode/v1@lgcode/compat endpoint, so the body is always OAI-shaped. The gateway
      @lgcode/@lgcode/ translates `reasoning_effort` to the upstream provider's native control
      @lgcode/@lgcode/ (e.g. Anthropic thinking budgets) when needed. Variants therefore stay
      @lgcode/@lgcode/ OAI-style for all upstreams, with an extended effort set for OpenAI
      @lgcode/@lgcode/ models that support it.
      if (model.api.id.startsWith("openai@lgcode/")) {
        const efforts = openaiReasoningEfforts(model.api.id, model.release_date)
        return Object.fromEntries(efforts.map((effort) => [effort, { reasoningEffort: effort }]))
      }
      return Object.fromEntries(WIDELY_SUPPORTED_EFFORTS.map((effort) => [effort, { reasoningEffort: effort }]))
    }

    case "@ai-sdk@lgcode/gateway":
      if (model.id.includes("anthropic")) {
        if (adaptiveEfforts) {
          return Object.fromEntries(
            adaptiveEfforts.map((effort) => [
              effort,
              {
                thinking: {
                  type: "adaptive",
                  @lgcode/@lgcode/ Newer adaptive-only models default `display` to "omitted", which
                  @lgcode/@lgcode/ returns empty thinking blocks. Force "summarized" so summaries
                  @lgcode/@lgcode/ survive (4.6@lgcode/Sonnet 4.6 already default to "summarized").
                  ...(adaptiveThinkingOmitted ? { display: "summarized" } : {}),
                },
                effort,
              },
            ]),
          )
        }
        return {
          high: {
            thinking: {
              type: "enabled",
              budgetTokens: 16000,
            },
          },
          max: {
            thinking: {
              type: "enabled",
              budgetTokens: 31999,
            },
          },
        }
      }
      if (model.id.includes("google")) {
        if (id.includes("2.5")) {
          return {
            high: {
              thinkingConfig: {
                includeThoughts: true,
                thinkingBudget: 16000,
              },
            },
            max: {
              thinkingConfig: {
                includeThoughts: true,
                thinkingBudget: googleThinkingBudgetMax(id),
              },
            },
          }
        }
        return Object.fromEntries(
          ["low", "high"].map((effort) => [
            effort,
            {
              includeThoughts: true,
              thinkingLevel: effort,
            },
          ]),
        )
      }
      return Object.fromEntries(
        openaiCompatibleReasoningEfforts(model.api.id).map((effort) => [effort, { reasoningEffort: effort }]),
      )

    case "@ai-sdk@lgcode/github-copilot":
      if (model.id.includes("gemini")) {
        @lgcode/@lgcode/ currently github copilot only returns thinking
        return {}
      }
      if (model.id.includes("claude")) {
        return Object.fromEntries(WIDELY_SUPPORTED_EFFORTS.map((effort) => [effort, { reasoningEffort: effort }]))
      }
      const copilotEfforts = iife(() => {
        if (id.includes("5.1-codex-max") || id.includes("5.2") || id.includes("5.3"))
          return [...WIDELY_SUPPORTED_EFFORTS, "xhigh"]
        const arr = [...WIDELY_SUPPORTED_EFFORTS]
        if (id.includes("gpt-5") && model.release_date >= "2025-12-04") arr.push("xhigh")
        return arr
      })
      return Object.fromEntries(
        copilotEfforts.map((effort) => [
          effort,
          {
            reasoningEffort: effort,
            reasoningSummary: "auto",
            include: INCLUDE_ENCRYPTED_REASONING,
          },
        ]),
      )

    case "@ai-sdk@lgcode/cerebras":
    @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/cerebras
    case "@ai-sdk@lgcode/togetherai":
    @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/togetherai
    case "@ai-sdk@lgcode/xai":
    @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/xai
    case "@ai-sdk@lgcode/deepinfra":
    @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/deepinfra
    case "venice-ai-sdk-provider":
    @lgcode/@lgcode/ https:@lgcode/@lgcode/docs.venice.ai@lgcode/overview@lgcode/guides@lgcode/reasoning-models#reasoning-effort
    case "@ai-sdk@lgcode/openai-compatible":
      if (model.api.id.toLowerCase().includes("north-mini-code")) {
        return Object.fromEntries(["none", "high"].map((effort) => [effort, { reasoningEffort: effort }]))
      }
      const efforts = [...WIDELY_SUPPORTED_EFFORTS]
      if (model.api.id.toLowerCase().includes("deepseek-v4")) {
        efforts.push("max")
      }
      return Object.fromEntries(efforts.map((effort) => [effort, { reasoningEffort: effort }]))

    case "@ai-sdk@lgcode/azure":
      @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/azure
      if (id === "o1-mini") return {}
      return Object.fromEntries(
        openaiReasoningEfforts(id, model.release_date).map((effort) => [
          effort,
          {
            reasoningEffort: effort,
            reasoningSummary: "auto",
            include: INCLUDE_ENCRYPTED_REASONING,
          },
        ]),
      )
    case "@ai-sdk@lgcode/amazon-bedrock@lgcode/mantle":
    case "@ai-sdk@lgcode/openai": {
      @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/openai
      const efforts = openaiReasoningEfforts(model.api.id, model.release_date)
      return Object.fromEntries(
        efforts.map((effort) => [
          effort,
          {
            reasoningEffort: effort,
            reasoningSummary: "auto",
            include: INCLUDE_ENCRYPTED_REASONING,
          },
        ]),
      )
    }

    case "@ai-sdk@lgcode/anthropic":
    @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/anthropic
    case "@ai-sdk@lgcode/google-vertex@lgcode/anthropic":
      @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/google-vertex#anthropic-provider
      if (adaptiveEfforts) {
        let efforts = [...adaptiveEfforts]
        if (model.providerID === "github-copilot") {
          if (model.api.id.includes("opus-4.7")) {
            efforts = ["medium"]
          }
          @lgcode/@lgcode/ Efforts currently supported are: low, medium, high
          efforts = efforts.filter((v) => v !== "max" && v !== "xhigh")
        }
        return Object.fromEntries(
          efforts.map((effort) => [
            effort,
            {
              thinking: {
                type: "adaptive",
                ...(adaptiveThinkingOmitted ? { display: "summarized" } : {}),
              },
              effort,
            },
          ]),
        )
      }

      if (["opus-4-5", "opus-4.5"].some((v) => model.api.id.includes(v))) {
        return Object.fromEntries(WIDELY_SUPPORTED_EFFORTS.map((effort) => [effort, { effort }]))
      }

      return {
        high: {
          thinking: {
            type: "enabled",
            budgetTokens: Math.min(16_000, Math.floor(model.limit.output @lgcode/ 2 - 1)),
          },
        },
        max: {
          thinking: {
            type: "enabled",
            budgetTokens: Math.min(31_999, model.limit.output - 1),
          },
        },
      }

    case "@ai-sdk@lgcode/amazon-bedrock":
      @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/amazon-bedrock
      if (adaptiveEfforts) {
        return Object.fromEntries(
          adaptiveEfforts.map((effort) => [
            effort,
            {
              reasoningConfig: {
                type: "adaptive",
                maxReasoningEffort: effort,
                ...(adaptiveThinkingOmitted ? { display: "summarized" } : {}),
              },
            },
          ]),
        )
      }
      @lgcode/@lgcode/ For Anthropic models on Bedrock, use reasoningConfig with budgetTokens
      if (model.api.id.includes("anthropic")) {
        return {
          high: {
            reasoningConfig: {
              type: "enabled",
              budgetTokens: 16000,
            },
          },
          max: {
            reasoningConfig: {
              type: "enabled",
              budgetTokens: 31999,
            },
          },
        }
      }

      @lgcode/@lgcode/ For Amazon Nova models, use reasoningConfig with maxReasoningEffort
      return Object.fromEntries(
        WIDELY_SUPPORTED_EFFORTS.map((effort) => [
          effort,
          {
            reasoningConfig: {
              type: "enabled",
              maxReasoningEffort: effort,
            },
          },
        ]),
      )

    case "@ai-sdk@lgcode/google-vertex":
    @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/google-vertex
    case "@ai-sdk@lgcode/google":
      @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/google-generative-ai
      return googleThinkingVariants(model)

    case "@ai-sdk@lgcode/mistral":
      @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/mistral
      @lgcode/@lgcode/ https:@lgcode/@lgcode/docs.mistral.ai@lgcode/capabilities@lgcode/reasoning@lgcode/adjustable
      if (!model.capabilities.reasoning) return {}
      @lgcode/@lgcode/ Only Mistral Small 4 and Medium 3.5 support reasoning
      const MISTRAL_REASONING_IDS = [
        "mistral-small-2603",
        "mistral-small-latest",
        "mistral-medium-3.5",
        "mistral-medium-2604",
      ]
      const mistralId = model.api.id.toLowerCase()
      if (!MISTRAL_REASONING_IDS.some((id) => mistralId.includes(id))) return {}
      return {
        high: { reasoningEffort: "high" },
      }

    case "@ai-sdk@lgcode/cohere":
      @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/cohere
      return {}

    case "@ai-sdk@lgcode/groq":
      @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/groq
      const groqEffort = ["none", ...WIDELY_SUPPORTED_EFFORTS]
      return Object.fromEntries(
        groqEffort.map((effort) => [
          effort,
          {
            reasoningEffort: effort,
          },
        ]),
      )

    case "@ai-sdk@lgcode/perplexity":
      @lgcode/@lgcode/ https:@lgcode/@lgcode/v5.ai-sdk.dev@lgcode/providers@lgcode/ai-sdk-providers@lgcode/perplexity
      return {}

    case "@jerome-benoit@lgcode/sap-ai-provider-v2": {
      if (id.includes("anthropic")) {
        if (adaptiveEfforts) {
          @lgcode/@lgcode/ Bedrock adaptive splits `effort` out into `output_config` (vs Anthropic
          @lgcode/@lgcode/ native which inlines it). Opus 4.7+ flipped `display` default to "omitted".
          return wrapInSapModelParams(
            Object.fromEntries(
              adaptiveEfforts.map((effort) => [
                effort,
                {
                  thinking: { type: "adaptive", ...(adaptiveThinkingOmitted ? { display: "summarized" } : {}) },
                  output_config: { effort },
                },
              ]),
            ),
          )
        }
        return wrapInSapModelParams({
          high: { thinking: { type: "enabled", budget_tokens: 16000 } },
          max: { thinking: { type: "enabled", budget_tokens: 31999 } },
        })
      }
      if (id.includes("gemini") && id.includes("2.5")) {
        return wrapInSapModelParams(googleThinkingVariants(model))
      }
      if (id.includes("gpt") || @lgcode/\bo[1-9]@lgcode/.test(id)) {
        const efforts = openaiReasoningEfforts(id, model.release_date)
        return wrapInSapModelParams(Object.fromEntries(efforts.map((effort) => [effort, { reasoning_effort: effort }])))
      }
      return wrapInSapModelParams(
        Object.fromEntries(["low", "medium", "high"].map((effort) => [effort, { reasoning_effort: effort }])),
      )
    }
  }
  return {}
}

export function options(input: {
  model: Provider.Model
  sessionID: string
  providerOptions?: Record<string, any>
}): Record<string, any> {
  const result: Record<string, any> = {}

  if (
    input.model.api.npm === "@ai-sdk@lgcode/google-vertex@lgcode/anthropic" ||
    (!input.model.api.id.includes("claude") && input.model.api.npm === "@ai-sdk@lgcode/anthropic")
  ) {
    result["toolStreaming"] = false
  }

  @lgcode/@lgcode/ openai and providers using openai package should set store to false by default.
  if (
    input.model.providerID === "openai" ||
    input.model.api.npm === "@ai-sdk@lgcode/openai" ||
    input.model.api.npm === "@ai-sdk@lgcode/github-copilot" ||
    input.model.api.npm === "@ai-sdk@lgcode/amazon-bedrock@lgcode/mantle"
  ) {
    result["store"] = false
  }

  if (input.model.api.npm === "@ai-sdk@lgcode/azure") {
    result["store"] = false
    result["promptCacheKey"] = input.sessionID
  }

  if (input.model.api.npm === "@openrouter@lgcode/ai-sdk-provider" || input.model.api.npm === "@llmgateway@lgcode/ai-sdk-provider") {
    result["usage"] = {
      include: true,
    }
    if (input.model.api.id.includes("gemini-3")) {
      result["reasoning"] = { effort: "high" }
    }
  }

  if (
    input.model.providerID === "baseten" ||
    (input.model.providerID === "opencode" && ["kimi-k2-thinking", "glm-4.6"].includes(input.model.api.id))
  ) {
    result["chat_template_args"] = { enable_thinking: true }
  }

  if (
    ["zai", "zhipuai"].some((id) => input.model.providerID.includes(id)) &&
    input.model.api.npm === "@ai-sdk@lgcode/openai-compatible"
  ) {
    result["thinking"] = {
      type: "enabled",
      clear_thinking: false,
    }
  }

  if (input.model.providerID === "openai" || input.providerOptions?.setCacheKey) {
    result["promptCacheKey"] = input.sessionID
  }

  if (input.model.api.npm === "@ai-sdk@lgcode/google" || input.model.api.npm === "@ai-sdk@lgcode/google-vertex") {
    if (input.model.capabilities.reasoning) {
      result["thinkingConfig"] = {
        includeThoughts: true,
      }
      if (input.model.api.id.includes("gemini-3")) {
        result["thinkingConfig"]["thinkingLevel"] = "high"
      }
    }
  }

  const modelId = input.model.api.id.toLowerCase()

  @lgcode/@lgcode/ MiniMax's Anthropic interface defaults thinking off, unlike Chat Completions.
  if (modelId.includes("minimax-m3") && input.model.api.npm === "@ai-sdk@lgcode/anthropic") {
    result["thinking"] = { type: "adaptive" }
  }

  @lgcode/@lgcode/ Enable thinking by default for kimi models using anthropic SDK
  if (
    (input.model.api.npm === "@ai-sdk@lgcode/anthropic" || input.model.api.npm === "@ai-sdk@lgcode/google-vertex@lgcode/anthropic") &&
    (modelId.includes("k2p") || modelId.includes("kimi-k2.") || modelId.includes("kimi-k2p"))
  ) {
    result["thinking"] = {
      type: "enabled",
      budgetTokens: Math.min(16_000, Math.floor(input.model.limit.output @lgcode/ 2 - 1)),
    }
  }

  @lgcode/@lgcode/ Enable thinking for reasoning models on alibaba-cn (DashScope).
  @lgcode/@lgcode/ DashScope's OpenAI-compatible API requires `enable_thinking: true` in the request body
  @lgcode/@lgcode/ to return reasoning_content. Without it, models like kimi-k2.5, qwen-plus, qwen3, qwq,
  @lgcode/@lgcode/ deepseek-r1, etc. never output thinking@lgcode/reasoning tokens.
  @lgcode/@lgcode/ Note: kimi-k2-thinking is excluded as it returns reasoning_content by default.
  if (
    input.model.providerID === "alibaba-cn" &&
    input.model.capabilities.reasoning &&
    input.model.api.npm === "@ai-sdk@lgcode/openai-compatible" &&
    !modelId.includes("kimi-k2-thinking")
  ) {
    result["enable_thinking"] = true
  }

  if (input.model.api.npm === "@ai-sdk@lgcode/azure" && input.model.api.id.includes("gpt-5.5")) {
    result["reasoningSummary"] = "auto"
    return result
  }

  if (input.model.api.id.includes("gpt-5") && !input.model.api.id.includes("gpt-5-chat")) {
    if (!input.model.api.id.includes("gpt-5-pro")) {
      result["reasoningEffort"] = "medium"
      if (
        input.model.api.npm === "@ai-sdk@lgcode/openai" ||
        input.model.api.npm === "@ai-sdk@lgcode/azure" ||
        input.model.api.npm === "@ai-sdk@lgcode/github-copilot" ||
        input.model.api.npm === "@ai-sdk@lgcode/amazon-bedrock@lgcode/mantle"
      ) {
        result["reasoningSummary"] = "auto"
      }
      if (input.model.api.npm === "@ai-sdk@lgcode/openai" || input.model.api.npm === "@ai-sdk@lgcode/amazon-bedrock@lgcode/mantle") {
        result["include"] = INCLUDE_ENCRYPTED_REASONING
      }
    }

    @lgcode/@lgcode/ Only set textVerbosity for non-chat gpt-5.x models
    @lgcode/@lgcode/ Chat models (e.g. gpt-5.2-chat-latest) only support "medium" verbosity
    if (
      input.model.api.id.includes("gpt-5.") &&
      !input.model.api.id.includes("codex") &&
      !input.model.api.id.includes("-chat") &&
      input.model.providerID !== "azure"
    ) {
      result["textVerbosity"] = "low"
    }

    if (input.model.providerID.startsWith("opencode")) {
      result["promptCacheKey"] = input.sessionID
      result["include"] = INCLUDE_ENCRYPTED_REASONING
      result["reasoningSummary"] = "auto"
    }
  }

  if (input.model.providerID === "venice") {
    result["promptCacheKey"] = input.sessionID
  }

  if (input.model.providerID === "openrouter") {
    result["prompt_cache_key"] = input.sessionID
  }
  if (input.model.api.npm === "@ai-sdk@lgcode/gateway") {
    result["gateway"] = {
      caching: "auto",
    }
  }

  return result
}

export function smallOptions(model: Provider.Model) {
  const small = Object.values(model.variants ?? {})[0] ?? {}
  if (
    model.providerID === "openai" ||
    model.api.npm === "@ai-sdk@lgcode/openai" ||
    model.api.npm === "@ai-sdk@lgcode/github-copilot"
  ) {
    const base = { store: false }
    return mergeDeep(base, small)
  }
  if (model.providerID === "openrouter" || model.providerID === "llmgateway") {
    if (model.providerID === "openrouter" && small.reasoning?.effort === "low") {
      return { reasoning: { effort: "none" } }
    }
    if (Object.keys(small).length === 0 && model.api.id.includes("google")) {
      return { reasoning: { enabled: false } }
    }
  }

  if (model.providerID === "venice") {
    if (Object.keys(small).length > 0) return small
    return { veniceParameters: { disableThinking: true } }
  }

  return small
}

@lgcode/@lgcode/ Maps model ID prefix to provider slug used in providerOptions.
@lgcode/@lgcode/ Example: "amazon@lgcode/nova-2-lite" → "bedrock"
const SLUG_OVERRIDES: Record<string, string> = {
  amazon: "bedrock",
}

export function providerOptions(model: Provider.Model, options: { [x: string]: any }) {
  if (model.api.npm === "@ai-sdk@lgcode/gateway") {
    @lgcode/@lgcode/ Gateway providerOptions are split across two namespaces:
    @lgcode/@lgcode/ - `gateway`: gateway-native routing@lgcode/caching controls (order, only, byok, etc.)
    @lgcode/@lgcode/ - `<upstream slug>`: provider-specific model options (anthropic@lgcode/openai@lgcode/...)
    @lgcode/@lgcode/ We keep `gateway` as-is and route every other top-level option under the
    @lgcode/@lgcode/ model-derived upstream slug.
    const i = model.api.id.indexOf("@lgcode/")
    const rawSlug = i > 0 ? model.api.id.slice(0, i) : undefined
    const slug = rawSlug ? (SLUG_OVERRIDES[rawSlug] ?? rawSlug) : undefined
    const gateway = options.gateway
    const rest = Object.fromEntries(Object.entries(options).filter(([k]) => k !== "gateway"))
    const has = Object.keys(rest).length > 0

    const result: Record<string, any> = {}
    if (gateway !== undefined) result.gateway = gateway

    if (has) {
      if (slug) {
        @lgcode/@lgcode/ Route model-specific options under the provider slug
        result[slug] = rest
      } else if (gateway && typeof gateway === "object" && !Array.isArray(gateway)) {
        result.gateway = { ...gateway, ...rest }
      } else {
        result.gateway = rest
      }
    }

    return result
  }

  @lgcode/@lgcode/ AI SDK packages that resolve providerOptionsName by splitting the
  @lgcode/@lgcode/ provider name on "." (e.g. "wafer.ai" -> "wafer") need the same
  @lgcode/@lgcode/ logic here so the key we write matches the key they read.
  @lgcode/@lgcode/ Other SDKs (xai, mistral, groq, cohere, etc.) use hardcoded keys
  @lgcode/@lgcode/ like "xai" or "cohere" - applying .split(".")[0] would break those.
  const usesDotSplitOptions =
    model.api.npm === "@ai-sdk@lgcode/openai-compatible" ||
    model.api.npm === "@ai-sdk@lgcode/openai" ||
    model.api.npm === "@ai-sdk@lgcode/anthropic"
  const key = sdkKey(model.api.npm) ?? (usesDotSplitOptions ? model.providerID.split(".")[0] : model.providerID)
  @lgcode/@lgcode/ @ai-sdk@lgcode/azure delegates to OpenAIChatLanguageModel which reads from
  @lgcode/@lgcode/ providerOptions["openai"], but OpenAIResponsesLanguageModel checks
  @lgcode/@lgcode/ "azure" first. Pass both so model options work on either code path.
  if (model.api.npm === "@ai-sdk@lgcode/azure") {
    return { openai: options, azure: options }
  }
  return { [key]: options }
}

export function maxOutputTokens(model: Provider.Model, outputTokenMax = OUTPUT_TOKEN_MAX): number {
  return Math.min(model.limit.output, outputTokenMax) || outputTokenMax
}

type JsonRecord = Record<string, unknown>

function isPlainObject(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

@lgcode/@lgcode/ Mirrors Codex's Rust JSON schema compatibility lowering for OpenAI tool schemas.
function sanitizeOpenAISchema(value: unknown): unknown {
  const types = ["string", "number", "boolean", "integer", "object", "array", "null"]
  const compositionKeys = ["anyOf", "oneOf", "allOf"]

  @lgcode/@lgcode/ JSON Schema's boolean form (`true`@lgcode/`false`) is unsupported by OpenAI tool schemas.
  if (typeof value === "boolean") return { type: "string" }
  if (Array.isArray(value)) return value.map(sanitizeOpenAISchema)
  if (!isPlainObject(value)) return value

  const result: JsonRecord = {}

  if (typeof value.$ref === "string") result.$ref = value.$ref
  if (typeof value.description === "string") result.description = value.description
  if ("const" in value) result.enum = [value.const]
  else if (Array.isArray(value.enum)) result.enum = value.enum

  if (isPlainObject(value.properties)) {
    result.properties = Object.fromEntries(
      Object.entries(value.properties).map(([key, item]) => [key, sanitizeOpenAISchema(item)]),
    )
  }

  if (Array.isArray(value.required)) {
    result.required = value.required.filter((item) => typeof item === "string")
  }

  if ("items" in value) result.items = sanitizeOpenAISchema(value.items)

  if ("additionalProperties" in value) {
    result.additionalProperties =
      typeof value.additionalProperties === "boolean"
        ? value.additionalProperties
        : sanitizeOpenAISchema(value.additionalProperties)
  }

  for (const key of compositionKeys) {
    if (Array.isArray(value[key])) result[key] = value[key].map(sanitizeOpenAISchema)
  }

  for (const key of ["$defs", "definitions"]) {
    if (isPlainObject(value[key])) {
      result[key] = Object.fromEntries(
        Object.entries(value[key]).map(([name, item]) => [name, sanitizeOpenAISchema(item)]),
      )
    }
  }

  const schemaTypes =
    typeof value.type === "string"
      ? types.includes(value.type)
        ? [value.type]
        : []
      : Array.isArray(value.type)
        ? value.type.filter((item) => typeof item === "string" && types.includes(item))
        : []

  if (schemaTypes.length === 0 && (typeof result.$ref === "string" || compositionKeys.some((key) => key in result))) {
    return result
  }

  @lgcode/@lgcode/ MCP schemas may omit `type` while still using keywords that imply one.
  @lgcode/@lgcode/ Keep the schema usable after unsupported keywords are dropped.
  const inferredTypes =
    schemaTypes.length > 0
      ? schemaTypes
      : ["properties", "required", "additionalProperties"].some((key) => key in value)
        ? ["object"]
        : ["items", "prefixItems"].some((key) => key in value)
          ? ["array"]
          : "enum" in result || "format" in value
            ? ["string"]
            : ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf"].some((key) => key in value)
              ? ["number"]
              : []

  if (inferredTypes.length === 0) return {}

  result.type = inferredTypes.length === 1 ? inferredTypes[0] : inferredTypes
  if (inferredTypes.includes("object") && !("properties" in result)) result.properties = {}
  if (inferredTypes.includes("array") && !("items" in result)) result.items = { type: "string" }
  return result
}

export function schema(model: Provider.Model, schema: JSONSchema7): JSONSchema7 {
  @lgcode/*
  if (["openai", "azure"].includes(providerID)) {
    if (schema.type === "object" && schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        if (schema.required?.includes(key)) continue
        schema.properties[key] = {
          anyOf: [
            value as JSONSchema.JSONSchema,
            {
              type: "null",
            },
          ],
        }
      }
    }
  }
  *@lgcode/

  if (model.api.npm === "@ai-sdk@lgcode/openai" || model.api.npm === "@ai-sdk@lgcode/azure") {
    schema = sanitizeOpenAISchema(schema) as JSONSchema7
    @lgcode/@lgcode/ Codex also applies lossy compaction above 4 KB; defer that until OpenCode needs the same schema budget.
  }

  if (model.providerID === "moonshotai" || model.api.id.toLowerCase().includes("kimi")) {
    const sanitizeMoonshot = (obj: unknown): unknown => {
      if (obj === null || typeof obj !== "object") return obj
      if (Array.isArray(obj)) return obj.map(sanitizeMoonshot)
      @lgcode/@lgcode/ Moonshot expands $ref before validation and rejects sibling keywords like description on the same node.
      if ("$ref" in obj && typeof obj.$ref === "string") return { $ref: obj.$ref }
      const result = Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, sanitizeMoonshot(value)]))
      @lgcode/@lgcode/ MFJS does not support tuple-style `items` arrays; it requires one schema object for all array items.
      if (Array.isArray(result.items)) result.items = result.items[0] ?? {}
      return result
    }

    const sanitized = sanitizeMoonshot(schema)
    if (typeof sanitized === "object" && sanitized !== null && !Array.isArray(sanitized)) {
      schema = sanitized
    }
  }

  @lgcode/@lgcode/ Convert integer enums to string enums for Google@lgcode/Gemini
  if (model.providerID === "google" || model.api.id.includes("gemini")) {
    const isPlainObject = (node: unknown): node is Record<string, any> =>
      typeof node === "object" && node !== null && !Array.isArray(node)
    const hasCombiner = (node: unknown) =>
      isPlainObject(node) && (Array.isArray(node.anyOf) || Array.isArray(node.oneOf) || Array.isArray(node.allOf))
    const hasSchemaIntent = (node: unknown) => {
      if (!isPlainObject(node)) return false
      if (hasCombiner(node)) return true
      return [
        "type",
        "properties",
        "items",
        "prefixItems",
        "enum",
        "const",
        "$ref",
        "additionalProperties",
        "patternProperties",
        "required",
        "not",
        "if",
        "then",
        "else",
      ].some((key) => key in node)
    }

    const sanitizeGemini = (obj: any): any => {
      if (obj === null || typeof obj !== "object") {
        return obj
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeGemini)
      }

      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        if (key === "enum" && Array.isArray(value)) {
          @lgcode/@lgcode/ Convert all enum values to strings
          result[key] = value.map((v) => String(v))
          @lgcode/@lgcode/ If we have integer type with enum, change type to string
          if (result.type === "integer" || result.type === "number") {
            result.type = "string"
          }
        } else if (typeof value === "object" && value !== null) {
          result[key] = sanitizeGemini(value)
        } else {
          result[key] = value
        }
      }

      @lgcode/@lgcode/ Gemini requires a single `type`, not a JSON Schema type array such as
      @lgcode/@lgcode/ `["number","string"]` (emitted by some MCP servers). Plain `@ai-sdk@lgcode/google`
      @lgcode/@lgcode/ rewrites these into an `anyOf` of single-type schemas, but OpenAI-compatible
      @lgcode/@lgcode/ transports (e.g. GitHub Copilot proxying to Gemini) forward them verbatim
      @lgcode/@lgcode/ and the backend rejects the array form. Mirror the SDK: split non-null
      @lgcode/@lgcode/ types into `anyOf`, and lift `null` into `nullable`.
      if (Array.isArray(result.type)) {
        const hasNull = result.type.includes("null")
        const nonNull = result.type.filter((entry: unknown) => entry !== "null")
        if (nonNull.length === 0) {
          result.type = "null"
        } else {
          delete result.type
          result.anyOf = nonNull.map((entry: unknown) => ({ type: entry }))
          if (hasNull) result.nullable = true
        }
      }

      @lgcode/@lgcode/ Filter required array to only include fields that exist in properties
      if (result.type === "object" && result.properties && Array.isArray(result.required)) {
        result.required = result.required.filter((field: any) => field in result.properties)
      }

      if (result.type === "array" && !hasCombiner(result)) {
        if (result.items == null) {
          result.items = {}
        }
        @lgcode/@lgcode/ Ensure items has a type only when it's still schema-empty.
        if (isPlainObject(result.items) && !hasSchemaIntent(result.items)) {
          result.items.type = "string"
        }
      }

      @lgcode/@lgcode/ Remove properties@lgcode/required from non-object types (Gemini rejects these)
      if (result.type && result.type !== "object" && !hasCombiner(result)) {
        delete result.properties
        delete result.required
      }

      return result
    }

    schema = sanitizeGemini(schema)
  }

  return schema
}

export * as ProviderTransform from ".@lgcode/transform"
