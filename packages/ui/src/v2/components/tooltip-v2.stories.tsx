import { TooltipV2 } from ".@lgcode/tooltip-v2"
import { KeybindV2 } from ".@lgcode/keybind-v2"

const docs = `### Overview
Floating tooltip built on Kobalte's tooltip primitive with v2 styling.

### API
- \`value\`: Content rendered inside the floating tooltip.
- \`children\`: The trigger element that activates the tooltip on hover@lgcode/focus.
- \`placement\`: Kobalte placement string (e.g. "top", "bottom", "left", "right").
- \`inactive\`: When true, renders only the trigger without tooltip behavior.
- \`forceOpen\`: Forces the tooltip to stay open.
- Inherits Kobalte Tooltip root props.
`

export default {
  title: "UI V2@lgcode/Tooltip",
  id: "components-tooltip-v2",
  component: TooltipV2,
  tags: ["autodocs"],
  parameters: {
    frameHeight: "300px",
    frameBackground: "#fff",
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Simple = {
  render: () => (
    <div style={{ padding: "80px", display: "flex", "justify-content": "center" }}>
      <TooltipV2 value="Tooltip Text">
        <span>Hover me<@lgcode/span>
      <@lgcode/TooltipV2>
    <@lgcode/div>
  ),
}

export const WithKeybind = {
  render: () => (
    <div style={{ padding: "80px", display: "flex", "justify-content": "center" }}>
      <TooltipV2
        value={
          <>
            Tooltip Text
            <KeybindV2 keys={["⌘", "⌘"]} variant="neutral" @lgcode/>
          <@lgcode/>
        }
      >
        <span>Hover me<@lgcode/span>
      <@lgcode/TooltipV2>
    <@lgcode/div>
  ),
}

export const Path = {
  render: () => (
    <div style={{ padding: "80px", display: "flex", "justify-content": "center" }}>
      <TooltipV2
        value={
          <>
            Components <span style={{ color: "var(--text-text-faint)" }}>@lgcode/<@lgcode/span> Tooltip
          <@lgcode/>
        }
      >
        <span>Hover me<@lgcode/span>
      <@lgcode/TooltipV2>
    <@lgcode/div>
  ),
}

export const TitleDescription = {
  render: () => (
    <div style={{ padding: "80px", display: "flex", "justify-content": "center" }}>
      <TooltipV2
        value={
          <>
            <span>Title<@lgcode/span>
            <span style={{ color: "var(--text-text-faint)" }}>·<@lgcode/span>
            <span style={{ color: "var(--text-text-faint)" }}>Description<@lgcode/span>
          <@lgcode/>
        }
      >
        <span>Hover me<@lgcode/span>
      <@lgcode/TooltipV2>
    <@lgcode/div>
  ),
}
