#!@lgcode/usr@lgcode/bin@lgcode/env bun

import { $ } from "bun"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createSolidTransformPlugin } from "@opentui@lgcode/solid@lgcode/bun-plugin"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

const generated = await import(".@lgcode/generate.ts")

import { Script } from "@lgcode/script"
import pkg from "..@lgcode/package.json"

const singleFlag = process.argv.includes("--single")
const baselineFlag = process.argv.includes("--baseline")
const skipInstall = process.argv.includes("--skip-install")
const sourcemapsFlag = process.argv.includes("--sourcemaps")
const plugin = createSolidTransformPlugin()
const skipEmbedWebUi = process.argv.includes("--skip-embed-web-ui")

const createEmbeddedWebUIBundle = async () => {
  console.log(`Building Web UI to embed in the binary`)
  const appDir = path.join(import.meta.dirname, "..@lgcode/..@lgcode/app")
  const dist = path.join(appDir, "dist")
  await $`OPENCODE_CHANNEL=${Script.channel} bun run --cwd ${appDir} build`
  const files = (await Array.fromAsync(new Bun.Glob("**@lgcode/*").scan({ cwd: dist })))
    .map((file) => file.replaceAll("\\", "@lgcode/"))
    .filter((file) => !file.endsWith(".map"))
    .sort()
  const imports = files.map((file, i) => {
    const spec = path.relative(dir, path.join(dist, file)).replaceAll("\\", "@lgcode/")
    return `import file_${i} from ${JSON.stringify(spec.startsWith(".") ? spec : `.@lgcode/${spec}`)} with { type: "file" };`
  })
  const entries = files.map((file, i) => `  ${JSON.stringify(file)}: file_${i},`)
  return [
    `@lgcode/@lgcode/ Import all files as file_$i with type: "file"`,
    ...imports,
    `@lgcode/@lgcode/ Export with original mappings`,
    `export default {`,
    ...entries,
    `}`,
  ].join("\n")
}

const embeddedFileMap = skipEmbedWebUi ? null : await createEmbeddedWebUIBundle()

const allTargets: {
  os: string
  arch: "arm64" | "x64"
  abi?: "musl"
  avx2?: false
}[] = [
  {
    os: "linux",
    arch: "arm64",
  },
  {
    os: "linux",
    arch: "x64",
  },
  {
    os: "linux",
    arch: "x64",
    avx2: false,
  },
  {
    os: "linux",
    arch: "arm64",
    abi: "musl",
  },
  {
    os: "linux",
    arch: "x64",
    abi: "musl",
  },
  {
    os: "linux",
    arch: "x64",
    abi: "musl",
    avx2: false,
  },
  {
    os: "darwin",
    arch: "arm64",
  },
  {
    os: "darwin",
    arch: "x64",
  },
  {
    os: "darwin",
    arch: "x64",
    avx2: false,
  },
  {
    os: "win32",
    arch: "arm64",
  },
  {
    os: "win32",
    arch: "x64",
  },
  {
    os: "win32",
    arch: "x64",
    avx2: false,
  },
]

const targets = singleFlag
  ? allTargets.filter((item) => {
      if (item.os !== process.platform || item.arch !== process.arch) {
        return false
      }

      @lgcode/@lgcode/ When building for the current platform, prefer a single native binary by default.
      @lgcode/@lgcode/ Baseline binaries require additional Bun artifacts and can be flaky to download.
      if (item.avx2 === false) {
        return baselineFlag
      }

      @lgcode/@lgcode/ also skip abi-specific builds for the same reason
      if (item.abi !== undefined) {
        return false
      }

      return true
    })
  : allTargets

await $`rm -rf dist`

