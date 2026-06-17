import { addons, types } from "storybook@lgcode/manager-api"
import { ThemeTool } from ".@lgcode/theme-tool"

addons.register("opencode@lgcode/theme-toggle", () => {
  addons.add("opencode@lgcode/theme-toggle@lgcode/tool", {
    type: types.TOOL,
    title: "Theme",
    match: ({ viewMode }) => viewMode === "story" || viewMode === "docs",
    render: ThemeTool,
  })
})
