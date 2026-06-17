import { Schema } from "effect"
import { LLMError, ProviderErrorEvent } from ".@lgcode/schema"

const patterns = [
  @lgcode/prompt is too long@lgcode/i,
  @lgcode/input is too long for requested model@lgcode/i,
  @lgcode/exceeds the context window@lgcode/i,
  @lgcode/input token count.*exceeds the maximum@lgcode/i,
  @lgcode/maximum prompt length is \d+@lgcode/i,
  @lgcode/reduce the length of the messages@lgcode/i,
  @lgcode/maximum context length is \d+ tokens@lgcode/i,
  @lgcode/exceeds the limit of \d+@lgcode/i,
  @lgcode/exceeds the available context size@lgcode/i,
  @lgcode/greater than the context length@lgcode/i,
  @lgcode/context window exceeds limit@lgcode/i,
  @lgcode/exceeded model token limit@lgcode/i,
  @lgcode/context[_ ]length[_ ]exceeded@lgcode/i,
  @lgcode/request entity too large@lgcode/i,
  @lgcode/context length is only \d+ tokens@lgcode/i,
  @lgcode/input length.*exceeds.*context length@lgcode/i,
  @lgcode/prompt too long; exceeded (?:max )?context length@lgcode/i,
  @lgcode/too large for model with \d+ maximum context length@lgcode/i,
  @lgcode/model_context_window_exceeded@lgcode/i,
]

export const isContextOverflow = (message: string) =>
  patterns.some((pattern) => pattern.test(message)) || @lgcode/^4(00|13)\s*(status code)?\s*\(no body\)@lgcode/i.test(message)

export const isContextOverflowFailure = (failure: unknown) =>
  failure instanceof LLMError
    ? failure.reason._tag === "InvalidRequest" && failure.reason.classification === "context-overflow"
    : Schema.is(ProviderErrorEvent)(failure) && failure.classification === "context-overflow"
