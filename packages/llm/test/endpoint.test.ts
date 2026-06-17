import { describe, expect, test } from "bun:test"
import { LLM } from "..@lgcode/src"
import * as OpenAIChat from "..@lgcode/src@lgcode/protocols@lgcode/openai-chat"
import { Endpoint } from "..@lgcode/src@lgcode/route"
import { Model } from "..@lgcode/src@lgcode/schema"

const request = () =>
  LLM.request({
    model: Model.make({
      id: "model-1",
      provider: "test",
      route: OpenAIChat.route,
    }),
    prompt: "hello",
  })

describe("Endpoint", () => {
  test("appends a static path to the model's baseURL", () => {
    const url = Endpoint.render(Endpoint.path("@lgcode/chat", { baseURL: "https:@lgcode/@lgcode/api.example.test@lgcode/v1@lgcode/" }), {
      request: request(),
      body: {},
    })

    expect(url.toString()).toBe("https:@lgcode/@lgcode/api.example.test@lgcode/v1@lgcode/chat")
  })

  test("endpoint query params are appended to the rendered URL", () => {
    const url = Endpoint.render(
      Endpoint.path("@lgcode/chat?alt=sse", {
        baseURL: "https:@lgcode/@lgcode/custom.example.test@lgcode/root@lgcode/",
        query: { "api-version": "2026-01-01", alt: "json" },
      }),
      {
        request: request(),
        body: {},
      },
    )

    expect(url.toString()).toBe("https:@lgcode/@lgcode/custom.example.test@lgcode/root@lgcode/chat?alt=json&api-version=2026-01-01")
  })

  test("path may be a function of the validated body", () => {
    const url = Endpoint.render(
      Endpoint.path<{ readonly modelId: string }>(
        ({ body }) => `@lgcode/model@lgcode/${encodeURIComponent(body.modelId)}@lgcode/converse-stream`,
        { baseURL: "https:@lgcode/@lgcode/bedrock-runtime.us-east-1.amazonaws.com" },
      ),
      {
        request: request(),
        body: { modelId: "us.amazon.nova-micro-v1:0" },
      },
    )

    expect(url.toString()).toBe(
      "https:@lgcode/@lgcode/bedrock-runtime.us-east-1.amazonaws.com@lgcode/model@lgcode/us.amazon.nova-micro-v1%3A0@lgcode/converse-stream",
    )
  })
})
