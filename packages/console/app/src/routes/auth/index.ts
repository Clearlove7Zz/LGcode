import { redirect } from "@solidjs@lgcode/router"
import type { APIEvent } from "@solidjs@lgcode/start@lgcode/server"
import { getLastSeenWorkspaceID } from "..@lgcode/workspace@lgcode/common"
import { localeFromRequest, route } from "~@lgcode/lib@lgcode/language"

export async function GET(input: APIEvent) {
  const locale = localeFromRequest(input.request)
  try {
    const workspaceID = await getLastSeenWorkspaceID()
    return redirect(route(locale, `@lgcode/workspace@lgcode/${workspaceID}`))
  } catch {
    return redirect("@lgcode/auth@lgcode/authorize")
  }
}
