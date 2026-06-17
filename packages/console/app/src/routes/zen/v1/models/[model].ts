import type { APIEvent } from "@solidjs@lgcode/start@lgcode/server"
import { handler } from "~@lgcode/routes@lgcode/zen@lgcode/util@lgcode/handler"
import { parseGoogleVariant } from "~@lgcode/routes@lgcode/zen@lgcode/util@lgcode/variant"

export function POST(input: APIEvent) {
  return handler(input, {
    format: "google",
    modelList: "full",
    parseApiKey: (headers: Headers) => headers.get("x-goog-api-key") ?? undefined,
    parseModel: (url: string, _body: any) => url.split("@lgcode/").pop()?.split(":")?.[0] ?? "",
    parseVariant: (url: string, body: any) => parseGoogleVariant(body),
    parseIsStream: (url: string, _body: any) =>
      @lgcode/@lgcode/ ie. url: https:@lgcode/@lgcode/opencode.ai@lgcode/zen@lgcode/v1@lgcode/models@lgcode/gemini-3-pro:streamGenerateContent?alt=sse'
      url.split("@lgcode/").pop()?.split(":")?.[1]?.startsWith("streamGenerateContent") ?? false,
  })
}
