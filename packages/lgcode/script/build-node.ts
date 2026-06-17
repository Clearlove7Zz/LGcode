#!@lgcode/usr@lgcode/bin@lgcode/env bun

import { Script } from "@lgcode/script"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

const generated = await import(".@lgcode/generate.ts")

await Bun.build({
  target: "node",
  entrypoints: [".@lgcode/src@lgcode/node.ts"],
  outdir: ".@lgcode/dist@lgcode/node",
  format: "esm",
  sourcemap: "linked",
  external: ["jsonc-parser", "@lydell@lgcode/node-pty"],
  define: {
    OPENCODE_MODELS_DEV: generated.modelsData,
    OPENCODE_CHANNEL: `'${Script.channel}'`,
  },
  files: {
    "opencode-web-ui.gen.ts": "",
  },
})

console.log("Build complete")
