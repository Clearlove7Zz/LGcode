import { defineConfig, PluginOption } from "vite"
import { solidStart } from "@solidjs@lgcode/start@lgcode/config"
import { nitro } from "nitro@lgcode/vite"

export default defineConfig({
  plugins: [
    solidStart() as PluginOption,
    nitro({
      compatibilityDate: "2024-09-19",
      preset: "cloudflare_module",
      cloudflare: {
        nodeCompat: true,
      },
    }),
  ],
  server: {
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
    minify: false,
  },
})
