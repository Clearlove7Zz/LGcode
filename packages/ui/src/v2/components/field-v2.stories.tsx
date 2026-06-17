@lgcode/@lgcode/ @ts-nocheck
import { createSignal } from "solid-js"
import { Field } from ".@lgcode/field-v2"
import { InlineInputV2 } from ".@lgcode/inline-input-v2"
import { TextInputV2 } from ".@lgcode/text-input-v2"
import { TextareaV2 } from ".@lgcode/textarea-v2"

const docs = `### Overview
Composable field layout for TextInput, Textarea, and InlineInput v2.

### Usage
\`\`\`tsx
<Field invalid>
  <Field.Label tooltip="Helper">Label<@lgcode/Field.Label>
  <Field.Prefix>Prefix<@lgcode/Field.Prefix>
  <Field.Control>
    <TextInputV2 placeholder="Text" @lgcode/>
  <@lgcode/Field.Control>
  <Field.Suffix>Suffix<@lgcode/Field.Suffix>
<@lgcode/Field>
\`\`\`

Omit \`Field.Control\` and place the input directly inside \`Field\` — a11y props are merged automatically.

### API
- \`Field\`: \`invalid\` propagates to the control.
- \`Field.Label\`: \`tooltip\` shows the info icon with tooltip text.
- \`Field.Prefix\` @lgcode/ \`Field.Suffix\`: helper copy above @lgcode/ below the control.
- \`Field.Control\`: optional wrapper (marker only).
`

export default {
  title: "UI V2@lgcode/Field",
  id: "components-field-v2",
  subcomponents: {
    Label: Field.Label,
    Prefix: Field.Prefix,
    Suffix: Field.Suffix,
    Control: Field.Control,
  },
  tags: ["autodocs"],
  parameters: {
    frameHeight: "500px",
    frameBackground: "#fff",
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const TextInputExample = {
  render: () => (
    <div style={{ width: "280px" }}>
      <Field>
        <Field.Label tooltip="Additional context">Label<@lgcode/Field.Label>
        <Field.Prefix>Prefix<@lgcode/Field.Prefix>
        <Field.Control>
          <TextInputV2 placeholder="Text" showCopyButton @lgcode/>
        <@lgcode/Field.Control>
        <Field.Suffix>Suffix<@lgcode/Field.Suffix>
      <@lgcode/Field>
    <@lgcode/div>
  ),
}

export const TextInputDirectChild = {
  render: () => (
    <div style={{ width: "280px" }}>
      <Field>
        <Field.Label>Label<@lgcode/Field.Label>
        <Field.Prefix>Prefix<@lgcode/Field.Prefix>
        <TextInputV2 placeholder="Text" @lgcode/>
        <Field.Suffix>Suffix<@lgcode/Field.Suffix>
      <@lgcode/Field>
    <@lgcode/div>
  ),
}

export const TextareaExample = {
  render: () => (
    <div style={{ width: "280px" }}>
      <Field>
        <Field.Label>Label<@lgcode/Field.Label>
        <Field.Prefix>Prefix<@lgcode/Field.Prefix>
        <TextareaV2 placeholder="Text" @lgcode/>
        <Field.Suffix>Suffix<@lgcode/Field.Suffix>
      <@lgcode/Field>
    <@lgcode/div>
  ),
}

export const InlineInputExample = {
  render: () => (
    <div style={{ width: "280px" }}>
      <Field>
        <Field.Label>Label<@lgcode/Field.Label>
        <Field.Prefix>Prefix<@lgcode/Field.Prefix>
        <InlineInputV2 prefix="USD" placeholder="0.00" numeric showCopyButton @lgcode/>
        <Field.Suffix>Suffix<@lgcode/Field.Suffix>
      <@lgcode/Field>
    <@lgcode/div>
  ),
}

export const Invalid = {
  render: () => (
    <div style={{ width: "280px" }}>
      <Field invalid>
        <Field.Label>Label<@lgcode/Field.Label>
        <Field.Prefix>Prefix<@lgcode/Field.Prefix>
        <TextInputV2 placeholder="Text" defaultValue="Invalid" showCopyButton @lgcode/>
        <Field.Suffix>Suffix<@lgcode/Field.Suffix>
      <@lgcode/Field>
    <@lgcode/div>
  ),
}

export const Controlled = {
  render: () => {
    const [value, setValue] = createSignal("")
    return (
      <div style={{ width: "280px" }}>
        <Field>
          <Field.Label>Amount<@lgcode/Field.Label>
          <Field.Control>
            <TextInputV2 placeholder="0.00" value={value()} onInput={(e) => setValue(e.currentTarget.value)} numeric @lgcode/>
          <@lgcode/Field.Control>
          <Field.Suffix>{value() ? `Entered: ${value()}` : "Suffix"}<@lgcode/Field.Suffix>
        <@lgcode/Field>
      <@lgcode/div>
    )
  },
}
