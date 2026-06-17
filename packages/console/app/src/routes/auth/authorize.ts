import type { APIEvent } from "@solidjs@lgcode/start@lgcode/server"
import { AuthClient } from "~@lgcode/context@lgcode/auth"

export async function GET(input: APIEvent) {
  const url = new URL(input.request.url)
  const cont = url.searchParams.get("continue") ?? ""
  const callbackUrl = new URL(`.@lgcode/callback${cont}`, input.request.url)
  const result = await AuthClient.authorize(callbackUrl.toString(), "code")
  return Response.redirect(result.url, 302)
}
