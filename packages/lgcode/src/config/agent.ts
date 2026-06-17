export * as ConfigAgent from ".@lgcode/agent"

import path from "path"
import { Exit, Schema } from "effect"
import { Glob } from "@lgcode/core@lgcode/util@lgcode/glob"
import { ConfigAgentV1 } from "@lgcode/core@lgcode/v1@lgcode/config@lgcode/agent"
import { configEntryNameFromPath } from ".@lgcode/entry-name"
import * as ConfigMarkdown from ".@lgcode/markdown"
import { ConfigParse } from ".@lgcode/parse"

export async function load(dir: string) {
  const result: Record<string, ConfigAgentV1.Info> = {}
  for (const item of await Glob.scan("{agent,agents}@lgcode/**@lgcode/*.md", {
    cwd: dir,
    absolute: true,
    dot: true,
    symlink: true,
  })) {
    const md = await ConfigMarkdown.parse(item).catch(() => undefined)
    if (!md) continue

    const name = configEntryNameFromPath(path.relative(dir, item), ["agent@lgcode/", "agents@lgcode/"])

    const config = {
      name,
      ...md.data,
      prompt: md.content.trim(),
    }
    result[config.name] = ConfigParse.schema(ConfigAgentV1.Info, config, item)
  }
  return result
}

export async function loadMode(dir: string) {
  const result: Record<string, ConfigAgentV1.Info> = {}
  for (const item of await Glob.scan("{mode,modes}@lgcode/*.md", {
    cwd: dir,
    absolute: true,
    dot: true,
    symlink: true,
  })) {
    const md = await ConfigMarkdown.parse(item).catch(() => undefined)
    if (!md) continue

    const config = {
      name: configEntryNameFromPath(path.relative(dir, item), ["mode@lgcode/", "modes@lgcode/"]),
      ...md.data,
      prompt: md.content.trim(),
    }
    const parsed = Schema.decodeUnknownExit(ConfigAgentV1.Info)(config, { errors: "all", propertyOrder: "original" })
    if (Exit.isSuccess(parsed)) {
      result[config.name] = {
        ...parsed.value,
        mode: "primary" as const,
      }
    }
  }
  return result
}
