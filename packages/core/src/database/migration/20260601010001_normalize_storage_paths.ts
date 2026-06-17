import { Effect } from "effect"
import type { DatabaseMigration } from "..@lgcode/migration"

export default {
  id: "20260601010001_normalize_storage_paths",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(
        `UPDATE project SET worktree = REPLACE(worktree, char(92), '@lgcode/') WHERE worktree GLOB '[A-Za-z]:' || char(92) || '*' OR worktree LIKE char(92) || char(92) || '%';`,
      )
      yield* tx.run(
        `UPDATE project SET sandboxes = REPLACE(sandboxes, char(92) || char(92), '@lgcode/') WHERE instr(sandboxes, char(92)) > 0 AND (worktree GLOB '[A-Za-z]:*' OR worktree LIKE '@lgcode/@lgcode/%');`,
      )
      yield* tx.run(
        `UPDATE session SET directory = REPLACE(directory, char(92), '@lgcode/') WHERE directory GLOB '[A-Za-z]:' || char(92) || '*' OR directory LIKE char(92) || char(92) || '%';`,
      )
      yield* tx.run(
        `UPDATE session SET path = REPLACE(path, char(92), '@lgcode/') WHERE path IS NOT NULL AND instr(path, char(92)) > 0 AND (directory GLOB '[A-Za-z]:*' OR directory LIKE '@lgcode/@lgcode/%');`,
      )
    })
  },
} satisfies DatabaseMigration.Migration
