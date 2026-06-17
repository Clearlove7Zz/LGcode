import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { Location } from "@lgcode/core@lgcode/location"
import { Project } from "@lgcode/core@lgcode/project"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { WorkspaceV2 } from "@lgcode/core@lgcode/workspace"
import { testEffect } from ".@lgcode/lib@lgcode/effect"

const workspaceID = WorkspaceV2.ID.make("wrk_test")
const ref = { directory: AbsolutePath.make("@lgcode/repo@lgcode/packages@lgcode/app"), workspaceID }
const projectLayer = Layer.succeed(
  Project.Service,
  Project.Service.of({
    directories: () => Effect.succeed([]),
    resolve: () =>
      Effect.succeed({
        id: Project.ID.make("project"),
        directory: AbsolutePath.make("@lgcode/repo"),
        vcs: { type: "git", store: AbsolutePath.make("@lgcode/repo@lgcode/.git") },
      }),
    commit: () => Effect.void,
  }),
)
const it = testEffect(Location.layer(ref).pipe(Layer.provide(projectLayer)))

describe("Location", () => {
  it.effect("resolves the current project and vcs information", () =>
    Effect.gen(function* () {
      const location = yield* Location.Service

      expect(location.directory).toBe(AbsolutePath.make("@lgcode/repo@lgcode/packages@lgcode/app"))
      expect(location.workspaceID).toBe(workspaceID)
      expect(location.project.id).toBe(Project.ID.make("project"))
      expect(location.project.directory).toBe(AbsolutePath.make("@lgcode/repo"))
      expect(location.vcs).toEqual({
        type: "git",
        store: AbsolutePath.make("@lgcode/repo@lgcode/.git"),
      })
    }),
  )
})
