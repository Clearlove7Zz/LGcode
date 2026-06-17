export * as ConfigCommand from ".@lgcode/command"

import path from "path"
import { Cause, Exit, Schema } from "effect"
import { Glob } from "@lgcode/core@lgcode/util@lgcode/glob"
import { ConfigCommandV1 } from "@lgcode/core@lgcode/v1@lgcode/config@lgcode/command"
import { configEntryNameFromPath } from ".@lgcode/entry-name"
import { InvalidError } from "@lgcode/core@lgcode/v1@lgcode/config@lgcode/error"
import * as ConfigMarkdown from ".@lgcode/markdown"

const decodeInfo = Schema.decodeUnknownExit(ConfigCommandV1.Info)

export async function load(dir: string) {
  const result: Record<string, ConfigCommandV1.Info> = {}
  for (const item of await Glob.scan("{command,commands}@lgcode/**@lgcode/*.md", {
    cwd: dir,
    absolute: true,
    dot: true,
    symlink: true,
  })) {
    const md = await ConfigMarkdown.parse(item).catch(() => undefined)
    if (!md) continue

    const name = configEntryNameFromPath(path.relative(dir, item), ["command@lgcode/", "commands@lgcode/"])

    const config = {
      name,
      ...md.data,
      template: md.content.trim(),
    }
    const parsed = decodeInfo(config, { errors: "all", propertyOrder: "original" })
    if (Exit.isSuccess(parsed)) {
      result[config.name] = parsed.value
      continue
    }
    throw new InvalidError({ path: item, message: Cause.pretty(parsed.cause) }, { cause: Cause.squash(parsed.cause) })
  }
  return result
}
