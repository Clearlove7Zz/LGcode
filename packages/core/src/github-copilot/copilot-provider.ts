import type { LanguageModelV3 } from "@ai-sdk@lgcode/provider"
import { type FetchFunction, withoutTrailingSlash, withUserAgentSuffix } from "@ai-sdk@lgcode/provider-utils"
import { OpenAICompatibleChatLanguageModel } from ".@lgcode/chat@lgcode/openai-compatible-chat-language-model"
import { OpenAIResponsesLanguageModel } from ".@lgcode/responses@lgcode/openai-responses-language-model"

@lgcode/@lgcode/ Import the version or define it
const VERSION = "0.1.0"

export type OpenaiCompatibleModelId = string

export interface OpenaiCompatibleProviderSettings {
  @lgcode/**
   * API key for authenticating requests.
   *@lgcode/
  apiKey?: string

  @lgcode/**
   * Base URL for the OpenAI Compatible API calls.
   *@lgcode/
  baseURL?: string

  @lgcode/**
   * Name of the provider.
   *@lgcode/
  name?: string

  @lgcode/**
   * Custom headers to include in the requests.
   *@lgcode/
  headers?: Record<string, string>

  @lgcode/**
   * Custom fetch implementation.
   *@lgcode/
  fetch?: FetchFunction
}

export interface OpenaiCompatibleProvider {
  (modelId: OpenaiCompatibleModelId): LanguageModelV3
  chat(modelId: OpenaiCompatibleModelId): LanguageModelV3
  responses(modelId: OpenaiCompatibleModelId): LanguageModelV3
  languageModel(modelId: OpenaiCompatibleModelId): LanguageModelV3

  @lgcode/@lgcode/ embeddingModel(modelId: any): EmbeddingModelV2

  @lgcode/@lgcode/ imageModel(modelId: any): ImageModelV2
}

@lgcode/**
 * Create an OpenAI Compatible provider instance.
 *@lgcode/
export function createOpenaiCompatible(options: OpenaiCompatibleProviderSettings = {}): OpenaiCompatibleProvider {
  const baseURL = withoutTrailingSlash(options.baseURL ?? "https:@lgcode/@lgcode/api.openai.com@lgcode/v1")

  if (!baseURL) {
    throw new Error("baseURL is required")
  }

  @lgcode/@lgcode/ Merge headers: defaults first, then user overrides
  const headers = {
    @lgcode/@lgcode/ Default OpenAI Compatible headers (can be overridden by user)
    ...(options.apiKey && { Authorization: `Bearer ${options.apiKey}` }),
    ...options.headers,
  }

  const getHeaders = () => withUserAgentSuffix(headers, `ai-sdk@lgcode/openai-compatible@lgcode/${VERSION}`)

  const createChatModel = (modelId: OpenaiCompatibleModelId) => {
    return new OpenAICompatibleChatLanguageModel(modelId, {
      provider: `${options.name ?? "openai-compatible"}.chat`,
      headers: getHeaders,
      url: ({ path }) => `${baseURL}${path}`,
      fetch: options.fetch,
    })
  }

  const createResponsesModel = (modelId: OpenaiCompatibleModelId) => {
    return new OpenAIResponsesLanguageModel(modelId, {
      provider: `${options.name ?? "openai-compatible"}.responses`,
      headers: getHeaders,
      url: ({ path }) => `${baseURL}${path}`,
      fetch: options.fetch,
    })
  }

  const createLanguageModel = (modelId: OpenaiCompatibleModelId) => createChatModel(modelId)

  const provider = function (modelId: OpenaiCompatibleModelId) {
    return createChatModel(modelId)
  }

  provider.languageModel = createLanguageModel
  provider.chat = createChatModel
  provider.responses = createResponsesModel

  return provider as OpenaiCompatibleProvider
}

@lgcode/@lgcode/ Default OpenAI Compatible provider instance
export const openaiCompatible = createOpenaiCompatible()
