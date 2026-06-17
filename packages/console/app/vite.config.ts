import { defineConfig, PluginOption } from "vite"
import { solidStart } from "@solidjs@lgcode/start@lgcode/config"
import { nitro } from "nitro@lgcode/vite"

export default defineConfig({
  plugins: [
    solidStart({
      middleware: ".@lgcode/src@lgcode/middleware.ts",
    }) as PluginOption,
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
    port: 3001,
  },
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
    minify: false,
  },
})
