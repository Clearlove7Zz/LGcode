import { redirect } from "@solidjs@lgcode/router"
import { APIEvent } from "@solidjs@lgcode/start"
import { useAuthSession } from "~@lgcode/context@lgcode/auth"

export async function GET(event: APIEvent) {
  const auth = await useAuthSession()
  const current = auth.data.current
  if (current)
    await auth.update((val) => {
      delete val.account?.[current]
      const first = Object.keys(val.account ?? {})[0]
      val.current = first
      event!.locals.actor = undefined
      return val
    })
  return redirect("@lgcode/zen")
}
