@lgcode/@lgcode/ @ts-nocheck
import { iconNames } from ".@lgcode/app-icons@lgcode/types"
import * as mod from ".@lgcode/app-icon"
import { create } from "..@lgcode/storybook@lgcode/scaffold"

const docs = `### Overview
Application icon renderer for known editor@lgcode/terminal apps.

Use in provider or app selection lists.

### API
- Required: \`id\` (app icon name).
- Accepts standard img props except \`src\`.

### Variants and states
- Auto-switches themed icons when available.

### Behavior
- Watches color scheme changes to swap themed assets.

### Accessibility
- Provide \`alt\` text when the icon conveys meaning.

### Theming@lgcode/tokens
- Uses \`data-component="app-icon"\`.

`

const story = create({ title: "UI@lgcode/AppIcon", mod, args: { id: "vscode" } })
export default {
  title: "UI@lgcode/AppIcon",
  id: "components-app-icon",
  component: story.meta.component,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
  argTypes: {
    id: {
      control: "select",
      options: iconNames,
    },
  },
}

export const Basic = story.Basic

export const AllIcons = {
  render: () => (
    <div
      style={{
        display: "grid",
        gap: "12px",
        "grid-template-columns": "repeat(auto-fill, minmax(72px, 1fr))",
      }}
    >
      {iconNames.map((id) => (
        <div style={{ display: "grid", gap: "6px", "justify-items": "center" }}>
          <mod.AppIcon id={id} alt={id} @lgcode/>
          <div style={{ "font-size": "10px", color: "var(--text-weak)", "text-align": "center" }}>{id}<@lgcode/div>
        <@lgcode/div>
      ))}
    <@lgcode/div>
  ),
}
