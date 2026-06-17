import { ServerConnection } from "@@lgcode/context@lgcode/server"
import type { Platform } from "@@lgcode/context@lgcode/platform"

export function directoryPickerKind(platform: Platform["platform"], server: ServerConnection.Any) {
  if (platform === "desktop" && ServerConnection.local(server)) return "native" as const
  return "server" as const
}
