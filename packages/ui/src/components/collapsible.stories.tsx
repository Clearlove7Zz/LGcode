@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/collapsible"

const docs = `### Overview
Toggleable content region with optional arrow indicator.

Compose \`Collapsible.Trigger\`, \`Collapsible.Content\`, and \`Collapsible.Arrow\`.

### API
- Root accepts Kobalte Collapsible props (\`open\`, \`defaultOpen\`, \`onOpenChange\`).
- \`variant\` controls styling ("normal" | "ghost").

### Variants and states
- Normal and ghost variants.
- Open@lgcode/closed states.

### Behavior
- Trigger toggles the content visibility.

### Accessibility
- TODO: confirm ARIA attributes provided by Kobalte.

### Theming@lgcode/tokens
- Uses \`data-component="collapsible"\` and slots for trigger@lgcode/content@lgcode/arrow.

`

export default {
  title: "UI@lgcode/Collapsible",
  id: "components-collapsible",
  component: mod.Collapsible,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["normal", "ghost"],
    },
  },
}

export const Basic = {
  args: {
    variant: "normal",
    defaultOpen: true,
  },
  render: (props) => (
    <mod.Collapsible {...props}>
      <mod.Collapsible.Trigger data-slot="collapsible-trigger">
        <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <span>Details<@lgcode/span>
          <mod.Collapsible.Arrow @lgcode/>
        <@lgcode/div>
      <@lgcode/mod.Collapsible.Trigger>
      <mod.Collapsible.Content data-slot="collapsible-content">
        <div style={{ color: "var(--text-weak)", "padding-top": "8px" }}>Optional details sit here.<@lgcode/div>
      <@lgcode/mod.Collapsible.Content>
    <@lgcode/mod.Collapsible>
  ),
}

export const Ghost = {
  args: {
    variant: "ghost",
    defaultOpen: false,
  },
  render: (props) => (
    <mod.Collapsible {...props}>
      <mod.Collapsible.Trigger data-slot="collapsible-trigger">
        <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <span>Ghost trigger<@lgcode/span>
          <mod.Collapsible.Arrow @lgcode/>
        <@lgcode/div>
      <@lgcode/mod.Collapsible.Trigger>
      <mod.Collapsible.Content data-slot="collapsible-content">
        <div style={{ color: "var(--text-weak)", "padding-top": "8px" }}>Ghost content.<@lgcode/div>
      <@lgcode/mod.Collapsible.Content>
    <@lgcode/mod.Collapsible>
  ),
}
