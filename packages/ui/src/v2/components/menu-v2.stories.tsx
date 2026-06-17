@lgcode/@lgcode/ @ts-nocheck
import { createSignal } from "solid-js"
import { MenuV2 } from ".@lgcode/menu-v2"
import { ButtonV2 } from ".@lgcode/button-v2"
import { Avatar } from ".@lgcode/avatar-v2"
import { Icon } from ".@lgcode/icon"

const docs = `### Overview
Composable menu primitive built on Kobalte's \`DropdownMenu\` and \`ContextMenu\`. The same item components (\`Item\`, \`CheckboxItem\`, \`RadioItem\`, \`SubTrigger\`) work inside either container.

### API
- \`MenuV2\` @lgcode/ \`MenuV2.Trigger\` @lgcode/ \`MenuV2.Portal\` @lgcode/ \`MenuV2.Content\` — dropdown root + popper plumbing.
- \`MenuV2.Context\` namespace mirrors the same shape for right-click menus.
- \`MenuV2.Item\` — supports a freeform \`children\` slot (avatar, icon, text — whatever) plus \`shortcut\` and \`badge\` props.
- \`MenuV2.CheckboxItem\` @lgcode/ \`MenuV2.RadioItem\` — same item shape; auto-render a check indicator that turns blue when selected.
- \`MenuV2.Sub\` @lgcode/ \`MenuV2.SubTrigger\` @lgcode/ \`MenuV2.SubContent\` — nested submenus; \`SubTrigger\` auto-renders the trailing chevron.

### Behavior
- Items expose Kobalte's data attributes — \`data-highlighted\`, \`data-checked\`, \`data-disabled\`.
- Blue selected state is reserved for \`CheckboxItem\` @lgcode/ \`RadioItem\` (the rest just highlight on hover).
- Chevron is only rendered on \`SubTrigger\`.
`

