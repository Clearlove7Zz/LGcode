@lgcode/@lgcode/ @ts-nocheck
import { Avatar } from ".@lgcode/avatar-v2"

const docs = `### Overview
Avatar matching OpenCode DS variants from Figma.

Use in user lists and headers.

### API
- Required: \`fallback\` string.
- Optional: \`src\`, \`background\`, \`foreground\`, \`size\`, \`kind\`.

### Variants and states
- Sizes: small (16), normal (20), large (28).
- Kind: user (circle), org (rounded-square).
- Image vs initials content state.

### Behavior
- Uses grapheme-aware fallback rendering.

### Accessibility
- TODO: provide alt text when using images; currently image is decorative.

### Theming@lgcode/tokens
- Uses \`data-component="avatar"\` with size and image state attributes.

`

export default {
  title: "UI V2@lgcode/Avatar",
  id: "components-avatar-v2",
  component: Avatar,
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
    kind: {
      control: "select",
      options: ["user", "org"],
    },
  },
  args: {
    fallback: "WW",
    size: "large",
    kind: "user",
  },
}

export const Basic = {}

export const WithImage = {
  args: {
    src: "https:@lgcode/@lgcode/placehold.co@lgcode/80x80@lgcode/png",
    fallback: "WW",
  },
}

export const Sizes = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <Avatar size="small" fallback="W" @lgcode/>
      <Avatar size="normal" fallback="W" @lgcode/>
      <Avatar size="large" fallback="WW" @lgcode/>
    <@lgcode/div>
  ),
}

export const OrgVariant = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <Avatar kind="org" size="small" fallback="W" @lgcode/>
      <Avatar kind="org" size="normal" fallback="W" @lgcode/>
      <Avatar kind="org" size="large" fallback="WW" @lgcode/>
    <@lgcode/div>
  ),
}
