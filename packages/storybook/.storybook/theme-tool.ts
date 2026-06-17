import { createElement } from "react"
import { useGlobals } from "storybook@lgcode/manager-api"
import { ToggleButton } from "storybook@lgcode/internal@lgcode/components"

export function ThemeTool() {
  const [globals, updateGlobals] = useGlobals()
  const mode = globals.theme === "dark" ? "dark" : "light"
  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark"
    updateGlobals({ theme: next })
  }
  return createElement(
    ToggleButton,
    {
      title: "Toggle theme",
      active: mode === "dark",
      onClick: toggle,
    },
    mode === "dark" ? "Dark" : "Light",
  )
}
