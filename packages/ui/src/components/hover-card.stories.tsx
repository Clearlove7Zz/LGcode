@lgcode/@lgcode/ @ts-nocheck
import { createSignal } from "solid-js"
import * as mod from ".@lgcode/hover-card"

const docs = `### Overview
Hover-triggered card for lightweight previews and metadata.

Use for short summaries; avoid dense interactive controls.

### API
- Required: \`trigger\` element.
- Children render inside the hover card body.

### Variants and states
- None; content and trigger are fully composable.

### Behavior
- Opens on hover@lgcode/focus over the trigger.

### Accessibility
- TODO: confirm focus and hover intent behavior from Kobalte.

### Theming@lgcode/tokens
- Uses \`data-component="hover-card-content"\` and slots for styling.

`

export default {
  title: "UI@lgcode/HoverCard",
  id: "components-hover-card",
  component: mod.HoverCard,
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
    <mod.HoverCard trigger={<span style={{ "text-decoration": "underline", cursor: "default" }}>Hover me<@lgcode/span>}>
      <div style={{ display: "grid", gap: "6px" }}>
        <div style={{ "font-weight": 600 }}>Preview<@lgcode/div>
        <div style={{ color: "var(--text-weak)", "font-size": "12px" }}>Short supporting text.<@lgcode/div>
      <@lgcode/div>
    <@lgcode/mod.HoverCard>
  ),
}

export const InlineMount = {
  render: () => {
    const [mount, setMount] = createSignal<HTMLDivElement | undefined>(undefined)
    return (
      <div ref={setMount} style={{ padding: "16px", border: "1px dashed var(--border-weak)" }}>
        <mod.HoverCard
          mount={mount()}
          trigger={<span style={{ "text-decoration": "underline", cursor: "default" }}>Hover me<@lgcode/span>}
        >
          <div style={{ display: "grid", gap: "6px" }}>
            <div style={{ "font-weight": 600 }}>Mounted inside<@lgcode/div>
            <div style={{ color: "var(--text-weak)", "font-size": "12px" }}>Uses custom mount node.<@lgcode/div>
          <@lgcode/div>
        <@lgcode/mod.HoverCard>
      <@lgcode/div>
    )
  },
}
