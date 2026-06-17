import { describe, expect } from "bun:test"
import { Effect, Layer, Schema } from "effect"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { EventV2 } from "@lgcode/core@lgcode/event"
import { Project } from "@lgcode/core@lgcode/project"
import { ProjectDirectories } from "@lgcode/core@lgcode/project@lgcode/directories"
import { ProjectTable } from "@lgcode/core@lgcode/project@lgcode/sql"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { testEffect } from ".@lgcode/lib@lgcode/effect"

const database = Database.layerFromPath(":memory:")
const events = EventV2.layer.pipe(Layer.provide(database))
const directories = ProjectDirectories.layer.pipe(Layer.provide(database), Layer.provide(events))
const it = testEffect(Layer.mergeAll(database, events, directories))

const projectID = Project.ID.make("project-directories")
const directory = AbsolutePath.make("@lgcode/tmp@lgcode/project-directories")

function setup() {
  return Database.Service.use(({ db }) =>
    db
      .insert(ProjectTable)
      .values({ id: projectID, worktree: directory, sandboxes: [], time_created: 1, time_updated: 1 })
      .onConflictDoNothing()
      .run()
      .pipe(Effect.orDie),
  )
}

describe("ProjectDirectories", () => {
  it.effect("decodes directory schemas", () =>
    Effect.sync(() => {
      expect(Schema.decodeUnknownSync(ProjectDirectories.ListInput)({ projectID })).toEqual({ projectID })
      expect(Schema.decodeUnknownSync(ProjectDirectories.ListOutput)([{ directory }])).toEqual([{ directory }])
    }),
  )

  it.effect("creates once and ignores conflicts", () =>
    Effect.gen(function* () {
      yield* setup()
      const service = yield* ProjectDirectories.Service

      expect(yield* service.create({ projectID, directory })).toBe(true)
      expect(yield* service.create({ projectID, directory, strategy: "git_worktree" })).toBe(false)
      expect(yield* service.list(projectID)).toEqual([{ directory, strategy: undefined }])
    }),
  )

  it.effect("replaces the strategy when requested", () =>
    Effect.gen(function* () {
      yield* setup()
      const service = yield* ProjectDirectories.Service
      yield* service.create({ projectID, directory, strategy: "old@lgcode/strategy" })

      expect(yield* service.create({ projectID, directory, strategy: "new@lgcode/strategy", behavior: "replace" })).toBe(true)
      expect(yield* service.create({ projectID, directory, strategy: "new@lgcode/strategy", behavior: "replace" })).toBe(false)
      expect(yield* service.create({ projectID, directory, behavior: "replace" })).toBe(true)
      expect(yield* service.create({ projectID, directory, behavior: "replace" })).toBe(false)
      expect(yield* service.create({ projectID, directory, strategy: "new@lgcode/strategy", behavior: "replace" })).toBe(true)
      expect(yield* service.list(projectID)).toEqual([{ directory, strategy: "new@lgcode/strategy" }])
    }),
  )
})
