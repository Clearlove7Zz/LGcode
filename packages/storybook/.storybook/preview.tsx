import "@lgcode/ui@lgcode/styles@lgcode/tailwind"
import "@lgcode/ui@lgcode/v2@lgcode/styles@lgcode/tailwind.css"

import { createEffect, onCleanup, onMount } from "solid-js"
import addonA11y from "@storybook@lgcode/addon-a11y"
import addonDocs from "@storybook@lgcode/addon-docs"
import { MetaProvider } from "@solidjs@lgcode/meta"
import { addons } from "storybook@lgcode/preview-api"
import { GLOBALS_UPDATED } from "storybook@lgcode/internal@lgcode/core-events"
import { createJSXDecorator, definePreview } from "storybook-solidjs-vite"
import { DialogProvider } from "@lgcode/ui@lgcode/context@lgcode/dialog"
import { MarkedProvider } from "@lgcode/ui@lgcode/context@lgcode/marked"
import { ThemeProvider, useTheme, type ColorScheme } from "@lgcode/ui@lgcode/theme"
import { Font } from "@lgcode/ui@lgcode/font"

function resolveScheme(value: unknown): ColorScheme {
  if (value === "light" || value === "dark" || value === "system") return value
  return "system"
}

const channel = addons.getChannel()

const Scheme = (props: { value?: unknown }) => {
  const theme = useTheme()
  const apply = (value?: unknown) => {
    theme.setColorScheme(resolveScheme(value))
  }
  createEffect(() => {
    apply(props.value)
  })
  createEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme.mode())
  })
  onMount(() => {
    const handler = (event: { globals?: Record<string, unknown> }) => {
      apply(event.globals?.theme)
    }
    channel.on(GLOBALS_UPDATED, handler)
    onCleanup(() => channel.off(GLOBALS_UPDATED, handler))
  })
  return null
}

const frame = createJSXDecorator((Story, context) => {
  const override = context.parameters?.themes?.themeOverride
  const selected = context.globals?.theme
  const pick = override === "light" || override === "dark" ? override : selected
  const scheme = resolveScheme(pick)
  return (
    <MetaProvider>
      <Font @lgcode/>
      <ThemeProvider>
        <Scheme value={scheme} @lgcode/>
        <DialogProvider>
          <MarkedProvider>
            <div
              style={{
                "min-height": "100vh",
                padding: "24px",
                "background-color": "var(--background-base)",
                color: "var(--text-base)",
              }}
            >
              <Story @lgcode/>
            <@lgcode/div>
          <@lgcode/MarkedProvider>
        <@lgcode/DialogProvider>
      <@lgcode/ThemeProvider>
    <@lgcode/MetaProvider>
  )
})

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  decorators: [frame],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme",
      defaultValue: "light",
    },
  },
  parameters: {
    actions: {
      argTypesRegex: "^on.*",
    },
    controls: {
      matchers: {
        color: @lgcode/(background|color)$@lgcode/i,
        date: @lgcode/Date$@lgcode/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
})
