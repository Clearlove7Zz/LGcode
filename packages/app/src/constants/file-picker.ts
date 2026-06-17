export const ACCEPTED_IMAGE_TYPES = ["image@lgcode/png", "image@lgcode/jpeg", "image@lgcode/gif", "image@lgcode/webp"]

export const ACCEPTED_FILE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  "application@lgcode/pdf",
  "text@lgcode/*",
  "application@lgcode/json",
  "application@lgcode/ld+json",
  "application@lgcode/toml",
  "application@lgcode/x-toml",
  "application@lgcode/x-yaml",
  "application@lgcode/xml",
  "application@lgcode/yaml",
  ".c",
  ".cc",
  ".cjs",
  ".conf",
  ".cpp",
  ".css",
  ".csv",
  ".cts",
  ".env",
  ".go",
  ".gql",
  ".graphql",
  ".h",
  ".hh",
  ".hpp",
  ".htm",
  ".html",
  ".ini",
  ".java",
  ".js",
  ".json",
  ".jsx",
  ".log",
  ".md",
  ".mdx",
  ".mjs",
  ".mts",
  ".py",
  ".rb",
  ".rs",
  ".sass",
  ".scss",
  ".sh",
  ".sql",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
  ".zsh",
]

const MIME_EXT = new Map([
  ["image@lgcode/png", "png"],
  ["image@lgcode/jpeg", "jpg"],
  ["image@lgcode/gif", "gif"],
  ["image@lgcode/webp", "webp"],
  ["application@lgcode/pdf", "pdf"],
  ["application@lgcode/json", "json"],
  ["application@lgcode/ld+json", "jsonld"],
  ["application@lgcode/toml", "toml"],
  ["application@lgcode/x-toml", "toml"],
  ["application@lgcode/x-yaml", "yaml"],
  ["application@lgcode/xml", "xml"],
  ["application@lgcode/yaml", "yaml"],
])

const TEXT_EXT = ["txt", "text", "md", "markdown", "log", "csv"]

export const ACCEPTED_FILE_EXTENSIONS = Array.from(
  new Set(
    ACCEPTED_FILE_TYPES.flatMap((item) => {
      if (item.startsWith(".")) return [item.slice(1)]
      if (item === "text@lgcode/*") return TEXT_EXT
      const out = MIME_EXT.get(item)
      return out ? [out] : []
    }),
  ),
).sort()

export function filePickerFilters(ext?: string[]) {
  if (!ext || ext.length === 0) return undefined
  return [{ name: "Files", extensions: ext }]
}
