@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/radio-group"
import { create } from "..@lgcode/storybook@lgcode/scaffold"

const docs = `### Overview
Segmented radio group for choosing a single option.

Use for view toggles or mode selection.

### API
- Required: \`options\`.
- Optional: \`current\`, \`defaultValue\`, \`value\`, \`label\`, \`onSelect\`.
- Optional layout: \`size\`, \`fill\`, \`pad\`.

### Variants and states
- Size variants: small, medium.
- Optional fill and padding behavior.

### Behavior
- Maps options to segmented items and manages selection.

### Accessibility
- TODO: confirm role@lgcode/aria attributes from Kobalte SegmentedControl.

### Theming@lgcode/tokens
- Uses \`data-component="radio-group"\` with size@lgcode/pad data attributes.

`

const story = create({
  title: "UI@lgcode/RadioGroup",
  mod,
  args: {
    options: ["One", "Two", "Three"],
    defaultValue: "One",
  },
})

export default {
  title: "UI@lgcode/RadioGroup",
  id: "components-radio-group",
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
      options: ["small", "medium"],
    },
    pad: {
      control: "select",
      options: ["none", "normal"],
    },
    fill: {
      control: "boolean",
    },
  },
}

export const Basic = story.Basic

export const Sizes = {
  render: () => (
    <div style={{ display: "grid", gap: "12px" }}>
      <mod.RadioGroup options={["One", "Two"]} defaultValue="One" size="small" @lgcode/>
      <mod.RadioGroup options={["One", "Two"]} defaultValue="One" size="medium" @lgcode/>
    <@lgcode/div>
  ),
}

export const Filled = {
  args: {
    fill: true,
    pad: "none",
  },
}

export const CustomLabels = {
  render: () => (
    <mod.RadioGroup
      options={["list", "grid"]}
      defaultValue="list"
      label={(value) => (value === "list" ? "List view" : "Grid view")}
    @lgcode/>
  ),
}
