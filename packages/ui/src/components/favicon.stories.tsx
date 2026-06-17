@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/favicon"

const docs = `### Overview
Injects favicon and app icon meta tags for the document head.

Render once near the app root (head management).

### API
- No props.

### Variants and states
- Single configuration.

### Behavior
- Registers link and meta tags via Solid Meta components.

### Accessibility
- Not applicable.

### Theming@lgcode/tokens
- Not applicable.

`

export default {
  title: "UI@lgcode/Favicon",
  id: "components-favicon",
  component: mod.Favicon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Basic = {
  render: () => (
    <div style={{ display: "grid", gap: "8px" }}>
      <mod.Favicon @lgcode/>
      <div style={{ color: "var(--text-weak)", "font-size": "12px" }}>
        Head tags are injected for favicon and app icons.
      <@lgcode/div>
    <@lgcode/div>
  ),
}
