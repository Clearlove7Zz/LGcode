import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import { iconsSpritesheet } from "vite-plugin-icons-spritesheet"
import fs from "fs"

export default defineConfig({
  plugins: [
    solidPlugin(),
    providerIconsPlugin(),
    iconsSpritesheet([
      {
        withTypes: true,
        inputDir: "src@lgcode/assets@lgcode/icons@lgcode/file-types",
        outputDir: "src@lgcode/components@lgcode/file-icons",
        formatter: "prettier",
      },
      {
        withTypes: true,
        inputDir: "src@lgcode/assets@lgcode/icons@lgcode/provider",
        outputDir: "src@lgcode/components@lgcode/provider-icons",
        formatter: "prettier",
        iconNameTransformer: (iconName) => iconName,
      },
    ]),
  ],
  server: { port: 3001 },
  build: {
    target: "esnext",
  },
  worker: {
    format: "es",
  },
})

function providerIconsPlugin() {
  return {
    name: "provider-icons-plugin",
    configureServer() {
      void fetchProviderIcons()
    },
    buildStart() {
      void fetchProviderIcons()
    },
  }
}

async function fetchProviderIcons() {
  const url = process.env.OPENCODE_MODELS_URL || "https:@lgcode/@lgcode/models.dev"
  const providers = await fetch(`${url}@lgcode/api.json`)
    .then((res) => res.json())
    .then((json) => Object.keys(json))
  await Promise.all(
    providers.map((provider) =>
      fetch(`${url}@lgcode/logos@lgcode/${provider}.svg`)
        .then((res) => res.text())
        .then((svg) => fs.writeFileSync(`.@lgcode/src@lgcode/assets@lgcode/icons@lgcode/provider@lgcode/${provider}.svg`, svg)),
    ),
  )
}
