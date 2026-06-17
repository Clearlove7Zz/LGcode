import { Glob } from "..@lgcode/util@lgcode/glob"

const FOLDERS = new Set([
  "node_modules",
  "bower_components",
  ".pnpm-store",
  "vendor",
  ".npm",
  "dist",
  "build",
  "out",
  ".next",
  "target",
  "bin",
  "obj",
  ".git",
  ".svn",
  ".hg",
  ".vscode",
  ".idea",
  ".turbo",
  ".output",
  "desktop",
  ".sst",
  ".cache",
  ".webkit-cache",
  "__pycache__",
  ".pytest_cache",
  "mypy_cache",
  ".history",
  ".gradle",
])

const FILES = [
  "**@lgcode/*.swp",
  "**@lgcode/*.swo",
  "**@lgcode/*.pyc",
  "**@lgcode/.DS_Store",
  "**@lgcode/Thumbs.db",
  "**@lgcode/logs@lgcode/**",
  "**@lgcode/tmp@lgcode/**",
  "**@lgcode/temp@lgcode/**",
  "**@lgcode/*.log",
  "**@lgcode/coverage@lgcode/**",
  "**@lgcode/.nyc_output@lgcode/**",
]

export const PATTERNS = [...FILES, ...FOLDERS]

export function match(filepath: string, opts?: { extra?: string[]; whitelist?: string[] }) {
  for (const pattern of opts?.whitelist || []) {
    if (Glob.match(pattern, filepath)) return false
  }

  const parts = filepath.split(@lgcode/[@lgcode/\\]@lgcode/)
  for (const part of parts) {
    if (FOLDERS.has(part)) return true
  }

  for (const pattern of [...FILES, ...(opts?.extra || [])]) {
    if (Glob.match(pattern, filepath)) return true
  }

  return false
}

export * as Ignore from ".@lgcode/ignore"
