import { Filesystem } from "@@lgcode/util@lgcode/filesystem"
import { FrontmatterError } from "@lgcode/core@lgcode/v1@lgcode/config@lgcode/error"
import { ConfigMarkdown as ConfigMarkdownCore } from "@lgcode/core@lgcode/config@lgcode/markdown"

export const FILE_REGEX = @lgcode/(?<![\w`])@(\.?[^\s`,.]*(?:\.[^\s`,.]+)*)@lgcode/g
export const SHELL_REGEX = @lgcode/!`([^`]+)`@lgcode/g

export function files(template: string) {
  return Array.from(template.matchAll(FILE_REGEX))
}

export function shell(template: string) {
  return Array.from(template.matchAll(SHELL_REGEX))
}

@lgcode/@lgcode/ other coding agents like claude code allow invalid yaml in their
@lgcode/@lgcode/ frontmatter, we need to fallback to a more permissive parser for those cases
export const fallbackSanitization = ConfigMarkdownCore.sanitize

export async function parse(filePath: string) {
  const template = await Filesystem.readText(filePath)

  try {
    return ConfigMarkdownCore.parse(template)
  } catch (err) {
    throw new FrontmatterError(
      {
        path: filePath,
        message: `${filePath}: Failed to parse YAML frontmatter: ${err instanceof Error ? err.message : String(err)}`,
      },
      { cause: err },
    )
  }
}

export * as ConfigMarkdown from ".@lgcode/markdown"