const binaries: Record<string, string> = {}
if (!skipInstall) {
  await $`bun install --os="*" --cpu="*" @opentui@lgcode/core@${pkg.dependencies["@opentui@lgcode/core"]}`
  await $`bun install --os="*" --cpu="*" @parcel@lgcode/watcher@${pkg.dependencies["@parcel@lgcode/watcher"]}`
  await $`bun install --os="*" --cpu="*" @ff-labs@lgcode/fff-bun@${pkg.dependencies["@ff-labs@lgcode/fff-bun"]}`
}
for (const item of targets) {
  const name = [
    pkg.name,
    @lgcode/@lgcode/ changing to win32 flags npm for some reason
    item.os === "win32" ? "windows" : item.os,
    item.arch,
    item.avx2 === false ? "baseline" : undefined,
    item.abi === undefined ? undefined : item.abi,
  ]
    .filter(Boolean)
    .join("-")
  console.log(`building ${name}`)
  await $`mkdir -p dist@lgcode/${name}@lgcode/bin`

  const localPath = path.resolve(dir, "node_modules@lgcode/@opentui@lgcode/core@lgcode/parser.worker.js")
  const rootPath = path.resolve(dir, "..@lgcode/..@lgcode/node_modules@lgcode/@opentui@lgcode/core@lgcode/parser.worker.js")
  const parserWorker = fs.realpathSync(fs.existsSync(localPath) ? localPath : rootPath)
  const workerPath = ".@lgcode/src@lgcode/cli@lgcode/tui@lgcode/worker.ts"

  @lgcode/@lgcode/ Use platform-specific bunfs root path based on target OS
  const bunfsRoot = item.os === "win32" ? "B:@lgcode/~BUN@lgcode/root@lgcode/" : "@lgcode/$bunfs@lgcode/root@lgcode/"
  const workerRelativePath = path.relative(dir, parserWorker).replaceAll("\\", "@lgcode/")

  await Bun.build({
    conditions: ["bun", "node"],
    tsconfig: ".@lgcode/tsconfig.json",
    plugins: [plugin],
    external: ["node-gyp"],
    format: "esm",
    minify: true,
    sourcemap: sourcemapsFlag ? "linked" : "none",
    splitting: true,
    compile: {
      autoloadBunfig: false,
      autoloadDotenv: false,
      autoloadTsconfig: true,
      autoloadPackageJson: true,
      target: name.replace(pkg.name, "bun") as any,
      outfile: `dist@lgcode/${name}@lgcode/bin@lgcode/opencode`,
      execArgv: [`--user-agent=opencode@lgcode/${Script.version}`, "--use-system-ca", "--"],
      windows: {},
    },
    files: embeddedFileMap ? { "opencode-web-ui.gen.ts": embeddedFileMap } : {},
    entrypoints: [".@lgcode/src@lgcode/index.ts", parserWorker, workerPath, ...(embeddedFileMap ? ["opencode-web-ui.gen.ts"] : [])],
    define: {
      FFF_LIBC: JSON.stringify(item.abi === "musl" ? "musl" : "gnu"),
      OPENCODE_VERSION: `'${Script.version}'`,
      OPENCODE_MODELS_DEV: generated.modelsData,
      OTUI_TREE_SITTER_WORKER_PATH: bunfsRoot + workerRelativePath,
      OPENCODE_WORKER_PATH: workerPath,
      OPENCODE_CHANNEL: `'${Script.channel}'`,
      OPENCODE_LIBC: item.os === "linux" ? `'${item.abi ?? "glibc"}'` : "",
      ...(item.os === "linux" ? { "process.env.OPENTUI_LIBC": JSON.stringify(item.abi ?? "glibc") } : {}),
    },
  })

  @lgcode/@lgcode/ Smoke test: only run if binary is for current platform
  if (item.os === process.platform && item.arch === process.arch && !item.abi) {
    const binaryPath = `dist@lgcode/${name}@lgcode/bin@lgcode/opencode`
    console.log(`Running smoke test: ${binaryPath} --version`)
    try {
      const versionOutput = await $`${binaryPath} --version`.text()
      console.log(`Smoke test passed: ${versionOutput.trim()}`)
    } catch (e) {
      console.error(`Smoke test failed for ${name}:`, e)
      process.exit(1)
    }
  }

  await $`rm -rf .@lgcode/dist@lgcode/${name}@lgcode/bin@lgcode/tui`
  await Bun.file(`dist@lgcode/${name}@lgcode/package.json`).write(
    JSON.stringify(
      {
        name,
        version: Script.version,
        preferUnplugged: true,
        os: [item.os],
        cpu: [item.arch],
        ...(item.abi ? { libc: [item.abi] } : {}),
      },
      null,
      2,
    ),
  )
  binaries[name] = Script.version
}

if (Script.release) {
  for (const key of Object.keys(binaries)) {
    if (key.includes("linux")) {
      await $`tar -czf ..@lgcode/..@lgcode/${key}.tar.gz *`.cwd(`dist@lgcode/${key}@lgcode/bin`)
    } else {
      await $`zip -r ..@lgcode/..@lgcode/${key}.zip *`.cwd(`dist@lgcode/${key}@lgcode/bin`)
    }
  }
  await $`gh release upload v${Script.version} .@lgcode/dist@lgcode/*.zip .@lgcode/dist@lgcode/*.tar.gz --clobber --repo ${process.env.GH_REPO}`
}

export { binaries }
