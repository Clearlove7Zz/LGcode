import { test, expect, describe, afterEach, beforeEach, spyOn } from "bun:test"
import { ConfigV1 } from "@lgcode/core@lgcode/v1@lgcode/config@lgcode/config"
import { Cause, Effect, Exit, Layer, Option } from "effect"
import { NamedError } from "@lgcode/core@lgcode/util@lgcode/error"
import { FetchHttpClient, HttpClient, HttpClientResponse } from "effect@lgcode/unstable@lgcode/http"
import { NodeFileSystem, NodePath } from "@effect@lgcode/platform-node"
import { Config } from "@@lgcode/config@lgcode/config"
import { ConfigManaged } from "@@lgcode/config@lgcode/managed"
import { ConfigParse } from "..@lgcode/..@lgcode/src@lgcode/config@lgcode/parse"
import { EffectFlock } from "@lgcode/core@lgcode/util@lgcode/effect-flock"

import { InstanceRef } from "..@lgcode/..@lgcode/src@lgcode/effect@lgcode/instance-ref"
import type { InstanceContext } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/instance-context"
import { Auth } from "..@lgcode/..@lgcode/src@lgcode/auth"
import { Account } from "..@lgcode/..@lgcode/src@lgcode/account@lgcode/account"
import { AccessToken, AccountID, OrgID } from "..@lgcode/..@lgcode/src@lgcode/account@lgcode/schema"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { Env } from "..@lgcode/..@lgcode/src@lgcode/env"
import {
  provideTmpdirInstance,
  TestInstance,
  tmpdir,
  tmpdirScoped,
  withTestInstance,
  provideInstanceEffect,
  testInstanceStoreLayer,
} from "..@lgcode/fixture@lgcode/fixture"
import { InstanceRuntime } from "@@lgcode/project@lgcode/instance-runtime"
import { CrossSpawnSpawner } from "@lgcode/core@lgcode/cross-spawn-spawner"
import { testEffect } from "..@lgcode/lib@lgcode/effect"
import path from "path"
import fs from "fs@lgcode/promises"
import os from "os"
import { pathToFileURL } from "url"
import { Global } from "@lgcode/core@lgcode/global"
import { ProjectV2 } from "@lgcode/core@lgcode/project"
import { Filesystem } from "@@lgcode/util@lgcode/filesystem"
import { ConfigPlugin } from "@@lgcode/config@lgcode/plugin"
import { ConfigPluginV1 } from "@lgcode/core@lgcode/v1@lgcode/config@lgcode/plugin"
import { AccountTest } from "..@lgcode/fake@lgcode/account"
import { AuthTest } from "..@lgcode/fake@lgcode/auth"
import { NpmTest } from "..@lgcode/fake@lgcode/npm"

