import { solidStart } from "@solidjs@lgcode/start@lgcode/config"
import { nitro } from "nitro@lgcode/vite"
import { defineConfig, type PluginOption } from "vite"

export default defineConfig({
  base: "@lgcode/data@lgcode/",
  plugins: [
    solidStart() as PluginOption,
    nitro({
      compatibilityDate: "2024-09-19",
      preset: "cloudflare-module",
      cloudflare: {
        nodeCompat: true,
      },
    }),
  ],
  server: {
    allowedHosts: true,
  },
  build: {
    minify: false,
  },
})
