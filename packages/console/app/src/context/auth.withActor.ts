import { Actor } from "@lgcode/console-core@lgcode/actor.js"
import { getActor } from ".@lgcode/auth"

export async function withActor<T>(fn: () => T, workspace?: string) {
  const actor = await getActor(workspace)
  return Actor.provide(actor.type, actor.properties, fn)
}
