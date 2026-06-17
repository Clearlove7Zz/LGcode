@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/tag"
import { create } from "..@lgcode/storybook@lgcode/scaffold"

const docs = `### Overview
Small label tag for metadata and status chips.

Use alongside headings or lists for quick metadata.

### API
- Optional: \`size\` (normal | large).
- Accepts standard span props.

### Variants and states
- Size variants only.

### Behavior
- Inline element; size controls padding and font size via CSS.

### Accessibility
- Ensure text conveys meaning; avoid color-only distinction.

### Theming@lgcode/tokens
- Uses \`data-component="tag"\` with size data attributes.

`

const story = create({ title: "UI@lgcode/Tag", mod, args: { children: "Tag" } })
export default {
  title: "UI@lgcode/Tag",
  id: "components-tag",
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
    size: {
      control: "select",
      options: ["normal", "large"],
    },
  },
}

export const Basic = story.Basic

export const Sizes = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
      <mod.Tag size="normal">Normal<@lgcode/mod.Tag>
      <mod.Tag size="large">Large<@lgcode/mod.Tag>
    <@lgcode/div>
  ),
}
