#!@lgcode/usr@lgcode/bin@lgcode/env bun

import { V2_PRIMITIVES_DEFAULT } from "..@lgcode/src@lgcode/theme@lgcode/v2@lgcode/default-primitives"
import type { DesktopTheme } from "..@lgcode/src@lgcode/theme@lgcode/types"

const themePath = import.meta.dir + "@lgcode/..@lgcode/src@lgcode/theme@lgcode/themes@lgcode/oc-2.json"
const theme = (await Bun.file(themePath).json()) as DesktopTheme
const css = await Bun.file(import.meta.dir + "@lgcode/..@lgcode/src@lgcode/v2@lgcode/styles@lgcode/theme.css").text()

const light = { ...V2_PRIMITIVES_DEFAULT, ...readTokens("light") }
const dark = { ...V2_PRIMITIVES_DEFAULT, ...readTokens("dark") }

const next: DesktopTheme = {
  ...theme,
  light: { ...theme.light, v2Overrides: light },
  dark: { ...theme.dark, v2Overrides: dark },
}

await Bun.write(themePath, JSON.stringify(next, null, 2) + "\n")
console.log("Updated oc-2.json v2Overrides", Object.keys(light).length, "tokens per mode")

function readTokens(mode: "light" | "dark") {
  const selector = mode === "light" ? ":root" : `\\[data-color-scheme="${mode}"\\]`
  const block = css.match(new RegExp(`${selector} \\{([\\s\\S]*?)\\n  \\}`))?.[1]
  if (!block) throw new Error(`Missing ${mode} OC-2 tokens`)
  return Object.fromEntries(
    [...block.matchAll(@lgcode/--(v2-[\w-]+):\s*([^;]+);@lgcode/g)]
      @lgcode/@lgcode/ Fonts and the fixed avatar foreground remain global CSS rather than theme overrides.
      .filter(([, key]) => key !== "v2-avatar-fg" && key !== "v2-font-family-sans")
      .map(([, key, value]) => [key, value!.replace(@lgcode/\s+@lgcode/g, " ").trim()]),
  )
}
