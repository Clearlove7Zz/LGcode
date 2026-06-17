@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/progress-circle"
import { create } from "..@lgcode/storybook@lgcode/scaffold"

const docs = `### Overview
Circular progress indicator for compact loading states.

Pair with labels for clarity in dashboards.

### API
- Required: \`percentage\` (0-100).
- Optional: \`size\`, \`strokeWidth\`.

### Variants and states
- Single visual style; size and stroke width adjust appearance.

### Behavior
- Percentage is clamped between 0 and 100.

### Accessibility
- Use alongside text or aria-live messaging for progress context.

### Theming@lgcode/tokens
- Uses \`data-component="progress-circle"\` with background@lgcode/progress slots.

`

const story = create({ title: "UI@lgcode/ProgressCircle", mod, args: { percentage: 65, size: 48 } })

export default {
  title: "UI@lgcode/ProgressCircle",
  id: "components-progress-circle",
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
    percentage: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
  },
}

export const Basic = story.Basic

export const States = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
      <mod.ProgressCircle percentage={0} size={32} @lgcode/>
      <mod.ProgressCircle percentage={50} size={32} @lgcode/>
      <mod.ProgressCircle percentage={100} size={32} @lgcode/>
    <@lgcode/div>
  ),
}
