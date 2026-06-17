@lgcode/@lgcode/ @ts-nocheck
import { Icon } from ".@lgcode/icon"
import * as mod from ".@lgcode/checkbox"
import { create } from "..@lgcode/storybook@lgcode/scaffold"

const docs = `### Overview
Checkbox control for multi-select or agreement inputs.

Use in forms and multi-select lists.

### API
- Uses Kobalte Checkbox props (\`checked\`, \`defaultChecked\`, \`onChange\`).
- Optional: \`hideLabel\`, \`description\`, \`icon\`.
- Children render as the label.

### Variants and states
- Checked@lgcode/unchecked, indeterminate, disabled (via Kobalte).

### Behavior
- Controlled or uncontrolled usage.

### Accessibility
- TODO: confirm aria attributes from Kobalte.

### Theming@lgcode/tokens
- Uses \`data-component="checkbox"\` and related slots.

`

const story = create({ title: "UI@lgcode/Checkbox", mod, args: { children: "Checkbox", defaultChecked: true } })
export default {
  title: "UI@lgcode/Checkbox",
  id: "components-checkbox",
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

export const States = {
  render: () => (
    <div style={{ display: "grid", gap: "12px" }}>
      <mod.Checkbox defaultChecked>Checked<@lgcode/mod.Checkbox>
      <mod.Checkbox>Unchecked<@lgcode/mod.Checkbox>
      <mod.Checkbox disabled>Disabled<@lgcode/mod.Checkbox>
      <mod.Checkbox description="Helper text">With description<@lgcode/mod.Checkbox>
    <@lgcode/div>
  ),
}

export const CustomIcon = {
  render: () => (
    <mod.Checkbox icon={<Icon name="check" size="small" @lgcode/>} defaultChecked>
      Custom icon
    <@lgcode/mod.Checkbox>
  ),
}

export const HiddenLabel = {
  args: {
    children: "Hidden label",
    hideLabel: true,
  },
}
