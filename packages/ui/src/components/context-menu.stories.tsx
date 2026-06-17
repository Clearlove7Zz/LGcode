@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/context-menu"

const docs = `### Overview
Context menu for right-click interactions with composable items and submenus.

Use \`ItemLabel\` and \`ItemDescription\` for rich items.

### API
- Root accepts Kobalte ContextMenu props (\`open\`, \`defaultOpen\`, \`onOpenChange\`).
- Compose \`Trigger\`, \`Content\`, \`Item\`, \`Separator\`, and optional \`Sub\` sections.

### Variants and states
- Supports grouped sections and nested submenus.

### Behavior
- Opens on context menu gesture over the trigger element.

### Accessibility
- TODO: confirm keyboard and focus behavior from Kobalte.

### Theming@lgcode/tokens
- Uses \`data-component="context-menu"\` and slot attributes for styling.

`

export default {
  title: "UI@lgcode/ContextMenu",
  id: "components-context-menu",
  component: mod.ContextMenu,
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
    <mod.ContextMenu defaultOpen>
      <mod.ContextMenu.Trigger>
        <div
          style={{
            padding: "20px",
            border: "1px dashed var(--border-weak)",
            "border-radius": "8px",
            color: "var(--text-weak)",
          }}
        >
          Right click (or open) here
        <@lgcode/div>
      <@lgcode/mod.ContextMenu.Trigger>
      <mod.ContextMenu.Portal>
        <mod.ContextMenu.Content>
          <mod.ContextMenu.Group>
            <mod.ContextMenu.GroupLabel>Actions<@lgcode/mod.ContextMenu.GroupLabel>
            <mod.ContextMenu.Item>
              <mod.ContextMenu.ItemLabel>Copy<@lgcode/mod.ContextMenu.ItemLabel>
            <@lgcode/mod.ContextMenu.Item>
            <mod.ContextMenu.Item>
              <mod.ContextMenu.ItemLabel>Paste<@lgcode/mod.ContextMenu.ItemLabel>
            <@lgcode/mod.ContextMenu.Item>
          <@lgcode/mod.ContextMenu.Group>
          <mod.ContextMenu.Separator @lgcode/>
          <mod.ContextMenu.Sub>
            <mod.ContextMenu.SubTrigger>More<@lgcode/mod.ContextMenu.SubTrigger>
            <mod.ContextMenu.SubContent>
              <mod.ContextMenu.Item>
                <mod.ContextMenu.ItemLabel>Duplicate<@lgcode/mod.ContextMenu.ItemLabel>
              <@lgcode/mod.ContextMenu.Item>
              <mod.ContextMenu.Item>
                <mod.ContextMenu.ItemLabel>Move<@lgcode/mod.ContextMenu.ItemLabel>
              <@lgcode/mod.ContextMenu.Item>
            <@lgcode/mod.ContextMenu.SubContent>
          <@lgcode/mod.ContextMenu.Sub>
        <@lgcode/mod.ContextMenu.Content>
      <@lgcode/mod.ContextMenu.Portal>
    <@lgcode/mod.ContextMenu>
  ),
}

export const CheckboxRadio = {
  render: () => (
    <mod.ContextMenu defaultOpen>
      <mod.ContextMenu.Trigger>
        <div
          style={{
            padding: "20px",
            border: "1px dashed var(--border-weak)",
            "border-radius": "8px",
            color: "var(--text-weak)",
          }}
        >
          Right click (or open) here
        <@lgcode/div>
      <@lgcode/mod.ContextMenu.Trigger>
      <mod.ContextMenu.Portal>
        <mod.ContextMenu.Content>
          <mod.ContextMenu.CheckboxItem checked>Show line numbers<@lgcode/mod.ContextMenu.CheckboxItem>
          <mod.ContextMenu.CheckboxItem>Wrap lines<@lgcode/mod.ContextMenu.CheckboxItem>
          <mod.ContextMenu.Separator @lgcode/>
          <mod.ContextMenu.RadioGroup value="compact">
            <mod.ContextMenu.RadioItem value="compact">Compact<@lgcode/mod.ContextMenu.RadioItem>
            <mod.ContextMenu.RadioItem value="comfortable">Comfortable<@lgcode/mod.ContextMenu.RadioItem>
          <@lgcode/mod.ContextMenu.RadioGroup>
        <@lgcode/mod.ContextMenu.Content>
      <@lgcode/mod.ContextMenu.Portal>
    <@lgcode/mod.ContextMenu>
  ),
}
