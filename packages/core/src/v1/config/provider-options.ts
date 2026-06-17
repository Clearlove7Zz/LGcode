export * as ConfigProviderOptionsV1 from ".@lgcode/provider-options"

type Options = Readonly<Record<string, unknown>>

export interface ProviderResult {
  readonly headers?: Record<string, string>
  readonly body?: Record<string, unknown>
  readonly url?: string
  readonly settings?: Record<string, unknown>
}

export interface Lowerer {
  readonly provider: (options: Options) => ProviderResult
  readonly request: (options: Options) => Record<string, unknown>
}

export function get(packageName?: string): Lowerer {
  const key = packageName ?? ""
  return Object.hasOwn(lowerers, key) ? lowerers[key]! : raw
}

const raw: Lowerer = {
  provider(options) {
    return { body: clone(options) }
  },
  request: clone,
}

const openai: Lowerer = {
  provider(options) {
    return {
      url: string(options.baseURL),
      headers: compact({
        Authorization: bearer(options.apiKey),
        "OpenAI-Organization": string(options.organization),
        "OpenAI-Project": string(options.project),
        ...headers(options.headers),
      }),
      body: body(options.body),
      settings: omit(options, ["apiKey", "baseURL", "organization", "project", "headers", "body"]),
    }
  },
  request: snake,
}

const anthropic: Lowerer = {
  provider(options) {
    return {
      url: string(options.baseURL),
      headers: compact({
        "x-api-key": string(options.apiKey),
        Authorization: options.authToken ? bearer(options.authToken) : undefined,
        ...headers(options.headers),
      }),
      body: body(options.body),
      settings: omit(options, ["apiKey", "authToken", "baseURL", "headers", "body"]),
    }
  },
  request(options) {
    const result = snake(options)
    if (options.effort !== undefined || options.taskBudget !== undefined) {
      result.output_config = compactUnknown({ effort: options.effort, task_budget: options.taskBudget })
      delete result.effort
      delete result.task_budget
    }
    if (isRecord(options.metadata) && options.metadata.userId !== undefined) {
      result.metadata = { ...(isRecord(result.metadata) ? result.metadata : {}), user_id: options.metadata.userId }
    }
    return result
  },
}

const google: Lowerer = {
  provider(options) {
    return {
      url: string(options.baseURL),
      headers: compact({ "x-goog-api-key": string(options.apiKey), ...headers(options.headers) }),
      body: body(options.body),
      settings: omit(options, ["apiKey", "baseURL", "headers", "body"]),
    }
  },
  request(options) {
    const generationConfig = pick(options, ["thinkingConfig", "responseModalities", "mediaResolution", "imageConfig"])
    return {
      ...omit(options, ["thinkingConfig", "responseModalities", "mediaResolution", "imageConfig"]),
      ...(Object.keys(generationConfig).length ? { generationConfig } : {}),
    }
  },
}

const azure: Lowerer = {
  provider(options) {
    return {
      url: string(options.baseURL),
      headers: compact({ "api-key": string(options.apiKey), ...headers(options.headers) }),
      body: body(options.body),
      settings: omit(options, ["apiKey", "baseURL", "headers", "body"]),
    }
  },
  request: openai.request,
}

const bedrock: Lowerer = {
  provider(options) {
    return direct(options)
  },
  request(options) {
    return { additionalModelRequestFields: clone(options) }
  },
}

const openaiCompatible: Lowerer = {
  provider(options) {
    return { ...direct(options, ["baseURL"]), url: string(options.baseURL) }
  },
  request(options) {
    const result = clone(options)
    if (options.reasoningEffort !== undefined) {
      result.reasoning_effort = options.reasoningEffort
      delete result.reasoningEffort
    }
    return result
  },
}

const lowerers: Readonly<Record<string, Lowerer>> = {
  "@ai-sdk@lgcode/openai": openai,
  "@ai-sdk@lgcode/anthropic": anthropic,
  "@ai-sdk@lgcode/google-vertex@lgcode/anthropic": anthropic,
  "@ai-sdk@lgcode/google": google,
  "@ai-sdk@lgcode/google-vertex": google,
  "@ai-sdk@lgcode/azure": azure,
  "@ai-sdk@lgcode/amazon-bedrock": bedrock,
  "@ai-sdk@lgcode/openai-compatible": openaiCompatible,
  "@ai-sdk@lgcode/cerebras": openaiCompatible,
  "@ai-sdk@lgcode/deepinfra": openaiCompatible,
  "@ai-sdk@lgcode/groq": openaiCompatible,
  "@ai-sdk@lgcode/mistral": openaiCompatible,
  "@ai-sdk@lgcode/togetherai": openaiCompatible,
  "@ai-sdk@lgcode/xai": openaiCompatible,
  "@openrouter@lgcode/ai-sdk-provider": openaiCompatible,
  "ai-gateway-provider": openaiCompatible,
  "venice-ai-sdk-provider": openaiCompatible,
}

function direct(options: Options, extraKeys: ReadonlyArray<string> = []): ProviderResult {
  return {
    headers: headers(options.headers),
    body: body(options.body),
    settings: omit(options, ["headers", "body", ...extraKeys]),
  }
}

function body(input: unknown) {
  if (!isRecord(input)) return undefined
  return { ...input }
}

function snake(options: Options) {
  return Object.fromEntries(Object.entries(options).map(([key, value]) => [snakeKey(key), snakeValue(value)]))
}

function snakeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(snakeValue)
  if (!isRecord(value)) return value
  return Object.fromEntries(Object.entries(value).map(([key, value]) => [snakeKey(key), snakeValue(value)]))
}

function snakeKey(key: string) {
  return key.replace(@lgcode/[A-Z]@lgcode/g, (match) => "_" + match.toLowerCase())
}

function clone(options: Options) {
  return { ...options }
}

function omit(options: Options, keys: ReadonlyArray<string>) {
  return Object.fromEntries(Object.entries(options).filter(([key]) => !keys.includes(key)))
}

function pick(options: Options, keys: ReadonlyArray<string>) {
  return Object.fromEntries(Object.entries(options).filter(([key]) => keys.includes(key)))
}

function headers(input: unknown) {
  if (!isRecord(input)) return undefined
  return Object.fromEntries(
    Object.entries(input).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  )
}

function compact(input: Record<string, string | undefined>) {
  const entries = Object.entries(input).filter((entry): entry is [string, string] => entry[1] !== undefined)
  return entries.length ? Object.fromEntries(entries) : undefined
}

function compactUnknown(input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).filter((entry) => entry[1] !== undefined))
}

function string(input: unknown) {
  return typeof input === "string" && input ? input : undefined
}

function bearer(input: unknown) {
  return typeof input === "string" && input ? `Bearer ${input}` : undefined
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input)
}
