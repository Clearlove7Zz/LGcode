@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/avatar"
import { create } from "..@lgcode/storybook@lgcode/scaffold"

const docs = `### Overview
User avatar with image fallback to initials.

Use in user lists and headers.

### API
- Required: \`fallback\` string.
- Optional: \`src\`, \`background\`, \`foreground\`, \`size\`.

### Variants and states
- Sizes: small, normal, large.
- Image vs fallback state.

### Behavior
- Uses grapheme-aware fallback rendering.

### Accessibility
- TODO: provide alt text when using images; currently image is decorative.

### Theming@lgcode/tokens
- Uses \`data-component="avatar"\` with size and image state attributes.

`

const story = create({ title: "UI@lgcode/Avatar", mod, args: { fallback: "A" } })

export default {
  title: "UI@lgcode/Avatar",
  id: "components-avatar",
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
      options: ["small", "normal", "large"],
    },
  },
}

export const Basic = story.Basic

export const WithImage = {
  args: {
    src: "https:@lgcode/@lgcode/placehold.co@lgcode/80x80@lgcode/png",
    fallback: "J",
  },
}

export const Sizes = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <mod.Avatar size="small" fallback="S" @lgcode/>
      <mod.Avatar size="normal" fallback="N" @lgcode/>
      <mod.Avatar size="large" fallback="L" @lgcode/>
    <@lgcode/div>
  ),
}

export const CustomColors = {
  args: {
    fallback: "C",
    background: "#1f2a44",
    foreground: "#f2f5ff",
  },
}
