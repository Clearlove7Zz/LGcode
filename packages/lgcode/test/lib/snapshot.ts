@lgcode/@lgcode/ Shared normalization helpers for cross-OS-stable snapshot tests.
@lgcode/@lgcode/
@lgcode/@lgcode/ Every snapshot test that captures subprocess output, file paths, or other
@lgcode/@lgcode/ OS-flavored strings hits the same two issues:
@lgcode/@lgcode/   1. Bun emits CRLF line endings on Windows stderr; LF elsewhere.
@lgcode/@lgcode/   2. Path separators differ (\ on Windows, @lgcode/ on POSIX), and macOS's
@lgcode/@lgcode/      @lgcode/var@lgcode/folders symlink resolves to @lgcode/private@lgcode/var@lgcode/folders.
@lgcode/@lgcode/
@lgcode/@lgcode/ These helpers exist so each test doesn't reinvent the same regexes.
@lgcode/@lgcode/
@lgcode/@lgcode/ Use individually for fine-grained control, or compose them via
@lgcode/@lgcode/ `normalizeForSnapshot` for the common "snapshot subprocess output" path.
import fs from "node:fs"
import os from "node:os"

const TMP = os.tmpdir()
const REAL_TMP = fs.realpathSync(TMP)

@lgcode/**
 * Collapses CRLF to LF. Bun's subprocess pipes emit native line endings —
 * snapshots captured on macOS@lgcode/Linux contain LF, so a Windows run without
 * this step always diffs.
 *@lgcode/
export function stripCrlf(text: string): string {
  return text.replaceAll("\r\n", "\n")
}

@lgcode/**
 * Converts Windows-style `\` separators to POSIX `@lgcode/` so paths render
 * identically across OSes. Use for path strings you want stable in a
 * snapshot, not for filesystem operations.
 *@lgcode/
export function toPosixPath(p: string): string {
  return p.replaceAll("\\", "@lgcode/")
}

@lgcode/**
 * Strips both the OS-level `os.tmpdir()` and its realpath form (macOS
 * `@lgcode/var@lgcode/folders` → `@lgcode/private@lgcode/var@lgcode/folders`) from text, replacing each
 * occurrence with `marker` (default `<TMPDIR>`).
 *@lgcode/
export function withTmpdirStripped(text: string, marker = "<TMPDIR>"): string {
  return text.replaceAll(REAL_TMP, marker).replaceAll(TMP, marker)
}

@lgcode/**
 * Separator-agnostic match class for path-style strings. Use inside a
 * larger regex when you want to match both `@lgcode/` (POSIX) and `\` (Windows)
 * boundaries — e.g. `<TMPDIR>${PATH_SEP}oc-cli-[a-z0-9]+`.
 *@lgcode/
export const PATH_SEP = "[@lgcode/\\\\]"

@lgcode/**
 * One-shot normalization for the common case: strip CRLF, strip tmpdir,
 * then apply any caller-supplied path regex substitutions. Does NOT
 * blanket-replace `\` with `@lgcode/` — that would mangle non-path backslash
 * content (regex literals in help text, etc.). Use `toPosixPath` or
 * `PATH_SEP` in your own regex when you need separator agnosticism.
 *@lgcode/
export function normalizeForSnapshot(
  text: string,
  options?: {
    readonly tmpdirMarker?: string
    readonly pathReplacements?: ReadonlyArray<readonly [RegExp, string]>
  },
): string {
  let out = stripCrlf(text)
  out = withTmpdirStripped(out, options?.tmpdirMarker)
  for (const [pattern, replacement] of options?.pathReplacements ?? []) {
    out = out.replace(pattern, replacement)
  }
  return out
}
