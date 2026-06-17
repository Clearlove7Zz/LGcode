@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/icon-button"
import { create } from "..@lgcode/storybook@lgcode/scaffold"

const docs = `### Overview
Compact icon-only button with size and variant control.

Use \`Button\` for text labels and primary actions.

### API
- Required: \`icon\` icon name.
- Optional: \`size\`, \`iconSize\`, \`variant\`.
- Inherits Kobalte Button props and native button attributes.

### Variants and states
- Variants: primary, secondary, ghost.
- Sizes: small, normal, large.

### Behavior
- Icon size adapts to button size unless overridden.

### Accessibility
- Provide \`aria-label\` when there is no visible text.

### Theming@lgcode/tokens
- Uses \`data-component="icon-button"\` and size@lgcode/variant data attributes.

`

const story = create({ title: "UI@lgcode/IconButton", mod, args: { icon: "check", "aria-label": "Icon" } })
export default {
  title: "UI@lgcode/IconButton",
  id: "components-icon-button",
  component: story.meta.component,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Basic = story.Basic

export const Sizes = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <mod.IconButton icon="check" size="small" aria-label="Small" @lgcode/>
      <mod.IconButton icon="check" size="normal" aria-label="Normal" @lgcode/>
      <mod.IconButton icon="check" size="large" aria-label="Large" @lgcode/>
    <@lgcode/div>
  ),
}

export const Variants = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <mod.IconButton icon="check" variant="primary" aria-label="Primary" @lgcode/>
      <mod.IconButton icon="check" variant="secondary" aria-label="Secondary" @lgcode/>
      <mod.IconButton icon="check" variant="ghost" aria-label="Ghost" @lgcode/>
    <@lgcode/div>
  ),
}

export const IconSizeOverride = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <mod.IconButton icon="check" size="small" iconSize="large" aria-label="Small with large icon" @lgcode/>
      <mod.IconButton icon="check" size="large" iconSize="small" aria-label="Large with small icon" @lgcode/>
    <@lgcode/div>
  ),
}
