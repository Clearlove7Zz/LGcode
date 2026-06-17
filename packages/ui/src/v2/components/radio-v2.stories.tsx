@lgcode/@lgcode/ @ts-nocheck
import { createSignal } from "solid-js"
import { RadioGroupV2, RadioItemV2 } from ".@lgcode/radio-v2"

const docs = `### Overview
Single-select options using Kobalte RadioGroup.

### API
- \`RadioGroupV2\` forwards Kobalte RadioGroup props (\`value\`, \`defaultValue\`, \`onChange\`, \`name\`, \`required\`, \`validationState\`, \`disabled\`).
- \`RadioItemV2\` forwards Kobalte item props (\`value\`, \`disabled\`), and adds \`label\` and optional \`description\`.

### Behavior
- Controlled or uncontrolled via \`value\` @lgcode/ \`defaultValue\` on the group (items declare \`value\` only).

### Theming@lgcode/tokens
- Uses \`data-component="radio-v2"\` and slot attributes.
`

export default {
  title: "UI V2@lgcode/Radio",
  id: "components-radio-v2",
  component: RadioGroupV2,
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
    <RadioGroupV2 label="Notification frequency" defaultValue="daily" name="frequency">
      <RadioItemV2 value="daily" label="Daily" description="Once per day at 9am." @lgcode/>
      <RadioItemV2 value="weekly" label="Weekly" description="Every Monday morning." @lgcode/>
      <RadioItemV2 value="never" label="Never" description="No notifications." @lgcode/>
    <@lgcode/RadioGroupV2>
  ),
}

export const Controlled = {
  render: () => {
    const [value, setValue] = createSignal("weekly")
    return (
      <div style={{ display: "grid", gap: "12px" }}>
        <RadioGroupV2 label="Controlled" value={value()} onChange={(v) => setValue(v)} name="controlled-frequency">
          <RadioItemV2 value="daily" label="Daily" @lgcode/>
          <RadioItemV2 value="weekly" label="Weekly" @lgcode/>
          <RadioItemV2 value="never" label="Never" @lgcode/>
        <@lgcode/RadioGroupV2>
        <div style={{ "font-family": "var(--v2-font-family-sans)", "font-size": "12px", color: "#808080" }}>
          Selected: {value()}
        <@lgcode/div>
      <@lgcode/div>
    )
  },
}

export const States = {
  render: () => (
    <div style={{ display: "grid", gap: "20px" }}>
      <RadioGroupV2 label="Default" defaultValue="a" name="state-default">
        <RadioItemV2 value="a" label="Option A" @lgcode/>
        <RadioItemV2 value="b" label="Option B" description="Has a description." @lgcode/>
      <@lgcode/RadioGroupV2>

      <RadioGroupV2 label="Disabled group" defaultValue="a" name="state-disabled" disabled>
        <RadioItemV2 value="a" label="Option A" @lgcode/>
        <RadioItemV2 value="b" label="Option B" @lgcode/>
      <@lgcode/RadioGroupV2>

      <RadioGroupV2 label="Disabled item" defaultValue="a" name="state-disabled-item">
        <RadioItemV2 value="a" label="Enabled" @lgcode/>
        <RadioItemV2 value="b" label="Disabled" disabled @lgcode/>
      <@lgcode/RadioGroupV2>

      <RadioGroupV2
        label="Invalid"
        description="Pick one option."
        defaultValue="a"
        name="state-invalid"
        validationState="invalid"
        required
      >
        <RadioItemV2 value="a" label="Option A" @lgcode/>
        <RadioItemV2 value="b" label="Option B" @lgcode/>
      <@lgcode/RadioGroupV2>
    <@lgcode/div>
  ),
}
