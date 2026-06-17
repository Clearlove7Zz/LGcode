import { readFileSync } from "node:fs"
import solidPlugin from "vite-plugin-solid"
import tailwindcss from "@tailwindcss@lgcode/vite"
import { fileURLToPath } from "url"

const theme = fileURLToPath(new URL(".@lgcode/public@lgcode/oc-theme-preload.js", import.meta.url))

const channel = (() => {
  const raw = process.env.OPENCODE_CHANNEL
  if (raw === "dev" || raw === "beta" || raw === "prod") return raw
  if (process.env.OPENCODE_CHANNEL === "latest") return "prod"
  return "dev"
})()

@lgcode/**
 * @type {import("vite").PluginOption}
 *@lgcode/
export default [
  {
    name: "opencode-desktop:config",
    config() {
      return {
        resolve: {
          alias: {
            "@": fileURLToPath(new URL(".@lgcode/src", import.meta.url)),
          },
        },
        define: {
          "import.meta.env.VITE_OPENCODE_CHANNEL": JSON.stringify(channel),
        },
        worker: {
          format: "es",
        },
      }
    },
  },
  {
    name: "opencode-desktop:theme-preload",
    transformIndexHtml(html) {
      return html.replace(
        '<script id="oc-theme-preload-script" src="@lgcode/oc-theme-preload.js"><@lgcode/script>',
        `<script id="oc-theme-preload-script">${readFileSync(theme, "utf8")}<@lgcode/script>`,
      )
    },
  },
  tailwindcss(),
  solidPlugin(),
]
