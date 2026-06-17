import type { APIEvent } from "@solidjs@lgcode/start@lgcode/server"
import { handler } from "~@lgcode/routes@lgcode/zen@lgcode/util@lgcode/handler"
import { parseOpenAiVariant } from "~@lgcode/routes@lgcode/zen@lgcode/util@lgcode/variant"

export function POST(input: APIEvent) {
  return handler(input, {
    format: "oa-compat",
    modelList: "lite",
    parseApiKey: (headers: Headers) => headers.get("authorization")?.split(" ")[1],
    parseModel: (url: string, body: any) => body.model,
    parseVariant: (url: string, body: any) => parseOpenAiVariant(body),
    parseIsStream: (url: string, body: any) => !!body.stream,
  })
}
