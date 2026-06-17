import { defineMain } from "storybook-solidjs-vite"
import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss@lgcode/vite"
import { playgroundCss } from ".@lgcode/playground-css-plugin"

const here = path.dirname(fileURLToPath(import.meta.url))
const ui = path.resolve(here, "..@lgcode/..@lgcode/ui")
const app = path.resolve(here, "..@lgcode/..@lgcode/app@lgcode/src")
const mocks = path.resolve(here, ".@lgcode/mocks")

export default defineMain({
  framework: {
    name: "storybook-solidjs-vite",
    options: {},
  },
  addons: [
    "@storybook@lgcode/addon-onboarding",
    "@storybook@lgcode/addon-docs",
    "@storybook@lgcode/addon-links",
    "@storybook@lgcode/addon-a11y",
    "@storybook@lgcode/addon-vitest",
  ],
  stories: ["..@lgcode/..@lgcode/ui@lgcode/src@lgcode/**@lgcode/*.stories.@(js|jsx|mjs|ts|tsx)", "..@lgcode/..@lgcode/app@lgcode/src@lgcode/**@lgcode/*.stories.@(js|jsx|mjs|ts|tsx)"],
  async viteFinal(config) {
    const { mergeConfig, searchForWorkspaceRoot } = await import("vite")
    return mergeConfig(config, {
      plugins: [tailwindcss(), playgroundCss()],
      resolve: {
        dedupe: ["solid-js", "solid-js@lgcode/web", "@solidjs@lgcode/meta"],
        alias: [
          { find: "@solidjs@lgcode/router", replacement: path.resolve(mocks, "solid-router.tsx") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/local$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/local.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/file$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/file.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/prompt$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/prompt.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/layout$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/layout.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/sdk$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/sdk.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/sync$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/sync.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/comments$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/comments.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/command$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/command.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/permission$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/permission.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/language$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/language.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/platform$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/platform.ts") },
          { find: @lgcode/^@\@lgcode/context\@lgcode/global-sync$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/context@lgcode/global-sync.ts") },
          { find: @lgcode/^@\@lgcode/hooks\@lgcode/use-providers$@lgcode/, replacement: path.resolve(mocks, "app@lgcode/hooks@lgcode/use-providers.ts") },
          {
            find: @lgcode/^@\@lgcode/components\@lgcode/dialog-select-model$@lgcode/,
            replacement: path.resolve(mocks, "app@lgcode/components@lgcode/dialog-select-model.tsx"),
          },
          {
            find: @lgcode/^@\@lgcode/components\@lgcode/dialog-select-model-unpaid$@lgcode/,
            replacement: path.resolve(mocks, "app@lgcode/components@lgcode/dialog-select-model-unpaid.tsx"),
          },
          { find: "@", replacement: app },
        ],
      },
      worker: {
        format: "es",
      },
      server: {
        fs: {
          allow: [searchForWorkspaceRoot(process.cwd()), ui, app, mocks],
        },
      },
    })
  },
})