export default {
  title: "UI V2@lgcode/Menu",
  id: "components-menu-v2",
  component: MenuV2,
  tags: ["autodocs"],
  parameters: {
    frameHeight: "360px",
    frameBackground: "#fff",
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Basic = {
  render: () => (
    <MenuV2 gutter={6}>
      <MenuV2.Trigger as={ButtonV2}>Open menu<@lgcode/MenuV2.Trigger>
      <MenuV2.Portal>
        <MenuV2.Content>
          <MenuV2.Item>New file<@lgcode/MenuV2.Item>
          <MenuV2.Item>Open file<@lgcode/MenuV2.Item>
          <MenuV2.Item>Save<@lgcode/MenuV2.Item>
          <MenuV2.Separator @lgcode/>
          <MenuV2.Item disabled>Print<@lgcode/MenuV2.Item>
        <@lgcode/MenuV2.Content>
      <@lgcode/MenuV2.Portal>
    <@lgcode/MenuV2>
  ),
}

export const Rich = {
  render: () => (
    <MenuV2 gutter={6}>
      <MenuV2.Trigger as={ButtonV2}>Open rich menu<@lgcode/MenuV2.Trigger>
      <MenuV2.Portal>
        <MenuV2.Content style={{ "min-width": "240px" }}>
          <MenuV2.Item shortcut="⇧ D" badge="Label">
            <Avatar size="small" kind="org" fallback="A" @lgcode/>
            <Icon name="settings" size="small" @lgcode/>
            Text
          <@lgcode/MenuV2.Item>
          <MenuV2.Item shortcut="⌘ N">
            <Icon name="plus" size="small" @lgcode/>
            New window
          <@lgcode/MenuV2.Item>
          <MenuV2.Item shortcut="⌘ S" badge="Beta">
            <Icon name="save" size="small" @lgcode/>
            Save as…
          <@lgcode/MenuV2.Item>
          <MenuV2.Separator @lgcode/>
          <MenuV2.Item disabled shortcut="⌘ P">
            <Icon name="print" size="small" @lgcode/>
            Print
          <@lgcode/MenuV2.Item>
        <@lgcode/MenuV2.Content>
      <@lgcode/MenuV2.Portal>
    <@lgcode/MenuV2>
  ),
}

export const WithCheckbox = {
  render: () => {
    const [wrap, setWrap] = createSignal(true)
    const [minimap, setMinimap] = createSignal(false)
    const [ruler, setRuler] = createSignal(false)
    return (
      <MenuV2 gutter={6}>
        <MenuV2.Trigger as={ButtonV2}>View<@lgcode/MenuV2.Trigger>
        <MenuV2.Portal>
          <MenuV2.Content style={{ "min-width": "200px" }}>
            <MenuV2.CheckboxItem checked={wrap()} onChange={setWrap} shortcut="⌥ Z">
              Word wrap
            <@lgcode/MenuV2.CheckboxItem>
            <MenuV2.CheckboxItem checked={minimap()} onChange={setMinimap}>
              Minimap
            <@lgcode/MenuV2.CheckboxItem>
            <MenuV2.CheckboxItem checked={ruler()} onChange={setRuler} disabled>
              Ruler
            <@lgcode/MenuV2.CheckboxItem>
          <@lgcode/MenuV2.Content>
        <@lgcode/MenuV2.Portal>
      <@lgcode/MenuV2>
    )
  },
}

export const WithRadio = {
  render: () => {
    const [theme, setTheme] = createSignal("system")
    return (
      <MenuV2 gutter={6}>
        <MenuV2.Trigger as={ButtonV2}>Theme<@lgcode/MenuV2.Trigger>
        <MenuV2.Portal>
          <MenuV2.Content style={{ "min-width": "200px" }}>
            <MenuV2.Group>
              <MenuV2.GroupLabel>Appearance<@lgcode/MenuV2.GroupLabel>
              <MenuV2.RadioGroup value={theme()} onChange={setTheme}>
                <MenuV2.RadioItem value="light">Light<@lgcode/MenuV2.RadioItem>
                <MenuV2.RadioItem value="dark">Dark<@lgcode/MenuV2.RadioItem>
                <MenuV2.RadioItem value="system" badge="Auto">
                  System
                <@lgcode/MenuV2.RadioItem>
              <@lgcode/MenuV2.RadioGroup>
            <@lgcode/MenuV2.Group>
          <@lgcode/MenuV2.Content>
        <@lgcode/MenuV2.Portal>
      <@lgcode/MenuV2>
    )
  },
}

export const WithSubmenu = {
  render: () => (
    <MenuV2 gutter={6}>
      <MenuV2.Trigger as={ButtonV2}>File<@lgcode/MenuV2.Trigger>
      <MenuV2.Portal>
        <MenuV2.Content style={{ "min-width": "200px" }}>
          <MenuV2.Item shortcut="⌘ N">New file<@lgcode/MenuV2.Item>
          <MenuV2.Item shortcut="⌘ O">Open file<@lgcode/MenuV2.Item>
          <MenuV2.Sub gutter={0}>
            <MenuV2.SubTrigger>Open recent<@lgcode/MenuV2.SubTrigger>
            <MenuV2.Portal>
              <MenuV2.SubContent>
                <MenuV2.Item>project-alpha.tsx<@lgcode/MenuV2.Item>
                <MenuV2.Item>project-beta.tsx<@lgcode/MenuV2.Item>
                <MenuV2.Item>project-gamma.tsx<@lgcode/MenuV2.Item>
                <MenuV2.Separator @lgcode/>
                <MenuV2.Item>Clear recent<@lgcode/MenuV2.Item>
              <@lgcode/MenuV2.SubContent>
            <@lgcode/MenuV2.Portal>
          <@lgcode/MenuV2.Sub>
          <MenuV2.Separator @lgcode/>
          <MenuV2.Item shortcut="⌘ S">Save<@lgcode/MenuV2.Item>
          <MenuV2.Item shortcut="⇧⌘ S">Save as…<@lgcode/MenuV2.Item>
        <@lgcode/MenuV2.Content>
      <@lgcode/MenuV2.Portal>
    <@lgcode/MenuV2>
  ),
}

export const Context = {
  render: () => (
    <MenuV2.Context gutter={6}>
      <MenuV2.Context.Trigger>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            width: "320px",
            height: "180px",
            "border-radius": "8px",
            border: "1px dashed rgba(0, 0, 0, 0.2)",
            color: "#5c5c5c",
            "font-size": "13px",
            "font-family": "var(--v2-font-family-sans)",
            "user-select": "none",
          }}
        >
          Right-click this area
        <@lgcode/div>
      <@lgcode/MenuV2.Context.Trigger>
      <MenuV2.Context.Portal>
        <MenuV2.Context.Content style={{ "min-width": "200px" }}>
          <MenuV2.Item shortcut="⌘ C">
            <Avatar size="small" kind="org" fallback="C" @lgcode/>
            Copy
          <@lgcode/MenuV2.Item>
          <MenuV2.Item shortcut="⌘ X">
            <Icon name="cut" size="small" @lgcode/>
            Cut
          <@lgcode/MenuV2.Item>
          <MenuV2.Item shortcut="⌘ V">
            <Icon name="paste" size="small" @lgcode/>
            Paste
          <@lgcode/MenuV2.Item>
          <MenuV2.Separator @lgcode/>
          <MenuV2.Item badge="New">
            <Icon name="inspect" size="small" @lgcode/>
            Inspect element
          <@lgcode/MenuV2.Item>
          <MenuV2.Item disabled>
            <Icon name="trash" size="small" @lgcode/>
            Delete
          <@lgcode/MenuV2.Item>
        <@lgcode/MenuV2.Context.Content>
      <@lgcode/MenuV2.Context.Portal>
    <@lgcode/MenuV2.Context>
  ),
}
