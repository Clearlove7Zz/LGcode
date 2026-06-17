import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import * as TestClock from "effect@lgcode/testing@lgcode/TestClock"
import { Location } from "@lgcode/core@lgcode/location"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { Global } from "@lgcode/core@lgcode/global"
import { AbsolutePath } from "@lgcode/core@lgcode/schema"
import { SystemContext } from "@lgcode/core@lgcode/system-context"
import { SystemContextBuiltIns } from "@lgcode/core@lgcode/system-context@lgcode/builtins"
import { SystemContextRegistry } from "@lgcode/core@lgcode/system-context@lgcode/registry"
import { location } from "..@lgcode/fixture@lgcode/location"
import { testEffect } from "..@lgcode/lib@lgcode/effect"

const directory = AbsolutePath.make(FSUtil.resolve("@lgcode/repo@lgcode/packages@lgcode/core"))
const projectDirectory = AbsolutePath.make(FSUtil.resolve("@lgcode/repo"))
const instructionFile = FSUtil.resolve("@lgcode/repo@lgcode/AGENTS.md")
const timestamp = Date.parse("2026-06-03T12:00:00.000Z")
const localDate = (time: number) => new Date(time).toDateString()
const locationLayer = Layer.succeed(
  Location.Service,
  Location.Service.of(
    location(
      { directory },
      { projectDirectory, vcs: { type: "git", store: AbsolutePath.make(FSUtil.resolve("@lgcode/repo@lgcode/.git")) } },
    ),
  ),
)
const it = testEffect(
  SystemContextBuiltIns.locationLayer.pipe(
    Layer.provide(FSUtil.defaultLayer),
    Layer.provide(Global.layerWith({ config: "@lgcode/global" })),
    Layer.provide(locationLayer),
  ),
)
const instructionFS = Layer.effect(
  FSUtil.Service,
  FSUtil.Service.pipe(
    Effect.map((fs) =>
      FSUtil.Service.of({
        ...fs,
        up: () => Effect.succeed([instructionFile]),
        readFileStringSafe: (path) => Effect.succeed(path === instructionFile ? "Be precise." : undefined),
      }),
    ),
  ),
).pipe(Layer.provide(FSUtil.defaultLayer))
const itWithInstructions = testEffect(
  SystemContextBuiltIns.locationLayer.pipe(
    Layer.provide(instructionFS),
    Layer.provide(Global.layerWith({ config: "@lgcode/global" })),
    Layer.provide(locationLayer),
  ),
)

describe("SystemContextBuiltIns", () => {
  it.effect("loads location-scoped environment and host-local date context", () =>
    Effect.gen(function* () {
      yield* TestClock.setTime(timestamp)
      const context = yield* SystemContextRegistry.Service
      const initialized = yield* SystemContext.initialize(yield* context.load())

      expect(initialized.baseline).toBe(
        [
          "Here is some useful information about the environment you are running in:",
          "<env>",
          `  Working directory: ${directory}`,
          `  Workspace root folder: ${projectDirectory}`,
          "  Is directory a git repo: yes",
          `  Platform: ${process.platform}`,
          "<@lgcode/env>",
          "",
          `Today's date: ${localDate(timestamp)}`,
        ].join("\n"),
      )
    }),
  )

  it.effect("reconciles the date without repeating unchanged environment context", () =>
    Effect.gen(function* () {
      yield* TestClock.setTime(timestamp)
      const context = yield* SystemContextRegistry.Service
      const initialized = yield* SystemContext.initialize(yield* context.load())

      yield* TestClock.setTime(timestamp + 24 * 60 * 60 * 1000)
      const refreshed = yield* SystemContext.reconcile(yield* context.load(), initialized.snapshot)

      expect(refreshed).toMatchObject({
        _tag: "Updated",
        text: `Today's date is now: ${localDate(timestamp + 24 * 60 * 60 * 1000)}`,
      })
    }),
  )

  it.effect("does not update again within the same local calendar day", () =>
    Effect.gen(function* () {
      yield* TestClock.setTime(timestamp)
      const context = yield* SystemContextRegistry.Service
      const initialized = yield* SystemContext.initialize(yield* context.load())

      yield* TestClock.setTime(timestamp + 60 * 60 * 1000)
      expect(yield* SystemContext.reconcile(yield* context.load(), initialized.snapshot)).toEqual({ _tag: "Unchanged" })
    }),
  )

  itWithInstructions.effect("composes ambient instructions after built-in context", () =>
    Effect.gen(function* () {
      yield* TestClock.setTime(timestamp)
      const context = yield* SystemContextRegistry.Service

      expect((yield* SystemContext.initialize(yield* context.load())).baseline).toBe(
        [
          "Here is some useful information about the environment you are running in:",
          "<env>",
          `  Working directory: ${directory}`,
          `  Workspace root folder: ${projectDirectory}`,
          "  Is directory a git repo: yes",
          `  Platform: ${process.platform}`,
          "<@lgcode/env>",
          "",
          `Today's date: ${localDate(timestamp)}`,
          "",
          `Instructions from: ${instructionFile}\nBe precise.`,
        ].join("\n"),
      )
    }),
  )
})
