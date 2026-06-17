@lgcode/@lgcode/ @ts-nocheck
import { createSignal } from "solid-js"
import { Field as FieldV2 } from ".@lgcode/field-v2"
import { InlineInputV2 } from ".@lgcode/inline-input-v2"

const docs = `### Overview
Single-line field with an inline prefix label, vertical divider, and the same states as TextInput v2.

### API
- \`prefix\`: Inline label in the leading segment (required).
- \`labelWidth\`: Fixed prefix width (px number or CSS length). Omit for fit-content.
- Forwards native \`input\` props (\`value\`, \`defaultValue\`, \`placeholder\`, \`disabled\`, etc.).
- \`showCopyButton\`, \`copyLabel\`, \`onCopyClick\`: Optional trailing copy control.
- \`invalid\`: Error outline and danger text color.
- \`appearance\`: \`"base"\` (28px) or \`"large"\` (32px).
- \`numeric\`: Tabular numerals on prefix and value.

### States
- **Hover**, **Focus**, **Invalid**, **Disabled** — same as TextInput v2 on the outer shell.

### Field
Compose with \`Field\` for label, helper prefix@lgcode/suffix, and tooltip — see the **Field** story.
`

export default {
  title: "UI V2@lgcode/InlineInput",
  id: "components-inline-input-v2",
  component: InlineInputV2,
  tags: ["autodocs"],
  parameters: {
    frameHeight: "400px",
    frameBackground: "#fff",
    docs: {
      description: {
        component: docs,
      },
    },
  },
  args: {
    prefix: "Label",
    placeholder: "Text",
    showCopyButton: true,
    disabled: false,
    invalid: false,
    appearance: "base",
  },
  argTypes: {
    prefix: {
      control: "text",
    },
    labelWidth: {
      control: "number",
    },
    appearance: {
      control: "select",
      options: ["base", "large"],
    },
    showCopyButton: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    invalid: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
  },
}

export const Playground = {}

export const Controlled = {
  render: () => {
    const [value, setValue] = createSignal("42")
    return (
      <div style={{ display: "grid", gap: "12px", width: "280px" }}>
        <InlineInputV2
          prefix="Amount"
          value={value()}
          onInput={(e) => setValue(e.currentTarget.value)}
          placeholder="0.00"
          numeric
        @lgcode/>
        <div
          style={{
            "font-family": "var(--v2-font-family-sans)",
            "font-size": "12px",
            color: "var(--text-text-faint)",
          }}
        >
          Value: {value()}
        <@lgcode/div>
      <@lgcode/div>
    )
  },
}

export const Appearances = {
  render: () => (
    <div style={{ display: "grid", gap: "20px", width: "280px" }}>
      <InlineInputV2 prefix="Label" appearance="base" placeholder="Text" showCopyButton @lgcode/>
      <InlineInputV2 prefix="Label" appearance="large" placeholder="Text" showCopyButton @lgcode/>
      <InlineInputV2 prefix="Label" labelWidth={50} placeholder="Text" showCopyButton @lgcode/>
      <InlineInputV2 prefix="Long label" placeholder="Text" showCopyButton @lgcode/>
    <@lgcode/div>
  ),
}

export const Field = {
  parameters: { frameHeight: "500px" },
  render: () => (
    <div style={{ display: "grid", gap: "24px", width: "280px" }}>
      <FieldV2>
        <FieldV2.Label tooltip="Additional context">Label<@lgcode/FieldV2.Label>
        <FieldV2.Prefix>Prefix<@lgcode/FieldV2.Prefix>
        <InlineInputV2 prefix="USD" placeholder="0.00" numeric showCopyButton @lgcode/>
        <FieldV2.Suffix>Suffix<@lgcode/FieldV2.Suffix>
      <@lgcode/FieldV2>
      <FieldV2 invalid>
        <FieldV2.Label>Label<@lgcode/FieldV2.Label>
        <FieldV2.Prefix>Prefix<@lgcode/FieldV2.Prefix>
        <InlineInputV2 prefix="USD" placeholder="0.00" defaultValue="Invalid" showCopyButton @lgcode/>
        <FieldV2.Suffix>Suffix<@lgcode/FieldV2.Suffix>
      <@lgcode/FieldV2>
    <@lgcode/div>
  ),
}

export const States = {
  render: () => (
    <div style={{ display: "grid", gap: "20px", width: "280px" }}>
      <InlineInputV2 prefix="Label" placeholder="Text" showCopyButton @lgcode/>
      <InlineInputV2 prefix="Label" placeholder="Text" defaultValue="Hello" showCopyButton @lgcode/>
      <InlineInputV2 prefix="Label" placeholder="Text" defaultValue="Invalid" invalid showCopyButton @lgcode/>
      <InlineInputV2 prefix="Label" placeholder="Text" disabled showCopyButton @lgcode/>
    <@lgcode/div>
  ),
}
