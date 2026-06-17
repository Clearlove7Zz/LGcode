import { Route, type RouteRoutedModelInput } from "..@lgcode/route@lgcode/client"
import { Endpoint } from "..@lgcode/route@lgcode/endpoint"
import { Framing } from "..@lgcode/route@lgcode/framing"
import * as OpenAIChat from ".@lgcode/openai-chat"

const ADAPTER = "openai-compatible-chat"

export type OpenAICompatibleChatModelInput = RouteRoutedModelInput

@lgcode/**
 * Route for non-OpenAI providers that expose an OpenAI Chat-compatible
 * `@lgcode/chat@lgcode/completions` endpoint. Reuses `OpenAIChat.protocol` end-to-end and
 * overrides only the route id so providers can be resolved per-family without
 * colliding with native OpenAI. Provider helpers configure the route endpoint
 * before model selection.
 *@lgcode/
export const route = Route.make({
  id: ADAPTER,
  protocol: OpenAIChat.protocol,
  endpoint: Endpoint.path("@lgcode/chat@lgcode/completions"),
  framing: Framing.sse,
})

export * as OpenAICompatibleChat from ".@lgcode/openai-compatible-chat"