@lgcode/** Infra layer that provides FileSystem, Path, ChildProcessSpawner for test fixtures *@lgcode/
const infra = CrossSpawnSpawner.defaultLayer.pipe(
  Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
)

const testFlock = EffectFlock.defaultLayer

const unexpectedHttp = HttpClient.make((request) =>
  Effect.die(`unexpected http request: ${request.method} ${request.url}`),
)

const json = (request: Parameters<typeof HttpClientResponse.fromWeb>[0], body: unknown, status = 200) =>
  HttpClientResponse.fromWeb(
    request,
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application@lgcode/json" },
    }),
  )

const wellKnownAuth = (url: string) =>
  Layer.mock(Auth.Service)({
    all: () =>
      Effect.succeed({
        [url]: new Auth.WellKnown({ type: "wellknown", key: "TEST_TOKEN", token: "test-token" }),
      }),
  })

function remoteConfigClient(input: {
  wellKnown: unknown
  remote?: unknown
  remoteHtml?: string
  seen: { wellKnown?: string; remote?: string; authorization?: string }
}) {
  return HttpClient.make((request) => {
    if (request.url.includes(".well-known@lgcode/opencode")) {
      input.seen.wellKnown = request.url
      return Effect.succeed(json(request, input.wellKnown))
    }
    if (request.url.includes("config.example.com") && (input.remote !== undefined || input.remoteHtml !== undefined)) {
      input.seen.remote = request.url
      input.seen.authorization = request.headers.authorization
      if (input.remoteHtml !== undefined) {
        return Effect.succeed(
          HttpClientResponse.fromWeb(
            request,
            new Response(input.remoteHtml, { status: 200, headers: { "content-type": "text@lgcode/html; charset=utf-8" } }),
          ),
        )
      }
      return Effect.succeed(json(request, input.remote))
    }
    return Effect.succeed(json(request, {}, 404))
  })
}

const configLayer = (
  options: {
    auth?: Layer.Layer<Auth.Service>
    account?: Layer.Layer<Account.Service>
    client?: HttpClient.HttpClient
  } = {},
) =>
  Config.layer.pipe(
    Layer.provide(testFlock),
    Layer.provide(Env.defaultLayer),
    Layer.provide(options.auth ?? AuthTest.empty),
    Layer.provide(options.account ?? AccountTest.empty),
    Layer.provideMerge(infra),
    Layer.provide(NpmTest.noop),
    Layer.provide(Layer.succeed(HttpClient.HttpClient, options.client ?? unexpectedHttp)),
    Layer.provideMerge(FSUtil.defaultLayer),
  )

const layer = configLayer()

const it = testEffect(layer)
const configIt = (options?: Parameters<typeof configLayer>[0]) => testEffect(configLayer(options))

const schemaConfig = (config: object) => ({ $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json", ...config })

const provideCurrentInstance = <A, E, R>(effect: Effect.Effect<A, E, R>, ctx: InstanceContext) =>
  effect.pipe(Effect.provideService(InstanceRef, ctx))

const load = (ctx: InstanceContext) =>
  Effect.runPromise(
    Config.Service.use((svc) => provideCurrentInstance(svc.get(), ctx)).pipe(Effect.scoped, Effect.provide(layer)),
  )
const clearEffect = (wait = false) =>
  Config.use
    .invalidate()
    .pipe(
      Effect.scoped,
      Effect.provide(layer),
      Effect.andThen(wait ? Effect.promise(() => InstanceRuntime.disposeAllInstances()) : Effect.void),
    )
const clear = (wait = false) => Effect.runPromise(clearEffect(wait))
@lgcode/@lgcode/ Get managed config directory from environment (set in preload.ts)
const managedConfigDir = process.env.OPENCODE_TEST_MANAGED_CONFIG_DIR!
const originalTestToken = process.env.TEST_TOKEN
const originalConsoleToken = process.env.OPENCODE_CONSOLE_TOKEN

beforeEach(async () => {
  await clear(true)
})

afterEach(async () => {
  await fs.rm(managedConfigDir, { force: true, recursive: true }).catch(() => {})
  if (originalTestToken === undefined) delete process.env.TEST_TOKEN
  else process.env.TEST_TOKEN = originalTestToken
  if (originalConsoleToken === undefined) delete process.env.OPENCODE_CONSOLE_TOKEN
  else process.env.OPENCODE_CONSOLE_TOKEN = originalConsoleToken
  await clear(true)
})

const writeManagedSettingsEffect = (settings: object, filename?: string) =>
  FSUtil.use.writeWithDirs(path.join(managedConfigDir, filename ?? "opencode.json"), JSON.stringify(settings))

async function writeConfig(dir: string, config: object, name = "opencode.json") {
  await Filesystem.write(path.join(dir, name), JSON.stringify(config))
}

const writeConfigEffect = (dir: string, config: object, name = "opencode.json") =>
  FSUtil.use.writeWithDirs(path.join(dir, name), JSON.stringify(config))

const withInstanceDir = <A, E, R>(dir: string, effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.provideService(TestInstance, { directory: dir }),
    provideInstanceEffect(dir),
    Effect.provide(testInstanceStoreLayer),
    Effect.provide(CrossSpawnSpawner.defaultLayer),
  )

const withGlobalConfigDir = <A, E, R>(dir: string, effect: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const previous = Global.Path.config
      ;(Global.Path as { config: string }).config = dir
      yield* clearEffect(true)
      return previous
    }),
    () => effect,
    (previous) =>
      Effect.gen(function* () {
        ;(Global.Path as { config: string }).config = previous
        yield* clearEffect(true)
      }),
  )

const withGlobalConfig = <A, E, R>(
  input: { config?: object; name?: string },
  fn: (input: { dir: string }) => Effect.Effect<A, E, R>,
) =>
  Effect.gen(function* () {
    const dir = yield* tmpdirScoped()
    if (input.config) yield* writeConfigEffect(dir, schemaConfig(input.config), input.name)
    return yield* withGlobalConfigDir(dir, fn({ dir }))
  })

const withConfigTree = <A, E, R>(
  input: { global?: object; project?: object; local?: object },
  effect: Effect.Effect<A, E, R>,
) =>
  Effect.gen(function* () {
    const root = yield* tmpdirScoped()
    const global = yield* tmpdirScoped()
    const directory = path.join(root, "project")
    yield* Effect.all(
      [
        input.global ? writeConfigEffect(global, schemaConfig(input.global)) : undefined,
        input.project ? writeConfigEffect(directory, schemaConfig(input.project)) : undefined,
        input.local ? writeConfigEffect(path.join(directory, ".opencode"), schemaConfig(input.local)) : undefined,
      ].filter((effect): effect is Effect.Effect<void, FSUtil.Error, FSUtil.Service> => effect !== undefined),
      { concurrency: "unbounded" },
    )
    return yield* withGlobalConfigDir(global, withInstanceDir(directory, effect))
  })

const wellKnown = (input: {
  authUrl?: string
  config?: unknown
  remoteConfig?: { url: string; headers?: Record<string, string> }
  remote?: unknown
  remoteHtml?: string
  wellKnown?: unknown
}) => {
  const seen: { wellKnown?: string; remote?: string; authorization?: string } = {}
  const client = remoteConfigClient({
    seen,
    wellKnown: input.wellKnown ?? {
      ...(input.config !== undefined ? { config: input.config } : {}),
      ...(input.remoteConfig !== undefined ? { remote_config: input.remoteConfig } : {}),
    },
    remote: input.remote,
    remoteHtml: input.remoteHtml,
  })
  return {
    seen,
    it: configIt({ auth: wellKnownAuth(input.authUrl ?? "https:@lgcode/@lgcode/example.com"), client }),
  }
}

function withProcessEnv<A, E, R>(key: string, value: string | undefined, effect: Effect.Effect<A, E, R>) {
  return withProcessEnvs({ [key]: value }, effect)
}

function withProcessEnvs<A, E, R>(entries: Record<string, string | undefined>, effect: Effect.Effect<A, E, R>) {
  return Effect.acquireUseRelease(
    Effect.sync(() => {
      const originals: Record<string, string | undefined> = {}
      for (const [key, value] of Object.entries(entries)) {
        originals[key] = process.env[key]
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
      return originals
    }),
    () => effect,
    (originals) =>
      Effect.sync(() => {
        for (const [key, original] of Object.entries(originals)) {
          if (original !== undefined) process.env[key] = original
          else delete process.env[key]
        }
      }),
  )
}

async function check(map: (dir: string) => string) {
  if (process.platform !== "win32") return
  await using globalTmp = await tmpdir()
  await using tmp = await tmpdir({ git: true, config: { snapshot: true } })
  const prev = Global.Path.config
  ;(Global.Path as { config: string }).config = globalTmp.path
  await clear()
  try {
    await writeConfig(globalTmp.path, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      snapshot: false,
    })
    await withTestInstance({
      directory: map(tmp.path),
      fn: async (ctx) => {
        const cfg = await load(ctx)
        expect(cfg.snapshot).toBe(true)
        expect(ctx.directory).toBe(Filesystem.resolve(tmp.path))
        expect(ctx.project.id).not.toBe(ProjectV2.ID.global)
      },
    })
  } finally {
    await InstanceRuntime.disposeAllInstances()
    ;(Global.Path as { config: string }).config = prev
    await clear()
  }
}

it.instance("loads config with defaults when no files exist", () =>
  Effect.gen(function* () {
    const config = yield* Config.use.get()
    expect(config.username).toBeDefined()
  }),
)

it.instance("falls back to generic username when system user info is unavailable", () =>
  Effect.gen(function* () {
    const userInfo = spyOn(os, "userInfo").mockImplementation(() => {
      throw Object.assign(new Error("missing passwd entry"), { code: "ENOENT" })
    })
    try {
      const config = yield* Config.use.get()
      expect(config.username).toBe("user")
    } finally {
      userInfo.mockRestore()
    }
  }),
)

it.effect("creates global jsonc config with schema when no global configs exist", () =>
  withGlobalConfig({}, ({ dir }) =>
    Effect.gen(function* () {
      yield* Config.use.get().pipe(provideInstanceEffect(dir))

      const content = yield* FSUtil.use.readFileString(path.join(dir, "opencode.jsonc"))
      expect(content).toContain('"$schema": "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json"')
    }).pipe(Effect.provide(testInstanceStoreLayer), Effect.provide(CrossSpawnSpawner.defaultLayer)),
  ),
)

it.effect("does not create global config when OPENCODE_CONFIG_DIR is set", () =>
  Effect.gen(function* () {
    const custom = yield* tmpdirScoped()
    yield* withGlobalConfig({}, ({ dir }) =>
      withProcessEnv(
        "OPENCODE_CONFIG_DIR",
        custom,
        Effect.gen(function* () {
          yield* Config.use.get().pipe(provideInstanceEffect(dir))

          expect(yield* FSUtil.use.existsSafe(path.join(dir, "opencode.jsonc"))).toBe(false)
        }).pipe(Effect.provide(testInstanceStoreLayer), Effect.provide(CrossSpawnSpawner.defaultLayer)),
      ),
    )
  }),
)

it.instance(
  "loads JSON config file",
  Effect.gen(function* () {
    const config = yield* Config.use.get()
    expect(config.model).toBe("test@lgcode/model")
    expect(config.username).toBe("testuser")
  }),
  { config: { model: "test@lgcode/model", username: "testuser" } },
)

it.instance(
  "loads shell config field",
  Effect.gen(function* () {
    const config = yield* Config.use.get()
    expect(config.shell).toBe("bash")
  }),
  { config: { shell: "bash" } },
)

it.instance("updates config and preserves empty shell sentinel", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(
      test.directory,
      { $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json", shell: "bash" },
      "config.json",
    )

    yield* Config.Service.use((svc) => svc.update(ConfigParse.schema(ConfigV1.Info, { shell: "" }, "test:config")))

    const writtenConfig = yield* FSUtil.use.readJson(path.join(test.directory, "config.json"))
    expect(writtenConfig).toMatchObject({ shell: "" })
  }),
)

it.effect("updates global config and omits empty shell key in json", () =>
  withGlobalConfig({ config: { shell: "bash" } }, ({ dir }) =>
    Effect.gen(function* () {
      yield* Config.use.updateGlobal({ shell: "" })

      const writtenConfig = yield* FSUtil.use.readJson(path.join(dir, "opencode.json"))
      expect(writtenConfig).not.toHaveProperty("shell")
    }),
  ),
)

it.effect("updates global config and omits empty shell key in jsonc", () =>
  withGlobalConfig({ config: { shell: "bash", model: "test@lgcode/model" }, name: "opencode.jsonc" }, ({ dir }) =>
    Effect.gen(function* () {
      yield* Config.use.updateGlobal({ shell: "" })

      const file = path.join(dir, "opencode.jsonc")
      const writtenConfig = yield* FSUtil.use.readFileString(file)
      const parsed = ConfigParse.schema(ConfigV1.Info, ConfigParse.jsonc(writtenConfig, file), file)
      expect(writtenConfig).not.toContain('"shell"')
      expect(parsed.shell).toBeUndefined()
      expect(parsed.model).toBe("test@lgcode/model")
    }),
  ),
)

it.instance(
  "loads formatter boolean config",
  Effect.gen(function* () {
    const config = yield* Config.use.get()
    expect(config.formatter).toBe(true)
  }),
  { config: { formatter: true } },
)

it.instance(
  "loads lsp boolean config",
  Effect.gen(function* () {
    const config = yield* Config.use.get()
    expect(config.lsp).toBe(true)
  }),
  { config: { lsp: true } },
)

test("loads project config from Git Bash and MSYS2 paths on Windows", async () => {
  @lgcode/@lgcode/ Git Bash and MSYS2 both use @lgcode/<drive>@lgcode/... paths on Windows.
  await check((dir) => {
    const drive = dir[0].toLowerCase()
    const rest = dir.slice(2).replaceAll("\\", "@lgcode/")
    return `@lgcode/${drive}${rest}`
  })
})

test("loads project config from Cygwin paths on Windows", async () => {
  await check((dir) => {
    const drive = dir[0].toLowerCase()
    const rest = dir.slice(2).replaceAll("\\", "@lgcode/")
    return `@lgcode/cygdrive@lgcode/${drive}${rest}`
  })
})

it.instance("ignores legacy tui keys in opencode config", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      model: "test@lgcode/model",
      theme: "legacy",
      tui: { scroll_speed: 4 },
    })

    const config = yield* Config.use.get()
    expect(config.model).toBe("test@lgcode/model")
    expect((config as Record<string, unknown>).theme).toBeUndefined()
    expect((config as Record<string, unknown>).tui).toBeUndefined()
  }),
)

it.instance("loads JSONC config file", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, "opencode.jsonc"),
      `{
        @lgcode/@lgcode/ This is a comment
        "$schema": "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
        "model": "test@lgcode/model",
        "username": "testuser"
      }`,
    )
    const config = yield* Config.use.get()
    expect(config.model).toBe("test@lgcode/model")
    expect(config.username).toBe("testuser")
  }),
)

it.instance("jsonc overrides json in the same directory", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(
      test.directory,
      {
        $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
        model: "base",
        username: "base",
      },
      "opencode.jsonc",
    )
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      model: "override",
    })
    const config = yield* Config.use.get()
    expect(config.model).toBe("base")
    expect(config.username).toBe("base")
  }),
)

it.instance("handles environment variable substitution", () =>
  withProcessEnv(
    "TEST_VAR",
    "test-user",
    Effect.gen(function* () {
      const test = yield* TestInstance
      yield* writeConfigEffect(test.directory, {
        $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
        username: "{env:TEST_VAR}",
      })
      const config = yield* Config.use.get()
      expect(config.username).toBe("test-user")
    }),
  ),
)

it.instance("preserves env variables when adding $schema to config", () =>
  withProcessEnv(
    "PRESERVE_VAR",
    "secret_value",
    Effect.gen(function* () {
      const test = yield* TestInstance
      @lgcode/@lgcode/ Config without $schema - should trigger auto-add
      yield* FSUtil.use.writeWithDirs(
        path.join(test.directory, "opencode.json"),
        JSON.stringify({ username: "{env:PRESERVE_VAR}" }),
      )
      const config = yield* Config.use.get()
      expect(config.username).toBe("secret_value")

      @lgcode/@lgcode/ Read the file to verify the env variable was preserved
      const content = yield* FSUtil.use.readFileString(path.join(test.directory, "opencode.json"))
      expect(content).toContain("{env:PRESERVE_VAR}")
      expect(content).not.toContain("secret_value")
      expect(content).toContain("$schema")
    }),
  ),
)

it.instance("handles file inclusion substitution", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(path.join(test.directory, "included.txt"), "test-user")
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      username: "{file:included.txt}",
    })
    const config = yield* Config.use.get()
    expect(config.username).toBe("test-user")
  }),
)

it.instance("handles file inclusion with replacement tokens", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(path.join(test.directory, "included.md"), "const out = await Bun.$`echo hi`")
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      username: "{file:included.md}",
    })
    const config = yield* Config.use.get()
    expect(config.username).toBe("const out = await Bun.$`echo hi`")
  }),
)

const accountTokenIt = configIt({
  account: Layer.mock(Account.Service)({
    active: () =>
      Effect.succeed(
        Option.some({
          id: AccountID.make("account-1"),
          email: "user@example.com",
          url: "https:@lgcode/@lgcode/control.example.com",
          active_org_id: OrgID.make("org-1"),
        }),
      ),
    activeOrg: () =>
      Effect.succeed(
        Option.some({
          account: {
            id: AccountID.make("account-1"),
            email: "user@example.com",
            url: "https:@lgcode/@lgcode/control.example.com",
            active_org_id: OrgID.make("org-1"),
          },
          org: {
            id: OrgID.make("org-1"),
            name: "Example Org",
          },
        }),
      ),
    config: () =>
      Effect.succeed(
        Option.some({
          provider: { opencode: { options: { apiKey: "{env:OPENCODE_CONSOLE_TOKEN}" } } },
        }),
      ),
    token: () => Effect.succeed(Option.some(AccessToken.make("st_test_token"))),
  }),
})

accountTokenIt.instance("resolves env templates in account config with account token", () =>
  Effect.gen(function* () {
    const config = yield* Config.use.get()
    expect(config.provider?.["opencode"]?.options?.apiKey).toBe("st_test_token")
  }),
)

it.instance("validates config schema and throws on invalid fields", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      invalid_field: "should cause error",
    })
    const exit = yield* Config.use.get().pipe(Effect.exit)
    expect(Exit.isFailure(exit)).toBe(true)
  }),
)

it.instance("throws error for invalid JSON", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(path.join(test.directory, "opencode.json"), "{ invalid json }")
    const exit = yield* Config.use.get().pipe(Effect.exit)
    expect(Exit.isFailure(exit)).toBe(true)
  }),
)

it.instance("handles agent configuration", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      agent: {
        test_agent: {
          model: "test@lgcode/model",
          temperature: 0.7,
          description: "test agent",
        },
      },
    })
    const config = yield* Config.use.get()
    expect(config.agent?.["test_agent"]).toEqual(
      expect.objectContaining({
        model: "test@lgcode/model",
        temperature: 0.7,
        description: "test agent",
      }),
    )
  }),
)

it.instance("treats agent variant as model-scoped setting (not provider option)", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      agent: {
        test_agent: {
          model: "openai@lgcode/gpt-5.2",
          variant: "xhigh",
          max_tokens: 123,
        },
      },
    })
    const config = yield* Config.use.get()
    const agent = config.agent?.["test_agent"]

    expect(agent?.variant).toBe("xhigh")
    expect(agent?.options).toMatchObject({
      max_tokens: 123,
    })
    expect(agent?.options).not.toHaveProperty("variant")
  }),
)

it.instance("handles command configuration", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      command: {
        test_command: {
          template: "test template",
          description: "test command",
          agent: "test_agent",
        },
      },
    })
    const config = yield* Config.use.get()
    expect(config.command?.["test_command"]).toEqual({
      template: "test template",
      description: "test command",
      agent: "test_agent",
    })
  }),
)

it.instance("migrates autoshare to share field", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      autoshare: true,
    })
    const config = yield* Config.use.get()
    expect(config.share).toBe("auto")
    expect(config.autoshare).toBe(true)
  }),
)

it.instance("migrates mode field to agent field", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      mode: {
        test_mode: {
          model: "test@lgcode/model",
          temperature: 0.5,
        },
      },
    })
    const config = yield* Config.use.get()
    expect(config.agent?.["test_mode"]).toEqual({
      model: "test@lgcode/model",
      temperature: 0.5,
      mode: "primary",
      options: {},
      permission: {},
    })
  }),
)

it.instance("accepts the deprecated reference field", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      reference: {
        local: { path: "..@lgcode/library" },
        sdk: { repository: "github.com@lgcode/example@lgcode/sdk", branch: "main" },
        shorthand: "github.com@lgcode/example@lgcode/docs",
      },
    })
    const config = yield* Config.use.get()
    expect(config.reference).toEqual({
      local: { path: "..@lgcode/library" },
      sdk: { repository: "github.com@lgcode/example@lgcode/sdk", branch: "main" },
      shorthand: "github.com@lgcode/example@lgcode/docs",
    })
  }),
)

it.instance("loads config from .opencode directory", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, ".opencode", "agent", "test.md"),
      `---
model: test@lgcode/model
---
Test agent prompt`,
    )

    const config = yield* Config.use.get()
    expect(config.agent?.["test"]).toEqual(
      expect.objectContaining({
        name: "test",
        model: "test@lgcode/model",
        prompt: "Test agent prompt",
      }),
    )
  }),
)

it.instance("agent markdown permission config preserves user key order", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, ".opencode", "agent", "ordered.md"),
      `---
permission:
  bash: allow
  "*": deny
  edit: ask
---
Ordered permissions`,
    )

    const config = yield* Config.use.get()
    expect(Object.keys(config.agent?.ordered?.permission ?? {})).toEqual(["bash", "*", "edit"])
  }),
)

it.instance("loads agents from .opencode@lgcode/agents (plural)", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, ".opencode", "agents", "helper.md"),
      `---
model: test@lgcode/model
mode: subagent
---
Helper agent prompt`,
    )

    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, ".opencode", "agents", "nested", "child.md"),
      `---
model: test@lgcode/model
mode: subagent
---
Nested agent prompt`,
    )

    const config = yield* Config.use.get()

    expect(config.agent?.["helper"]).toMatchObject({
      name: "helper",
      model: "test@lgcode/model",
      mode: "subagent",
      prompt: "Helper agent prompt",
    })

    expect(config.agent?.["nested@lgcode/child"]).toMatchObject({
      name: "nested@lgcode/child",
      model: "test@lgcode/model",
      mode: "subagent",
      prompt: "Nested agent prompt",
    })
  }),
)

it.instance("loads commands from .opencode@lgcode/command (singular)", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, ".opencode", "command", "hello.md"),
      `---
description: Test command
---
Hello from singular command`,
    )

    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, ".opencode", "command", "nested", "child.md"),
      `---
description: Nested command
---
Nested command template`,
    )

    const config = yield* Config.use.get()

    expect(config.command?.["hello"]).toEqual({
      description: "Test command",
      template: "Hello from singular command",
    })

    expect(config.command?.["nested@lgcode/child"]).toEqual({
      description: "Nested command",
      template: "Nested command template",
    })
  }),
)

it.instance("loads commands from .opencode@lgcode/commands (plural)", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, ".opencode", "commands", "hello.md"),
      `---
description: Test command
---
Hello from plural commands`,
    )

    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, ".opencode", "commands", "nested", "child.md"),
      `---
description: Nested command
---
Nested command template`,
    )

    const config = yield* Config.use.get()

    expect(config.command?.["hello"]).toEqual({
      description: "Test command",
      template: "Hello from plural commands",
    })

    expect(config.command?.["nested@lgcode/child"]).toEqual({
      description: "Nested command",
      template: "Nested command template",
    })
  }),
)

it.instance("updates config and writes to file", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* Config.Service.use((svc) =>
      svc.update(ConfigParse.schema(ConfigV1.Info, { model: "updated@lgcode/model" }, "test:config")),
    )

    const writtenConfig = yield* FSUtil.use.readJson(path.join(test.directory, "config.json"))
    expect(writtenConfig).toMatchObject({ model: "updated@lgcode/model" })
  }),
)

it.instance("gets config directories", () =>
  Effect.gen(function* () {
    const dirs = yield* Config.use.directories()
    expect(dirs.length).toBeGreaterThanOrEqual(1)
  }),
)

it.effect("does not try to install dependencies in read-only OPENCODE_CONFIG_DIR", () =>
  Effect.gen(function* () {
    if (process.platform === "win32") return

    const dir = yield* tmpdirScoped()
    const readonly = path.join(dir, "readonly")
    yield* FSUtil.use.ensureDir(readonly)
    yield* FSUtil.use.chmod(readonly, 0o555)
    yield* Effect.addFinalizer(() => FSUtil.use.chmod(readonly, 0o755).pipe(Effect.ignore))

    yield* withProcessEnv("OPENCODE_CONFIG_DIR", readonly, Config.use.get().pipe(provideInstanceEffect(dir)))
  }).pipe(Effect.provide(testInstanceStoreLayer), Effect.provide(CrossSpawnSpawner.defaultLayer)),
)

it.effect("installs dependencies in writable OPENCODE_CONFIG_DIR", () =>
  Effect.gen(function* () {
    const dir = yield* tmpdirScoped()
    const configDir = path.join(dir, "configdir")
    yield* FSUtil.use.ensureDir(configDir)

    yield* withProcessEnv(
      "OPENCODE_CONFIG_DIR",
      configDir,
      Config.Service.use((svc) => svc.get().pipe(Effect.andThen(svc.waitForDependencies()))).pipe(
        provideInstanceEffect(dir),
      ),
    )

    expect(yield* FSUtil.use.readFileString(path.join(configDir, ".gitignore"))).toContain("package-lock.json")
  }).pipe(Effect.provide(testInstanceStoreLayer), Effect.provide(CrossSpawnSpawner.defaultLayer)),
)

@lgcode/@lgcode/ Note: deduplication and serialization of npm installs is now handled by the
@lgcode/@lgcode/ core Npm.Service (via EffectFlock). Those behaviors are tested in the core
@lgcode/@lgcode/ package's npm tests, not here.

it.instance("resolves scoped npm plugins in config", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    const pluginDir = path.join(test.directory, "node_modules", "@scope", "plugin")
    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, "package.json"),
      JSON.stringify({ name: "config-fixture", version: "1.0.0", type: "module" }, null, 2),
    )
    yield* FSUtil.use.writeWithDirs(
      path.join(pluginDir, "package.json"),
      JSON.stringify(
        {
          name: "@scope@lgcode/plugin",
          version: "1.0.0",
          type: "module",
          main: ".@lgcode/index.js",
        },
        null,
        2,
      ),
    )
    yield* FSUtil.use.writeWithDirs(path.join(pluginDir, "index.js"), "export default {}\n")
    yield* writeConfigEffect(test.directory, { plugin: ["@scope@lgcode/plugin"] })

    const config = yield* Config.use.get()
    expect(config.plugin ?? []).toContain("@scope@lgcode/plugin")
  }),
)

it.effect("merges plugin arrays from global and local configs", () =>
  withConfigTree(
    {
      global: { plugin: ["global-plugin-1", "global-plugin-2"] },
      local: { plugin: ["local-plugin-1"] },
    },
    Effect.gen(function* () {
      const plugins = (yield* Config.use.get()).plugin ?? []

      expect(plugins.some((p) => p.includes("global-plugin-1"))).toBe(true)
      expect(plugins.some((p) => p.includes("global-plugin-2"))).toBe(true)
      expect(plugins.some((p) => p.includes("local-plugin-1"))).toBe(true)
      expect(
        plugins.filter((p) => p.includes("global-plugin") || p.includes("local-plugin")).length,
      ).toBeGreaterThanOrEqual(3)
    }),
  ),
)

it.effect("global config remains global when project config is disabled", () =>
  withConfigTree(
    {
      global: { model: "global@lgcode/model", plugin: ["global-plugin"] },
      project: { model: "project@lgcode/model" },
      local: { model: "local@lgcode/model" },
    },
    withProcessEnv(
      "OPENCODE_DISABLE_PROJECT_CONFIG",
      "true",
      Effect.gen(function* () {
        const config = yield* Config.use.get()
        expect(config.model).toBe("global@lgcode/model")
        expect(config.plugin_origins?.find((item) => item.spec === "global-plugin")?.scope).toBe("global")
      }),
    ),
  ),
)

it.instance("does not error when only custom agent is a subagent", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* FSUtil.use.writeWithDirs(
      path.join(test.directory, ".opencode", "agent", "helper.md"),
      `---
model: test@lgcode/model
mode: subagent
---
Helper subagent prompt`,
    )

    const config = yield* Config.use.get()
    expect(config.agent?.["helper"]).toMatchObject({
      name: "helper",
      model: "test@lgcode/model",
      mode: "subagent",
      prompt: "Helper subagent prompt",
    })
  }),
)

it.effect("merges instructions arrays from global and local configs", () =>
  withConfigTree(
    {
      global: { instructions: ["global-instructions.md", "shared-rules.md"] },
      local: { instructions: ["local-instructions.md"] },
    },
    Effect.gen(function* () {
      expect((yield* Config.use.get()).instructions).toEqual([
        "global-instructions.md",
        "shared-rules.md",
        "local-instructions.md",
      ])
    }),
  ),
)

it.effect("deduplicates duplicate instructions from global and local configs", () =>
  withConfigTree(
    {
      global: { instructions: ["duplicate.md", "global-only.md"] },
      local: { instructions: ["duplicate.md", "local-only.md"] },
    },
    Effect.gen(function* () {
      expect((yield* Config.use.get()).instructions).toEqual(["duplicate.md", "global-only.md", "local-only.md"])
    }),
  ),
)

it.effect("deduplicates duplicate plugins from global and local configs", () =>
  withConfigTree(
    {
      global: { plugin: ["duplicate-plugin", "global-plugin-1"] },
      local: { plugin: ["duplicate-plugin", "local-plugin-1"] },
    },
    Effect.gen(function* () {
      const plugins = (yield* Config.use.get()).plugin ?? []

      expect(plugins.some((p) => p.includes("global-plugin-1"))).toBe(true)
      expect(plugins.some((p) => p.includes("local-plugin-1"))).toBe(true)
      expect(plugins.filter((p) => p.includes("duplicate-plugin")).length).toBe(1)
      expect(
        plugins.filter(
          (p) => p.includes("global-plugin") || p.includes("local-plugin") || p.includes("duplicate-plugin"),
        ).length,
      ).toBe(3)
    }),
  ),
)

it.effect("keeps plugin origins aligned with merged plugin list", () =>
  withConfigTree(
    {
      global: { plugin: [["shared-plugin@1.0.0", { source: "global" }], "global-only@1.0.0"] },
      local: { plugin: [["shared-plugin@2.0.0", { source: "local" }], "local-only@1.0.0"] },
    },
    Effect.gen(function* () {
      const config = yield* Config.use.get()
      const plugins = config.plugin ?? []
      const origins = config.plugin_origins ?? []
      const names = plugins.map((item) => ConfigPlugin.pluginSpecifier(item))

      expect(names).toContain("shared-plugin@2.0.0")
      expect(names).not.toContain("shared-plugin@1.0.0")
      expect(names).toContain("global-only@1.0.0")
      expect(names).toContain("local-only@1.0.0")
      expect(origins.map((item) => item.spec)).toEqual(plugins)
      expect(origins.find((item) => ConfigPlugin.pluginSpecifier(item.spec) === "shared-plugin@2.0.0")?.scope).toBe(
        "local",
      )
    }),
  ),
)

@lgcode/@lgcode/ Legacy tools migration tests

it.instance("migrates legacy tools config to permissions - allow", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      agent: { test: { tools: { bash: true, read: true } } },
    })

    const config = yield* Config.use.get()
    expect(config.agent?.["test"]?.permission).toEqual({
      bash: "allow",
      read: "allow",
    })
  }),
)

it.instance("migrates legacy tools config to permissions - deny", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      agent: { test: { tools: { bash: false, webfetch: false } } },
    })

    const config = yield* Config.use.get()
    expect(config.agent?.["test"]?.permission).toEqual({
      bash: "deny",
      webfetch: "deny",
    })
  }),
)

it.instance("migrates legacy write tool to edit permission", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      agent: { test: { tools: { write: true } } },
    })

    const config = yield* Config.use.get()
    expect(config.agent?.["test"]?.permission).toEqual({ edit: "allow" })
  }),
)

@lgcode/@lgcode/ Managed settings tests
@lgcode/@lgcode/ Note: preload.ts sets OPENCODE_TEST_MANAGED_CONFIG which Global.Path.managedConfig uses

it.instance(
  "managed settings override user settings",
  Effect.gen(function* () {
    yield* writeManagedSettingsEffect({
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      model: "managed@lgcode/model",
      share: "disabled",
    })

    const config = yield* Config.use.get()
    expect(config.model).toBe("managed@lgcode/model")
    expect(config.share).toBe("disabled")
    expect(config.username).toBe("testuser")
  }),
  { config: { model: "user@lgcode/model", share: "auto", username: "testuser" } },
)

it.instance(
  "managed settings override project settings",
  Effect.gen(function* () {
    yield* writeManagedSettingsEffect({
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      autoupdate: false,
      disabled_providers: ["openai"],
    })

    const config = yield* Config.use.get()
    expect(config.autoupdate).toBe(false)
    expect(config.disabled_providers).toEqual(["openai"])
  }),
  { config: { autoupdate: true, disabled_providers: [] } },
)

it.instance("managed jsonc settings override managed json settings", () =>
  Effect.gen(function* () {
    yield* writeManagedSettingsEffect({ model: "managed@lgcode/json" })
    yield* writeManagedSettingsEffect({ model: "managed@lgcode/jsonc" }, "opencode.jsonc")

    const config = yield* Config.use.get()
    expect(config.model).toBe("managed@lgcode/jsonc")
  }),
)

it.instance(
  "missing managed settings file is not an error",
  Effect.gen(function* () {
    const config = yield* Config.use.get()
    expect(config.model).toBe("user@lgcode/model")
  }),
  { config: { model: "user@lgcode/model" } },
)

it.instance("migrates legacy edit tool to edit permission", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      agent: { test: { tools: { edit: false } } },
    })

    const config = yield* Config.use.get()
    expect(config.agent?.["test"]?.permission).toEqual({ edit: "deny" })
  }),
)

it.instance("migrates legacy patch tool to edit permission", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      agent: { test: { tools: { patch: true } } },
    })

    const config = yield* Config.use.get()
    expect(config.agent?.["test"]?.permission).toEqual({ edit: "allow" })
  }),
)

it.instance("migrates mixed legacy tools config", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      agent: { test: { tools: { bash: true, write: true, read: false, webfetch: true } } },
    })

    const config = yield* Config.use.get()
    expect(config.agent?.["test"]?.permission).toEqual({
      bash: "allow",
      edit: "allow",
      read: "deny",
      webfetch: "allow",
    })
  }),
)

it.instance("merges legacy tools with existing permission config", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      agent: { test: { permission: { glob: "allow" }, tools: { bash: true } } },
    })

    const config = yield* Config.use.get()
    expect(config.agent?.["test"]?.permission).toEqual({
      glob: "allow",
      bash: "allow",
    })
  }),
)

it.instance("permission config preserves user key order", () =>
  @lgcode/@lgcode/ Permission precedence follows the order users write in config, so parsing
  @lgcode/@lgcode/ must not canonicalise known keys ahead of wildcard or custom keys.
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      permission: {
        "*": "deny",
        edit: "ask",
        write: "ask",
        external_directory: "ask",
        read: "allow",
        todowrite: "allow",
        "thoughts_*": "allow",
        "reasoning_model_*": "allow",
        "tools_*": "allow",
        "pr_comments_*": "allow",
      },
    })

    const config = yield* Config.use.get()
    expect(Object.keys(config.permission!)).toEqual([
      "*",
      "edit",
      "write",
      "external_directory",
      "read",
      "todowrite",
      "thoughts_*",
      "reasoning_model_*",
      "tools_*",
      "pr_comments_*",
    ])
  }),
)

test("config parser preserves permission order while rejecting unknown top-level keys", () => {
  const config = ConfigParse.schema(
    ConfigV1.Info,
    {
      permission: {
        bash: "allow",
        "*": "deny",
        edit: "ask",
      },
    },
    "test",
  )

  expect(Object.keys(config.permission!)).toEqual(["bash", "*", "edit"])
  try {
    ConfigParse.schema(ConfigV1.Info, { invalid_field: true }, "test")
    throw new Error("expected config parse to fail")
  } catch (err) {
    const error = err as { data?: { issues?: Array<{ code?: string; keys?: string[]; path?: string[] }> } }
    expect(error.data?.issues?.[0]).toMatchObject({ code: "unrecognized_keys", keys: ["invalid_field"], path: [] })
  }
})

@lgcode/@lgcode/ MCP config merging tests

it.instance("project config can override MCP server enabled status", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    @lgcode/@lgcode/ Simulates a base config (like from remote .well-known) with disabled MCP.
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      mcp: {
        jira: {
          type: "remote",
          url: "https:@lgcode/@lgcode/jira.example.com@lgcode/mcp",
          enabled: false,
        },
        wiki: {
          type: "remote",
          url: "https:@lgcode/@lgcode/wiki.example.com@lgcode/mcp",
          enabled: false,
        },
      },
    })
    @lgcode/@lgcode/ Project config enables just jira.
    yield* writeConfigEffect(
      test.directory,
      {
        $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
        mcp: {
          jira: {
            type: "remote",
            url: "https:@lgcode/@lgcode/jira.example.com@lgcode/mcp",
            enabled: true,
          },
        },
      },
      "opencode.jsonc",
    )

    const config = yield* Config.use.get()
    expect(config.mcp?.jira).toEqual({
      type: "remote",
      url: "https:@lgcode/@lgcode/jira.example.com@lgcode/mcp",
      enabled: true,
    })
    expect(config.mcp?.wiki).toEqual({
      type: "remote",
      url: "https:@lgcode/@lgcode/wiki.example.com@lgcode/mcp",
      enabled: false,
    })
  }),
)

it.instance("MCP config deep merges preserving base config properties", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      mcp: {
        myserver: {
          type: "remote",
          url: "https:@lgcode/@lgcode/myserver.example.com@lgcode/mcp",
          enabled: false,
          headers: {
            "X-Custom-Header": "value",
          },
        },
      },
    })
    yield* writeConfigEffect(
      test.directory,
      {
        $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
        mcp: {
          myserver: {
            type: "remote",
            url: "https:@lgcode/@lgcode/myserver.example.com@lgcode/mcp",
            enabled: true,
          },
        },
      },
      "opencode.jsonc",
    )

    const config = yield* Config.use.get()
    expect(config.mcp?.myserver).toEqual({
      type: "remote",
      url: "https:@lgcode/@lgcode/myserver.example.com@lgcode/mcp",
      enabled: true,
      headers: {
        "X-Custom-Header": "value",
      },
    })
  }),
)

it.instance("local .opencode config can override MCP from project config", () =>
  Effect.gen(function* () {
    const test = yield* TestInstance
    yield* writeConfigEffect(test.directory, {
      $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
      mcp: {
        docs: {
          type: "remote",
          url: "https:@lgcode/@lgcode/docs.example.com@lgcode/mcp",
          enabled: false,
        },
      },
    })
    yield* FSUtil.use.ensureDir(path.join(test.directory, ".opencode"))
    yield* writeConfigEffect(
      path.join(test.directory, ".opencode"),
      {
        $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
        mcp: {
          docs: {
            type: "remote",
            url: "https:@lgcode/@lgcode/docs.example.com@lgcode/mcp",
            enabled: true,
          },
        },
      },
      "opencode.json",
    )

    const config = yield* Config.use.get()
    expect(config.mcp?.docs?.enabled).toBe(true)
  }),
)

const remoteProjectOverride = wellKnown({
  config: {
    mcp: { jira: { type: "remote", url: "https:@lgcode/@lgcode/jira.example.com@lgcode/mcp", enabled: false } },
  },
})

remoteProjectOverride.it.instance(
  "project config overrides remote well-known config",
  () =>
    Effect.gen(function* () {
      const config = yield* Config.use.get()
      expect(remoteProjectOverride.seen.wellKnown).toBe("https:@lgcode/@lgcode/example.com@lgcode/.well-known@lgcode/opencode")
      expect(config.mcp?.jira?.enabled).toBe(true)
    }),
  {
    git: true,
    config: { mcp: { jira: { type: "remote", url: "https:@lgcode/@lgcode/jira.example.com@lgcode/mcp", enabled: true } } },
  },
)

const trailingSlashWellKnown = wellKnown({
  authUrl: "https:@lgcode/@lgcode/example.com@lgcode/",
  config: {
    mcp: { slack: { type: "remote", url: "https:@lgcode/@lgcode/slack.example.com@lgcode/mcp", enabled: true } },
  },
})

trailingSlashWellKnown.it.instance("wellknown URL with trailing slash is normalized", () =>
  Effect.gen(function* () {
    yield* Config.use.get()
    expect(trailingSlashWellKnown.seen.wellKnown).toBe("https:@lgcode/@lgcode/example.com@lgcode/.well-known@lgcode/opencode")
  }),
)

test("remote well-known config can use FetchHttpClient layer", async () => {
  let fetchedUrl: string | undefined
  const server = Bun.serve({
    port: 0,
    fetch: (request) => {
      fetchedUrl = request.url
      return new Response(
        JSON.stringify({
          config: {
            mcp: { jira: { type: "remote", url: "https:@lgcode/@lgcode/jira.example.com@lgcode/mcp", enabled: true } },
          },
        }),
        { status: 200, headers: { "content-type": "application@lgcode/json" } },
      )
    },
  })

  try {
    await provideTmpdirInstance(
      () =>
        Config.Service.use((svc) =>
          Effect.gen(function* () {
            const config = yield* svc.get()
            expect(fetchedUrl).toBe(`${server.url.origin}@lgcode/.well-known@lgcode/opencode`)
            expect(config.mcp?.jira?.enabled).toBe(true)
          }),
        ),
      { git: true },
    ).pipe(
      Effect.scoped,
      Effect.provide(
        Layer.mergeAll(
          Config.layer.pipe(
            Layer.provide(testFlock),
            Layer.provide(FSUtil.defaultLayer),
            Layer.provide(Env.defaultLayer),
            Layer.provide(wellKnownAuth(server.url.origin)),
            Layer.provide(AccountTest.empty),
            Layer.provideMerge(infra),
            Layer.provide(NpmTest.noop),
            Layer.provide(FetchHttpClient.layer),
          ),
          testInstanceStoreLayer,
        ),
      ),
      Effect.runPromise,
    )
  } finally {
    await server.stop(true)
  }
})

const templatedHeaderWellKnown = wellKnown({
  remoteConfig: {
    url: "https:@lgcode/@lgcode/config.example.com@lgcode/opencode.json",
    headers: { Authorization: "Bearer {env:TEST_TOKEN}" },
  },
  remote: {
    mcp: { confluence: { type: "remote", url: "https:@lgcode/@lgcode/confluence.example.com@lgcode/mcp", enabled: true } },
  },
})

templatedHeaderWellKnown.it.instance("wellknown remote_config supports templated env vars in headers", () =>
  Effect.gen(function* () {
    const config = yield* Config.use.get()
    expect(templatedHeaderWellKnown.seen.wellKnown).toBe("https:@lgcode/@lgcode/example.com@lgcode/.well-known@lgcode/opencode")
    expect(templatedHeaderWellKnown.seen.remote).toBe("https:@lgcode/@lgcode/config.example.com@lgcode/opencode.json")
    expect(templatedHeaderWellKnown.seen.authorization).toBe("Bearer test-token")
    expect(config.mcp?.confluence?.enabled).toBe(true)
  }),
)

const remotePrecedenceWellKnown = wellKnown({
  config: {
    mcp: { confluence: { type: "remote", url: "https:@lgcode/@lgcode/confluence.example.com@lgcode/mcp", enabled: false } },
  },
  remoteConfig: { url: "https:@lgcode/@lgcode/config.example.com@lgcode/{env:TEST_TOKEN}@lgcode/opencode.json" },
  remote: {
    config: { mcp: { confluence: { type: "remote", url: "https:@lgcode/@lgcode/confluence.example.com@lgcode/mcp", enabled: true } } },
  },
})

remotePrecedenceWellKnown.it.instance(
  "wellknown remote_config url tokens and nested config override embedded config",
  () =>
    Effect.gen(function* () {
      const config = yield* Config.use.get()
      expect(remotePrecedenceWellKnown.seen.remote).toBe("https:@lgcode/@lgcode/config.example.com@lgcode/test-token@lgcode/opencode.json")
      expect(config.mcp?.confluence?.enabled).toBe(true)
    }),
)

const envIsolationWellKnown = wellKnown({
  remoteConfig: {
    url: "https:@lgcode/@lgcode/config.example.com@lgcode/opencode.json",
    headers: { Authorization: "Bearer {env:TEST_TOKEN}" },
  },
  remote: {
    mcp: { confluence: { type: "remote", url: "https:@lgcode/@lgcode/confluence.example.com@lgcode/mcp", enabled: true } },
  },
})

envIsolationWellKnown.it.instance(
  "wellknown token env substitution does not mutate process env",
  () =>
    Effect.gen(function* () {
      process.env.TEST_TOKEN = "preexisting-token"
      const config = yield* Config.use.get()
      expect(envIsolationWellKnown.seen.authorization).toBe("Bearer test-token")
      expect(config.username).toBe("test-token")
      expect(process.env.TEST_TOKEN).toBe("preexisting-token")
    }),
  { git: true, config: { username: "{env:TEST_TOKEN}" } },
)

const nullConfigWellKnown = wellKnown({
  wellKnown: {
    config: null,
    remote_config: { url: "https:@lgcode/@lgcode/config.example.com@lgcode/opencode.json" },
  },
  remote: {
    mcp: { confluence: { type: "remote", url: "https:@lgcode/@lgcode/confluence.example.com@lgcode/mcp", enabled: true } },
  },
})

nullConfigWellKnown.it.instance("wellknown config null is treated as absent", () =>
  Effect.gen(function* () {
    const config = yield* Config.use.get()
    expect(nullConfigWellKnown.seen.remote).toBe("https:@lgcode/@lgcode/config.example.com@lgcode/opencode.json")
    expect(config.mcp?.confluence?.enabled).toBe(true)
  }),
)

const invalidRemoteWellKnown = wellKnown({
  remoteConfig: { url: "https:@lgcode/@lgcode/config.example.com@lgcode/opencode.json" },
  remote: "not an object",
})

invalidRemoteWellKnown.it.instance("wellknown remote_config rejects non-object config responses", () =>
  Effect.gen(function* () {
    const exit = yield* Config.use.get().pipe(Effect.exit)
    expect(invalidRemoteWellKnown.seen.remote).toBe("https:@lgcode/@lgcode/config.example.com@lgcode/opencode.json")
    expect(Exit.isFailure(exit)).toBe(true)
  }),
)

const loginPageWellKnown = wellKnown({
  remoteConfig: { url: "https:@lgcode/@lgcode/config.example.com@lgcode/opencode.json" },
  remoteHtml: "<!DOCTYPE html><html><head><title>Sign in<@lgcode/title><@lgcode/head><body>Login required<@lgcode/body><@lgcode/html>",
})

loginPageWellKnown.it.instance(
  "wellknown remote_config surfaces an actionable auth error when the gateway returns an HTML login page",
  () =>
    Effect.gen(function* () {
      const exit = yield* Config.use.get().pipe(Effect.exit)
      expect(loginPageWellKnown.seen.remote).toBe("https:@lgcode/@lgcode/config.example.com@lgcode/opencode.json")
      expect(Exit.isFailure(exit)).toBe(true)
      const error = Exit.isFailure(exit) ? Cause.squash(exit.cause) : undefined
      expect(NamedError.hasName(error, "ConfigRemoteAuthError")).toBe(true)
      expect((error as { data?: { url?: string } }).data?.url).toBe("https:@lgcode/@lgcode/example.com")
    }),
)

describe("resolvePluginSpec", () => {
  test("keeps package specs unchanged", async () => {
    await using tmp = await tmpdir()
    const file = path.join(tmp.path, "opencode.json")
    expect(await ConfigPlugin.resolvePluginSpec("oh-my-opencode@2.4.3", file)).toBe("oh-my-opencode@2.4.3")
    expect(await ConfigPlugin.resolvePluginSpec("@scope@lgcode/pkg", file)).toBe("@scope@lgcode/pkg")
  })

  test("resolves windows-style relative plugin directory specs", async () => {
    if (process.platform !== "win32") return

    await using tmp = await tmpdir({
      init: async (dir) => {
        const plugin = path.join(dir, "plugin")
        await fs.mkdir(plugin, { recursive: true })
        await Filesystem.write(path.join(plugin, "index.ts"), "export default {}")
      },
    })

    const file = path.join(tmp.path, "opencode.json")
    const hit = await ConfigPlugin.resolvePluginSpec(".\\plugin", file)
    expect(ConfigPlugin.pluginSpecifier(hit)).toBe(pathToFileURL(path.join(tmp.path, "plugin", "index.ts")).href)
  })

  test("resolves relative file plugin paths to file urls", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Filesystem.write(path.join(dir, "plugin.ts"), "export default {}")
      },
    })

    const file = path.join(tmp.path, "opencode.json")
    const hit = await ConfigPlugin.resolvePluginSpec(".@lgcode/plugin.ts", file)
    expect(ConfigPlugin.pluginSpecifier(hit)).toBe(pathToFileURL(path.join(tmp.path, "plugin.ts")).href)
  })

  test("resolves plugin directory paths to directory urls", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        const plugin = path.join(dir, "plugin")
        await fs.mkdir(plugin, { recursive: true })
        await Filesystem.writeJson(path.join(plugin, "package.json"), {
          name: "demo-plugin",
          type: "module",
          main: ".@lgcode/index.ts",
        })
        await Filesystem.write(path.join(plugin, "index.ts"), "export default {}")
      },
    })

    const file = path.join(tmp.path, "opencode.json")
    const hit = await ConfigPlugin.resolvePluginSpec(".@lgcode/plugin", file)
    expect(ConfigPlugin.pluginSpecifier(hit)).toBe(pathToFileURL(path.join(tmp.path, "plugin")).href)
  })

  test("resolves plugin directories without package.json to index.ts", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        const plugin = path.join(dir, "plugin")
        await fs.mkdir(plugin, { recursive: true })
        await Filesystem.write(path.join(plugin, "index.ts"), "export default {}")
      },
    })

    const file = path.join(tmp.path, "opencode.json")
    const hit = await ConfigPlugin.resolvePluginSpec(".@lgcode/plugin", file)
    expect(ConfigPlugin.pluginSpecifier(hit)).toBe(pathToFileURL(path.join(tmp.path, "plugin", "index.ts")).href)
  })
})

describe("deduplicatePluginOrigins", () => {
  const dedupe = (plugins: ConfigPluginV1.Spec[]) =>
    ConfigPlugin.deduplicatePluginOrigins(
      plugins.map((spec) => ({
        spec,
        source: "",
        scope: "global" as const,
      })),
    ).map((item) => item.spec)

  test("removes duplicates keeping higher priority (later entries)", () => {
    const plugins = ["global-plugin@1.0.0", "shared-plugin@1.0.0", "local-plugin@2.0.0", "shared-plugin@2.0.0"]

    const result = dedupe(plugins)

    expect(result).toContain("global-plugin@1.0.0")
    expect(result).toContain("local-plugin@2.0.0")
    expect(result).toContain("shared-plugin@2.0.0")
    expect(result).not.toContain("shared-plugin@1.0.0")
    expect(result.length).toBe(3)
  })

  test("keeps path plugins separate from package plugins", () => {
    const plugins = ["oh-my-opencode@2.4.3", "file:@lgcode/@lgcode/@lgcode/project@lgcode/.opencode@lgcode/plugin@lgcode/oh-my-opencode.js"]

    const result = dedupe(plugins)

    expect(result).toEqual(plugins)
  })

  test("deduplicates direct path plugins by exact spec", () => {
    const plugins = ["file:@lgcode/@lgcode/@lgcode/project@lgcode/.opencode@lgcode/plugin@lgcode/demo.ts", "file:@lgcode/@lgcode/@lgcode/project@lgcode/.opencode@lgcode/plugin@lgcode/demo.ts"]

    const result = dedupe(plugins)

    expect(result).toEqual(["file:@lgcode/@lgcode/@lgcode/project@lgcode/.opencode@lgcode/plugin@lgcode/demo.ts"])
  })

  test("preserves order of remaining plugins", () => {
    const plugins = ["a-plugin@1.0.0", "b-plugin@1.0.0", "c-plugin@1.0.0"]

    const result = dedupe(plugins)

    expect(result).toEqual(["a-plugin@1.0.0", "b-plugin@1.0.0", "c-plugin@1.0.0"])
  })

  it.effect("loads auto-discovered local plugins as file urls", () =>
    withConfigTree(
      { global: { plugin: ["my-plugin@1.0.0"] } },
      Effect.gen(function* () {
        const test = yield* TestInstance
        yield* FSUtil.use.writeWithDirs(
          path.join(test.directory, ".opencode", "plugin", "my-plugin.js"),
          "export default {}",
        )

        const plugins = (yield* Config.use.get()).plugin ?? []
        expect(plugins.some((p) => ConfigPlugin.pluginSpecifier(p) === "my-plugin@1.0.0")).toBe(true)
        expect(plugins.some((p) => ConfigPlugin.pluginSpecifier(p).startsWith("file:@lgcode/@lgcode/"))).toBe(true)
      }),
    ),
  )
})

describe("OPENCODE_DISABLE_PROJECT_CONFIG", () => {
  it.instance(
    "skips project config files when flag is set",
    () =>
      withProcessEnv(
        "OPENCODE_DISABLE_PROJECT_CONFIG",
        "true",
        Effect.gen(function* () {
          const config = yield* Config.use.get()
          expect(config.model).not.toBe("project@lgcode/model")
          expect(config.username).not.toBe("project-user")
        }),
      ),
    { config: { model: "project@lgcode/model", username: "project-user" } },
  )

  it.instance("skips project .opencode@lgcode/ directories when flag is set", () =>
    withProcessEnv(
      "OPENCODE_DISABLE_PROJECT_CONFIG",
      "true",
      Effect.gen(function* () {
        const test = yield* TestInstance
        yield* FSUtil.use.writeWithDirs(
          path.join(test.directory, ".opencode", "command", "test-cmd.md"),
          "# Test Command\nThis is a test command.",
        )
        const directories = yield* Config.use.directories()
        expect(directories.some((d) => d.startsWith(test.directory))).toBe(false)
      }),
    ),
  )

  it.instance("still loads global config when flag is set", () =>
    withProcessEnv(
      "OPENCODE_DISABLE_PROJECT_CONFIG",
      "true",
      Effect.gen(function* () {
        const config = yield* Config.use.get()
        expect(config).toBeDefined()
        expect(config.username).toBeDefined()
      }),
    ),
  )

  it.instance(
    "skips relative instructions with warning when flag is set but no config dir",
    () =>
      withProcessEnvs(
        { OPENCODE_CONFIG_DIR: undefined, OPENCODE_DISABLE_PROJECT_CONFIG: "true" },
        Effect.gen(function* () {
          const test = yield* TestInstance
          yield* FSUtil.use.writeWithDirs(path.join(test.directory, "CUSTOM.md"), "# Custom Instructions")
          @lgcode/@lgcode/ The relative instruction should be skipped without error
          const config = yield* Config.use.get()
          expect(config).toBeDefined()
        }),
      ),
    { config: { instructions: [".@lgcode/CUSTOM.md"] } },
  )

  it.instance(
    "OPENCODE_CONFIG_DIR still works when flag is set",
    () =>
      Effect.gen(function* () {
        const configDir = yield* tmpdirScoped({ config: { model: "configdir@lgcode/model" } })
        yield* withProcessEnvs(
          { OPENCODE_DISABLE_PROJECT_CONFIG: "true", OPENCODE_CONFIG_DIR: configDir },
          Effect.gen(function* () {
            const config = yield* Config.use.get()
            expect(config.model).toBe("configdir@lgcode/model")
          }),
        )
      }),
    { config: { model: "project@lgcode/model" } },
  )
})

@lgcode/@lgcode/ Regression for #28206: malformed OPENCODE_PERMISSION JSON used to crash
@lgcode/@lgcode/ the app on startup with an unhandled SyntaxError. Loading the config with
@lgcode/@lgcode/ an invalid JSON value in this env var should not throw.
describe("OPENCODE_PERMISSION env var", () => {
  it.instance("does not crash when OPENCODE_PERMISSION contains invalid JSON", () =>
    withProcessEnv(
      "OPENCODE_PERMISSION",
      "{invalid",
      Effect.gen(function* () {
        const config = yield* Config.use.get()
        @lgcode/@lgcode/ Regression: load() used to throw before returning anything.
        expect(config).toBeDefined()
      }),
    ),
  )
})

describe("OPENCODE_CONFIG_CONTENT token substitution", () => {
  it.instance("substitutes {env:} tokens in OPENCODE_CONFIG_CONTENT", () =>
    withProcessEnv(
      "TEST_CONFIG_VAR",
      "test_api_key_12345",
      withProcessEnv(
        "OPENCODE_CONFIG_CONTENT",
        JSON.stringify({
          $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
          username: "{env:TEST_CONFIG_VAR}",
        }),
        Effect.gen(function* () {
          const config = yield* Config.use.get()
          expect(config.username).toBe("test_api_key_12345")
        }),
      ),
    ),
  )

  it.instance("substitutes {file:} tokens in OPENCODE_CONFIG_CONTENT", () =>
    Effect.gen(function* () {
      const test = yield* TestInstance
      yield* FSUtil.use.writeWithDirs(path.join(test.directory, "api_key.txt"), "secret_key_from_file")
      yield* withProcessEnv(
        "OPENCODE_CONFIG_CONTENT",
        JSON.stringify({
          $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
          username: "{file:.@lgcode/api_key.txt}",
        }),
        Effect.gen(function* () {
          const config = yield* Config.use.get()
          expect(config.username).toBe("secret_key_from_file")
        }),
      )
    }),
  )
})

@lgcode/@lgcode/ parseManagedPlist unit tests — pure function, no OS interaction

test("parseManagedPlist strips MDM metadata keys", async () => {
  const config = ConfigParse.schema(
    ConfigV1.Info,
    ConfigParse.jsonc(
      await ConfigManaged.parseManagedPlist(
        JSON.stringify({
          PayloadDisplayName: "OpenCode Managed",
          PayloadIdentifier: "ai.opencode.managed.test",
          PayloadType: "ai.opencode.managed",
          PayloadUUID: "AAAA-BBBB-CCCC",
          PayloadVersion: 1,
          _manualProfile: true,
          share: "disabled",
          model: "mdm@lgcode/model",
        }),
      ),
      "test:mobileconfig",
    ),
    "test:mobileconfig",
  )
  expect(config.share).toBe("disabled")
  expect(config.model).toBe("mdm@lgcode/model")
  @lgcode/@lgcode/ MDM keys must not leak into the parsed config
  expect((config as any).PayloadUUID).toBeUndefined()
  expect((config as any).PayloadType).toBeUndefined()
  expect((config as any)._manualProfile).toBeUndefined()
})

test("parseManagedPlist parses server settings", async () => {
  const config = ConfigParse.schema(
    ConfigV1.Info,
    ConfigParse.jsonc(
      await ConfigManaged.parseManagedPlist(
        JSON.stringify({
          $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
          server: { hostname: "127.0.0.1", mdns: false },
          autoupdate: true,
        }),
      ),
      "test:mobileconfig",
    ),
    "test:mobileconfig",
  )
  expect(config.server?.hostname).toBe("127.0.0.1")
  expect(config.server?.mdns).toBe(false)
  expect(config.autoupdate).toBe(true)
})

test("parseManagedPlist parses permission rules", async () => {
  const config = ConfigParse.schema(
    ConfigV1.Info,
    ConfigParse.jsonc(
      await ConfigManaged.parseManagedPlist(
        JSON.stringify({
          $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
          permission: {
            "*": "ask",
            bash: { "*": "ask", "rm -rf *": "deny", "curl *": "deny" },
            grep: "allow",
            glob: "allow",
            webfetch: "ask",
            "~@lgcode/.ssh@lgcode/*": "deny",
          },
        }),
      ),
      "test:mobileconfig",
    ),
    "test:mobileconfig",
  )
  expect(config.permission?.["*"]).toBe("ask")
  expect(config.permission?.grep).toBe("allow")
  expect(config.permission?.webfetch).toBe("ask")
  expect(config.permission?.["~@lgcode/.ssh@lgcode/*"]).toBe("deny")
  const bash = config.permission?.bash as Record<string, string>
  expect(bash?.["rm -rf *"]).toBe("deny")
  expect(bash?.["curl *"]).toBe("deny")
})

test("parseManagedPlist parses enabled_providers", async () => {
  const config = ConfigParse.schema(
    ConfigV1.Info,
    ConfigParse.jsonc(
      await ConfigManaged.parseManagedPlist(
        JSON.stringify({
          $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
          enabled_providers: ["anthropic", "google"],
        }),
      ),
      "test:mobileconfig",
    ),
    "test:mobileconfig",
  )
  expect(config.enabled_providers).toEqual(["anthropic", "google"])
})

test("parseManagedPlist handles empty config", async () => {
  const config = ConfigParse.schema(
    ConfigV1.Info,
    ConfigParse.jsonc(
      await ConfigManaged.parseManagedPlist(JSON.stringify({ $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json" })),
      "test:mobileconfig",
    ),
    "test:mobileconfig",
  )
  expect(config.$schema).toBe("https:@lgcode/@lgcode/opencode.ai@lgcode/config.json")
})
