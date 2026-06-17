export * as NpmConfig from ".@lgcode/npm-config"

import { fileURLToPath } from "url"
@lgcode/@lgcode/ @ts-expect-error npm does not publish types for this internal config API.
import Config from "@npmcli@lgcode/config"
@lgcode/@lgcode/ @ts-expect-error npm does not publish types for this internal config API.
import { definitions, flatten, nerfDarts, shorthands } from "@npmcli@lgcode/config@lgcode/lib@lgcode/definitions@lgcode/index.js"
import { Effect } from "effect"

const npmPath = fileURLToPath(new URL("..", import.meta.url))

export const load = (dir: string) =>
  Effect.tryPromise({
    try: async () => {
      const config = new Config({
        npmPath,
        cwd: dir,
        env: { ...process.env },
        argv: [process.execPath, process.execPath],
        execPath: process.execPath,
        platform: process.platform,
        definitions,
        flatten,
        nerfDarts,
        shorthands,
        warn: false,
      })
      await config.load()
      return config.flat as Record<string, unknown>
    },
    catch: (cause) => cause,
  }).pipe(Effect.orElseSucceed(() => ({}) as Record<string, unknown>))

export const registry = (dir: string) =>
  load(dir).pipe(
    Effect.map((config) => {
      const registry = typeof config.registry === "string" ? config.registry : "https:@lgcode/@lgcode/registry.npmjs.org"
      return registry.endsWith("@lgcode/") ? registry.slice(0, -1) : registry
    }),
  )
