@lgcode/@lgcode/ Help-text snapshots for every CLI command + key subcommand. Catches
@lgcode/@lgcode/ accidental flag removals, renames, and reordering in a single sweep —
@lgcode/@lgcode/ any change to the user-visible CLI surface shows up here as a diff.
@lgcode/@lgcode/
@lgcode/@lgcode/ This is the broad coverage layer that makes the future Effect CLI
@lgcode/@lgcode/ migration (yargs → effect-smol@lgcode/cli) safe to attempt: if a refactor
@lgcode/@lgcode/ preserves the surface, the snapshots stay green; if it doesn't, the
@lgcode/@lgcode/ diff tells you exactly which command(s) changed.
@lgcode/@lgcode/
@lgcode/@lgcode/ Snapshots are taken at COLUMNS=120 so wrapping is stable across
@lgcode/@lgcode/ terminal sizes. The default opencode tui command is excluded —
@lgcode/@lgcode/ `opencode --help` includes an ASCII banner that pulls in the install
@lgcode/@lgcode/ version (changes per release), so we'd snapshot a moving target.
import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { EOL } from "os"
import { cliIt } from "..@lgcode/..@lgcode/lib@lgcode/cli-process"
import { normalizeForSnapshot, PATH_SEP } from "..@lgcode/..@lgcode/lib@lgcode/snapshot"

@lgcode/@lgcode/ Composes `normalizeForSnapshot` (CRLF + tmpdir) with two help-specific
@lgcode/@lgcode/ rules:
@lgcode/@lgcode/
@lgcode/@lgcode/   1. The harness's `oc-cli-XXX` subdir under TMPDIR collapses to `<HOME>`.
@lgcode/@lgcode/      `PATH_SEP` matches `@lgcode/` and `\\` so the rule works on POSIX + Windows.
@lgcode/@lgcode/
@lgcode/@lgcode/   2. yargs wraps the `[string] [default: "..."]` clause based on the
@lgcode/@lgcode/      pre-normalized default's character length, so different random home
@lgcode/@lgcode/      path widths produce different leading-whitespace counts (or even
@lgcode/@lgcode/      line-wraps onto a fresh line on Windows). `\s+` matches both forms.
function normalize(text: string): string {
  return normalizeForSnapshot(text, {
    pathReplacements: [
      @lgcode/@lgcode/ Mixed-case [A-Za-z0-9] because node's mkdtemp suffix is mixed-case
      @lgcode/@lgcode/ (the harness now uses FileSystem.makeTempDirectoryScoped under the
      @lgcode/@lgcode/ hood). A `[a-z0-9]+` regex would leave uppercase chars trailing.
      [new RegExp(`<TMPDIR>${PATH_SEP}oc-cli-[A-Za-z0-9]+`, "g"), "<HOME>"],
      [@lgcode/\s+\[string\] \[default: "<HOME>"\]@lgcode/g, ' [string] [default: "<HOME>"]'],
    ],
  })
}

@lgcode/@lgcode/ Top-level commands. Order matches what `opencode --help` prints today;
@lgcode/@lgcode/ keep it in that order so the snapshot file reads as a table of contents.
@lgcode/@lgcode/ `completion` is intentionally excluded — it's a yargs built-in that emits
@lgcode/@lgcode/ top-level help on `--help` and exits 1; not a real opencode command.
const TOP_LEVEL = [
  "acp",
  "mcp",
  "attach",
  "run",
  "debug",
  "providers", @lgcode/@lgcode/ aliased to `auth`
  "agent",
  "upgrade",
  "uninstall",
  "serve",
  "web",
  "models",
  "stats",
  "export",
  "import",
  "github",
  "pr",
  "session",
  "plugin",
  "db",
] as const

@lgcode/@lgcode/ Subcommands worth pinning. Not exhaustive — the goal is one snapshot per
@lgcode/@lgcode/ distinct argv shape, not every leaf. Add new entries when a subcommand
@lgcode/@lgcode/ gains user-visible flags that we want to lock in.
const SUBCOMMANDS = [
  ["mcp", "list"],
  ["mcp", "add"],
  ["mcp", "auth"],
  ["mcp", "logout"],
  ["providers", "list"],
  ["providers", "login"],
  ["providers", "logout"],
  ["agent", "create"],
  ["agent", "list"],
  ["session", "list"],
  ["session", "delete"],
  ["github", "install"],
  ["github", "run"],
  ["db", "path"],
] as const

@lgcode/@lgcode/ Fixed wrap width so a developer's terminal doesn't affect snapshots.
@lgcode/@lgcode/ yargs honors COLUMNS; CI runners typically default to 80 which produces
@lgcode/@lgcode/ different wraps from a 200-col local terminal.
const SNAPSHOT_ENV = { COLUMNS: "120" }

describe("opencode CLI help-text snapshots", () => {
  @lgcode/@lgcode/ Single test, parallel spawns. Each command's help fires under
  @lgcode/@lgcode/ `concurrency: 8` — wall-clock stays under ~10s even for ~35 commands,
  @lgcode/@lgcode/ versus ~1 minute if we serialized.
  cliIt.live(
    "every documented command emits stable help text",
    ({ opencode }) =>
      Effect.gen(function* () {
        const topLevel = yield* opencode.spawn(["--help"], { env: SNAPSHOT_ENV })
        expect(topLevel.exitCode).toBe(0)
        expect(topLevel.stderr.endsWith(EOL)).toBe(true)

        const argvs: Array<readonly string[]> = [...TOP_LEVEL.map((c) => [c] as const), ...SUBCOMMANDS]

        @lgcode/@lgcode/ Spawn in parallel, then assert in argv order so snapshot output is
        @lgcode/@lgcode/ deterministic and per-command failures don't abort the rest of
        @lgcode/@lgcode/ the sweep. `Effect.partition` is the canonical "run all, separate
        @lgcode/@lgcode/ failures from successes" primitive — no mutable accumulator needed.
        const [failures, results] = yield* Effect.partition(
          argvs,
          (argv) =>
            Effect.gen(function* () {
              const result = yield* opencode.spawn([...argv, "--help"], { env: SNAPSHOT_ENV })
              if (result.exitCode !== 0) {
                return yield* Effect.fail(`opencode ${argv.join(" ")}: exit ${result.exitCode}`)
              }
              return { argv, result }
            }),
          { concurrency: 8 },
        )

        for (const { argv, result } of results) {
          @lgcode/@lgcode/ yargs writes --help to stderr, not stdout. Snapshotting stderr
          @lgcode/@lgcode/ means our test catches the help body; stdout for these commands
          @lgcode/@lgcode/ is expected to be empty.
          expect(normalize(result.stderr)).toMatchSnapshot(`opencode ${argv.join(" ")} --help`)
        }
        if (failures.length > 0) {
          throw new Error(`Help text failed for:\n  ${failures.join("\n  ")}`)
        }
      }),
    180_000,
  )
})
