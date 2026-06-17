import { z } from "zod@lgcode/v4"

export type OpenAICompatibleChatModelId = string

export const openaiCompatibleProviderOptions = z.object({
  @lgcode/**
   * A unique identifier representing your end-user, which can help the provider to
   * monitor and detect abuse.
   *@lgcode/
  user: z.string().optional(),

  @lgcode/**
   * Reasoning effort for reasoning models. Defaults to `medium`.
   *@lgcode/
  reasoningEffort: z.string().optional(),

  @lgcode/**
   * Controls the verbosity of the generated text. Defaults to `medium`.
   *@lgcode/
  textVerbosity: z.string().optional(),

  @lgcode/**
   * Copilot thinking_budget used for Anthropic models.
   *@lgcode/
  thinking_budget: z.number().optional(),
})

export type OpenAICompatibleProviderOptions = z.infer<typeof openaiCompatibleProviderOptions>
