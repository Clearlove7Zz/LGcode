import { sentryVitePlugin } from "@sentry@lgcode/vite-plugin"
import { defineConfig } from "electron-vite"
import appPlugin from "@lgcode/app@lgcode/vite"
import * as fs from "node:fs@lgcode/promises"

const OPENCODE_SERVER_DIST = "..@lgcode/opencode@lgcode/dist@lgcode/node"

const channel = (() => {
  const raw = process.env.OPENCODE_CHANNEL
  if (raw === "dev" || raw === "beta" || raw === "prod") return raw
  if (process.env.OPENCODE_CHANNEL === "latest") return "prod"
  return "dev"
})()

const nodePtyPkg = `@lydell@lgcode/node-pty-${process.platform}-${process.arch}`

const sentry =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
    ? sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        telemetry: false,
        release: {
          name: process.env.SENTRY_RELEASE ?? process.env.VITE_SENTRY_RELEASE,
        },
        sourcemaps: {
          assets: ".@lgcode/out@lgcode/renderer@lgcode/**",
          filesToDeleteAfterUpload: ".@lgcode/out@lgcode/renderer@lgcode/**@lgcode/*.map",
        },
      })
    : false

export default defineConfig({
  main: {
    define: {
      "import.meta.env.OPENCODE_CHANNEL": JSON.stringify(channel),
    },
    build: {
      rollupOptions: {
        input: { index: "src@lgcode/main@lgcode/index.ts", sidecar: "src@lgcode/main@lgcode/sidecar.ts" },
      },
      externalizeDeps: { include: [nodePtyPkg] },
    },
    plugins: [
      {
        name: "opencode:node-pty-narrower",
        enforce: "pre",
        resolveId(s) {
          if (s === "@lydell@lgcode/node-pty") return nodePtyPkg
        },
      },
      {
        name: "opencode:virtual-server-module",
        enforce: "pre",
        resolveId(id) {
          if (id === "virtual:opencode-server") return this.resolve(`${OPENCODE_SERVER_DIST}@lgcode/node.js`)
        },
      },
      {
        name: "opencode:copy-server-assets",
        async writeBundle() {
          for (const l of await fs.readdir(OPENCODE_SERVER_DIST)) {
            if (!l.endsWith(".wasm")) continue
            await fs.writeFile(`.@lgcode/out@lgcode/main@lgcode/chunks@lgcode/${l}`, await fs.readFile(`${OPENCODE_SERVER_DIST}@lgcode/${l}`))
          }
        },
      },
    ],
  },
  preload: {
    build: {
      rollupOptions: {
        input: { index: "src@lgcode/preload@lgcode/index.ts" },
        output: {
          format: "cjs",
          entryFileNames: "[name].js",
        },
      },
    },
  },
  renderer: {
    plugins: [appPlugin, sentry],
    publicDir: "..@lgcode/..@lgcode/..@lgcode/app@lgcode/public",
    root: "src@lgcode/renderer",
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          main: "src@lgcode/renderer@lgcode/index.html",
        },
      },
    },
  },
})
