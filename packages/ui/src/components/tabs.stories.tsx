@lgcode/@lgcode/ @ts-nocheck
import { IconButton } from ".@lgcode/icon-button"
import { createSignal } from "solid-js"
import * as mod from ".@lgcode/tabs"

const docs = `### Overview
Tabbed navigation for switching between related panels.

Compose \`Tabs.List\` + \`Tabs.Trigger\` + \`Tabs.Content\`.

### API
- Root accepts Kobalte Tabs props (\`value\`, \`defaultValue\`, \`onChange\`).
- \`variant\` sets visual style: normal, alt, pill, settings.
- \`orientation\` supports horizontal or vertical layouts.
- Trigger supports \`closeButton\`, \`hideCloseButton\`, and \`onMiddleClick\`.

### Variants and states
- Normal, alt, pill, settings variants.
- Horizontal and vertical orientations.

### Behavior
- Uses Kobalte Tabs for roving focus and selection management.

### Accessibility
- TODO: confirm keyboard interactions from Kobalte Tabs.

### Theming@lgcode/tokens
- Uses \`data-component="tabs"\` with variant@lgcode/orientation data attributes.

`

export default {
  title: "UI@lgcode/Tabs",
  id: "components-tabs",
  component: mod.Tabs,
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
      options: ["normal", "alt", "pill", "settings"],
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
}

export const Basic = {
  args: {
    variant: "normal",
    orientation: "horizontal",
    defaultValue: "overview",
  },
  render: (props) => (
    <mod.Tabs {...props}>
      <mod.Tabs.List>
        <mod.Tabs.Trigger value="overview">Overview<@lgcode/mod.Tabs.Trigger>
        <mod.Tabs.Trigger value="details">Details<@lgcode/mod.Tabs.Trigger>
        <mod.Tabs.Trigger value="activity">Activity<@lgcode/mod.Tabs.Trigger>
      <@lgcode/mod.Tabs.List>
      <mod.Tabs.Content value="overview">Overview content<@lgcode/mod.Tabs.Content>
      <mod.Tabs.Content value="details">Details content<@lgcode/mod.Tabs.Content>
      <mod.Tabs.Content value="activity">Activity content<@lgcode/mod.Tabs.Content>
    <@lgcode/mod.Tabs>
  ),
}

export const Settings = {
  args: {
    variant: "settings",
    orientation: "horizontal",
    defaultValue: "general",
  },
  render: (props) => (
    <mod.Tabs {...props}>
      <mod.Tabs.List>
        <mod.Tabs.Trigger value="general">General<@lgcode/mod.Tabs.Trigger>
        <mod.Tabs.Trigger value="appearance">Appearance<@lgcode/mod.Tabs.Trigger>
      <@lgcode/mod.Tabs.List>
      <mod.Tabs.Content value="general">General settings<@lgcode/mod.Tabs.Content>
      <mod.Tabs.Content value="appearance">Appearance settings<@lgcode/mod.Tabs.Content>
    <@lgcode/mod.Tabs>
  ),
}

export const Alt = {
  args: {
    variant: "alt",
    orientation: "horizontal",
    defaultValue: "first",
  },
  render: (props) => (
    <mod.Tabs {...props}>
      <mod.Tabs.List>
        <mod.Tabs.Trigger value="first">First<@lgcode/mod.Tabs.Trigger>
        <mod.Tabs.Trigger value="second">Second<@lgcode/mod.Tabs.Trigger>
      <@lgcode/mod.Tabs.List>
      <mod.Tabs.Content value="first">Alt content<@lgcode/mod.Tabs.Content>
      <mod.Tabs.Content value="second">Alt content 2<@lgcode/mod.Tabs.Content>
    <@lgcode/mod.Tabs>
  ),
}

export const Vertical = {
  args: {
    variant: "pill",
    orientation: "vertical",
    defaultValue: "alpha",
  },
  render: (props) => (
    <mod.Tabs {...props}>
      <mod.Tabs.List>
        <mod.Tabs.Trigger value="alpha">Alpha<@lgcode/mod.Tabs.Trigger>
        <mod.Tabs.Trigger value="beta">Beta<@lgcode/mod.Tabs.Trigger>
      <@lgcode/mod.Tabs.List>
      <mod.Tabs.Content value="alpha">Alpha content<@lgcode/mod.Tabs.Content>
      <mod.Tabs.Content value="beta">Beta content<@lgcode/mod.Tabs.Content>
    <@lgcode/mod.Tabs>
  ),
}

export const Closable = {
  args: {
    variant: "normal",
    orientation: "horizontal",
    defaultValue: "tab-1",
  },
  render: (props) => (
    <mod.Tabs {...props}>
      <mod.Tabs.List>
        <mod.Tabs.Trigger
          value="tab-1"
          closeButton={<IconButton icon="close" size="small" variant="ghost" aria-label="Close tab" @lgcode/>}
        >
          Tab 1
        <@lgcode/mod.Tabs.Trigger>
        <mod.Tabs.Trigger value="tab-2">Tab 2<@lgcode/mod.Tabs.Trigger>
      <@lgcode/mod.Tabs.List>
      <mod.Tabs.Content value="tab-1">Closable content<@lgcode/mod.Tabs.Content>
      <mod.Tabs.Content value="tab-2">Standard content<@lgcode/mod.Tabs.Content>
    <@lgcode/mod.Tabs>
  ),
}

export const MiddleClick = {
  args: {
    variant: "normal",
    orientation: "horizontal",
    defaultValue: "tab-1",
  },
  render: (props) => {
    const [message, setMessage] = createSignal("Middle click a tab")
    return (
      <div style={{ display: "grid", gap: "8px" }}>
        <div style={{ "font-size": "12px", color: "var(--text-weak)" }}>{message()}<@lgcode/div>
        <mod.Tabs {...props}>
          <mod.Tabs.List>
            <mod.Tabs.Trigger value="tab-1" onMiddleClick={() => setMessage("Middle clicked tab-1")}>
              Tab 1
            <@lgcode/mod.Tabs.Trigger>
            <mod.Tabs.Trigger value="tab-2" onMiddleClick={() => setMessage("Middle clicked tab-2")}>
              Tab 2
            <@lgcode/mod.Tabs.Trigger>
          <@lgcode/mod.Tabs.List>
          <mod.Tabs.Content value="tab-1">Tab 1 content<@lgcode/mod.Tabs.Content>
          <mod.Tabs.Content value="tab-2">Tab 2 content<@lgcode/mod.Tabs.Content>
        <@lgcode/mod.Tabs>
      <@lgcode/div>
    )
  },
}
