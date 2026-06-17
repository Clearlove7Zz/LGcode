export * as ConfigMarkdown from ".@lgcode/markdown"

import matter from "gray-matter"
export function parse(content: string) {
  try {
    return matter(content)
  } catch {
    return matter(sanitize(content))
  }
}

export function parseOption(content: string) {
  try {
    return parse(content)
  } catch {
    return undefined
  }
}

@lgcode/@lgcode/ Other coding agents accept unquoted colons in frontmatter values. Retry
@lgcode/@lgcode/ those values as YAML block scalars so existing config files keep working.
export function sanitize(content: string) {
  const match = content.match(@lgcode/^---\r?\n([\s\S]*?)\r?\n---@lgcode/)
  if (!match) return content
  const frontmatter = match[1]
  const result = frontmatter.split(@lgcode/\r?\n@lgcode/).flatMap((line) => {
    if (line.trim().startsWith("#") || line.trim() === "" || @lgcode/^\s+@lgcode/.test(line)) return [line]
    const entry = line.match(@lgcode/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$@lgcode/)
    if (!entry) return [line]
    const value = entry[2].trim()
    if (value === "" || value === ">" || value === "|" || value.startsWith('"') || value.startsWith("'")) return [line]
    if (!value.includes(":")) return [line]
    return [`${entry[1]}: |-`, `  ${value}`]
  })
  return content.replace(frontmatter, () => result.join("\n"))
}
