@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/dropdown-menu"
import { Button } from ".@lgcode/button"

const docs = `### Overview
Dropdown menu built on Kobalte with composable items, groups, and submenus.

Use \`DropdownMenu.ItemLabel\`@lgcode/\`ItemDescription\` for richer rows.

### API
- Root accepts Kobalte DropdownMenu props (\`open\`, \`defaultOpen\`, \`onOpenChange\`).
- Compose with \`Trigger\`, \`Content\`, \`Item\`, \`Separator\`, and optional \`Sub\` sections.

### Variants and states
- Supports item groups, separators, and nested submenus.

### Behavior
- Menu opens from trigger and renders in a portal by default.

### Accessibility
- TODO: confirm keyboard navigation from Kobalte.

### Theming@lgcode/tokens
- Uses \`data-component="dropdown-menu"\` and slot attributes for styling.

`

export default {
  title: "UI@lgcode/DropdownMenu",
  id: "components-dropdown-menu",
  component: mod.DropdownMenu,
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
    <mod.DropdownMenu defaultOpen>
      <mod.DropdownMenu.Trigger as={Button} variant="secondary" size="small">
        Open menu
      <@lgcode/mod.DropdownMenu.Trigger>
      <mod.DropdownMenu.Portal>
        <mod.DropdownMenu.Content>
          <mod.DropdownMenu.Group>
            <mod.DropdownMenu.GroupLabel>Actions<@lgcode/mod.DropdownMenu.GroupLabel>
            <mod.DropdownMenu.Item>
              <mod.DropdownMenu.ItemLabel>New file<@lgcode/mod.DropdownMenu.ItemLabel>
            <@lgcode/mod.DropdownMenu.Item>
            <mod.DropdownMenu.Item>
              <mod.DropdownMenu.ItemLabel>Rename<@lgcode/mod.DropdownMenu.ItemLabel>
              <mod.DropdownMenu.ItemDescription>Shift+R<@lgcode/mod.DropdownMenu.ItemDescription>
            <@lgcode/mod.DropdownMenu.Item>
          <@lgcode/mod.DropdownMenu.Group>
          <mod.DropdownMenu.Separator @lgcode/>
          <mod.DropdownMenu.Sub>
            <mod.DropdownMenu.SubTrigger>More options<@lgcode/mod.DropdownMenu.SubTrigger>
            <mod.DropdownMenu.SubContent>
              <mod.DropdownMenu.Item>
                <mod.DropdownMenu.ItemLabel>Duplicate<@lgcode/mod.DropdownMenu.ItemLabel>
              <@lgcode/mod.DropdownMenu.Item>
              <mod.DropdownMenu.Item>
                <mod.DropdownMenu.ItemLabel>Move<@lgcode/mod.DropdownMenu.ItemLabel>
              <@lgcode/mod.DropdownMenu.Item>
            <@lgcode/mod.DropdownMenu.SubContent>
          <@lgcode/mod.DropdownMenu.Sub>
        <@lgcode/mod.DropdownMenu.Content>
      <@lgcode/mod.DropdownMenu.Portal>
    <@lgcode/mod.DropdownMenu>
  ),
}

export const CheckboxRadio = {
  render: () => (
    <mod.DropdownMenu defaultOpen>
      <mod.DropdownMenu.Trigger as={Button} variant="secondary" size="small">
        Open menu
      <@lgcode/mod.DropdownMenu.Trigger>
      <mod.DropdownMenu.Portal>
        <mod.DropdownMenu.Content>
          <mod.DropdownMenu.CheckboxItem checked>Show line numbers<@lgcode/mod.DropdownMenu.CheckboxItem>
          <mod.DropdownMenu.CheckboxItem>Wrap lines<@lgcode/mod.DropdownMenu.CheckboxItem>
          <mod.DropdownMenu.Separator @lgcode/>
          <mod.DropdownMenu.RadioGroup value="compact">
            <mod.DropdownMenu.RadioItem value="compact">Compact<@lgcode/mod.DropdownMenu.RadioItem>
            <mod.DropdownMenu.RadioItem value="comfortable">Comfortable<@lgcode/mod.DropdownMenu.RadioItem>
          <@lgcode/mod.DropdownMenu.RadioGroup>
        <@lgcode/mod.DropdownMenu.Content>
      <@lgcode/mod.DropdownMenu.Portal>
    <@lgcode/mod.DropdownMenu>
  ),
}
