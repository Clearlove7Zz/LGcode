@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/switch"
import { create } from "..@lgcode/storybook@lgcode/scaffold"

const docs = `### Overview
Toggle control for binary settings.

Use in settings panels or forms.

### API
- Uses Kobalte Switch props (\`checked\`, \`defaultChecked\`, \`onChange\`).
- Optional: \`hideLabel\`, \`description\`.
- Children render as the label.

### Variants and states
- Checked@lgcode/unchecked, disabled states.

### Behavior
- Controlled or uncontrolled usage via Kobalte props.

### Accessibility
- TODO: confirm aria attributes from Kobalte.

### Theming@lgcode/tokens
- Uses \`data-component="switch"\` and slot attributes.

`

const story = create({
  title: "UI@lgcode/Switch",
  mod,
  args: { defaultChecked: true, children: "Enable notifications" },
})

export default {
  title: "UI@lgcode/Switch",
  id: "components-switch",
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
      <mod.Switch defaultChecked>Enabled<@lgcode/mod.Switch>
      <mod.Switch>Disabled<@lgcode/mod.Switch>
      <mod.Switch disabled>Disabled switch<@lgcode/mod.Switch>
      <mod.Switch description="Optional description">With description<@lgcode/mod.Switch>
    <@lgcode/div>
  ),
}

export const HiddenLabel = {
  args: {
    children: "Hidden label",
    hideLabel: true,
    defaultChecked: true,
  },
}
