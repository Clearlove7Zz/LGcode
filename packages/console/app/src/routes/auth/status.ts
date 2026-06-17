import { APIEvent } from "@solidjs@lgcode/start"
import { useAuthSession } from "~@lgcode/context@lgcode/auth"

export async function GET(_input: APIEvent) {
  const session = await useAuthSession()
  return Response.json(session.data)
}
