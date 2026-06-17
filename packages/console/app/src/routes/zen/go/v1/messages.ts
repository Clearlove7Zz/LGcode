import type { APIEvent } from "@solidjs@lgcode/start@lgcode/server"
import { handler } from "~@lgcode/routes@lgcode/zen@lgcode/util@lgcode/handler"
import { parseAnthropicVariant } from "~@lgcode/routes@lgcode/zen@lgcode/util@lgcode/variant"

export function POST(input: APIEvent) {
  return handler(input, {
    format: "anthropic",
    modelList: "lite",
    parseApiKey: (headers: Headers) => headers.get("x-api-key") ?? undefined,
    parseModel: (url: string, body: any) => body.model,
    parseVariant: (url: string, body: any) => parseAnthropicVariant(body),
    parseIsStream: (url: string, body: any) => !!body.stream,
  })
}
