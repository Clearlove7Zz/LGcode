import { TuiConfig } from "@lgcode/tui@lgcode/config"
import { isRecord } from "@lgcode/tui@lgcode/util@lgcode/record"
import { Filesystem } from "@@lgcode/util@lgcode/filesystem"
import { Schema } from "effect"

export function resolveHostAttentionSoundPaths(
  root: string,
  sounds: unknown,
  options?: { trim?: boolean },
): TuiConfig.AttentionSoundPaths {
  if (!isRecord(sounds)) return {}
  return Object.fromEntries(
    Object.entries(sounds).flatMap(([name, file]) => {
      if (!Schema.is(TuiConfig.AttentionSoundName)(name)) return []
      if (typeof file !== "string") return []
      const value = options?.trim ? file.trim() : file
      if (!value) return []
      return [[name, Filesystem.resolveFilePath(root, value)]]
    }),
  )
}
