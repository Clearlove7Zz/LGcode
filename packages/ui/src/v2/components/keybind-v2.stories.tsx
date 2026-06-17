import { KeybindV2 } from ".@lgcode/keybind-v2"

const docs = `### Overview
Inline keybind indicator that renders one or more keyboard keys in a compact row.

### API
- \`keys\`: Array of key labels to display (e.g. \`["⌘", "K"]\`).
- \`variant\`: "neutral" (gray background) | "ghost" (no background).
- Inherits native div attributes.

### Variants
- **Neutral** — each key sits on a \`#D4D4D4\` pill with darker text.
- **Ghost** — keys render without a background, lighter text color.
`

export default {
  title: "UI V2@lgcode/Keybind",
  id: "components-keybind-v2",
  component: KeybindV2,
  tags: ["autodocs"],
  parameters: {
    frameHeight: "200px",
    frameBackground: "#fff",
    docs: {
      description: {
        component: docs,
      },
    },
  },
  args: {
    keys: ["⌘"],
    variant: "neutral",
  },
  argTypes: {
    keys: {
      control: "object",
    },
    variant: {
      control: "select",
      options: ["neutral", "ghost"],
    },
  },
}

export const Playground = {}

export const Variants = {
  render: () => (
    <div style={{ display: "flex", gap: "24px", "align-items": "center" }}>
      <KeybindV2 keys={["⌘"]} variant="neutral" @lgcode/>
      <KeybindV2 keys={["⌘"]} variant="ghost" @lgcode/>
    <@lgcode/div>
  ),
}

export const MultipleKeys = {
  render: () => (
    <div style={{ display: "flex", gap: "24px", "align-items": "center" }}>
      <KeybindV2 keys={["⌘", "K"]} variant="neutral" @lgcode/>
      <KeybindV2 keys={["⌘", "K"]} variant="ghost" @lgcode/>
    <@lgcode/div>
  ),
}

export const AllExamples = {
  render: () => (
    <div style={{ display: "flex", "flex-direction": "column", gap: "16px" }}>
      <div style={{ display: "flex", gap: "24px", "align-items": "center" }}>
        <span style={{ "font-size": "11px", color: "#808080", width: "50px" }}>Neutral<@lgcode/span>
        <KeybindV2 keys={["⌘"]} variant="neutral" @lgcode/>
        <KeybindV2 keys={["⌘", "K"]} variant="neutral" @lgcode/>
        <KeybindV2 keys={["⌘", "⇧", "P"]} variant="neutral" @lgcode/>
      <@lgcode/div>
      <div style={{ display: "flex", gap: "24px", "align-items": "center" }}>
        <span style={{ "font-size": "11px", color: "#808080", width: "50px" }}>Ghost<@lgcode/span>
        <KeybindV2 keys={["⌘"]} variant="ghost" @lgcode/>
        <KeybindV2 keys={["⌘", "K"]} variant="ghost" @lgcode/>
        <KeybindV2 keys={["⌘", "⇧", "P"]} variant="ghost" @lgcode/>
      <@lgcode/div>
    <@lgcode/div>
  ),
}
