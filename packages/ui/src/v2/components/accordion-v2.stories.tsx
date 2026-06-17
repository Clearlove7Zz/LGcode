@lgcode/@lgcode/ @ts-nocheck
import { AccordionV2 } from ".@lgcode/accordion-v2"

const docs = `### Overview
Compound accordion built on Kobalte's \`Accordion\` primitive. The trigger automatically renders a chevron that rotates open.

### API
- \`AccordionV2\` — root; forwards Kobalte props (\`multiple\`, \`collapsible\`, \`value\`, \`defaultValue\`, \`onChange\`, etc.).
- \`AccordionV2.Item\` — one expandable row; requires a unique \`value: string\`.
- \`AccordionV2.Header\` — wraps the trigger; preserves heading semantics.
- \`AccordionV2.Trigger\` — auto-renders a trailing chevron; pass \`hideChevron\` to opt out.
- \`AccordionV2.Content\` — body shown when the item is expanded; height-animated.

### Behavior
- Single-select by default (\`collapsible\` allows closing the active item). Use \`multiple\` to let several items open at once.
- Open@lgcode/closed state is reflected on items, triggers, and content via \`data-expanded\` @lgcode/ \`data-closed\`.
- Content height animates using Kobalte's \`--kb-collapsible-content-height\` variable.
`

export default {
  title: "UI V2@lgcode/Accordion",
  id: "components-accordion-v2",
  component: AccordionV2,
  tags: ["autodocs"],
  parameters: {
    frameBackground: "#f5f5f5",
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

const frame = { width: "346px", "font-family": "var(--v2-font-family-sans)", "font-size": "13px" } as const

export const Basic = {
  render: () => (
    <div style={frame}>
      <AccordionV2 collapsible defaultValue={["item-1"]}>
        <AccordionV2.Item value="item-1">
          <AccordionV2.Header>
            <AccordionV2.Trigger>Is it accessible?<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>
            Yes. It follows the WAI-ARIA Accordion pattern and ships with full keyboard support.
          <@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
        <AccordionV2.Item value="item-2">
          <AccordionV2.Header>
            <AccordionV2.Trigger>Is it styled?<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>Yeah<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
        <AccordionV2.Item value="item-3">
          <AccordionV2.Header>
            <AccordionV2.Trigger>Is it animated?<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>Yes. Height animates via Kobalte's collapsible height variable.<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
      <@lgcode/AccordionV2>
    <@lgcode/div>
  ),
}

export const Multiple = {
  render: () => (
    <div style={frame}>
      <AccordionV2 multiple defaultValue={["a", "c"]}>
        <AccordionV2.Item value="a">
          <AccordionV2.Header>
            <AccordionV2.Trigger>Section A<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>Multiple items can be open at once.<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
        <AccordionV2.Item value="b">
          <AccordionV2.Header>
            <AccordionV2.Trigger>Section B<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>Open me too.<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
        <AccordionV2.Item value="c">
          <AccordionV2.Header>
            <AccordionV2.Trigger>Section C<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>Already open by default.<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
      <@lgcode/AccordionV2>
    <@lgcode/div>
  ),
}

export const Disabled = {
  render: () => (
    <div style={frame}>
      <AccordionV2 collapsible>
        <AccordionV2.Item value="one">
          <AccordionV2.Header>
            <AccordionV2.Trigger>Enabled item<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>Body content.<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
        <AccordionV2.Item value="two" disabled>
          <AccordionV2.Header>
            <AccordionV2.Trigger>Disabled item<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>You can't open this one.<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
        <AccordionV2.Item value="three">
          <AccordionV2.Header>
            <AccordionV2.Trigger>Another enabled item<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>Body content.<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
      <@lgcode/AccordionV2>
    <@lgcode/div>
  ),
}

export const LongContent = {
  render: () => (
    <div style={frame}>
      <AccordionV2 collapsible defaultValue={["long"]}>
        <AccordionV2.Item value="long">
          <AccordionV2.Header>
            <AccordionV2.Trigger>What's inside?<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>
            <div style={{ display: "grid", gap: "8px" }}>
              <p style={{ margin: 0 }}>
                Accordions are useful for compressing dense content into scannable sections. They preserve heading
                semantics and announce open@lgcode/closed state to screen readers.
              <@lgcode/p>
              <p style={{ margin: 0 }}>
                The body can hold arbitrary content — paragraphs, lists, even nested components.
              <@lgcode/p>
              <ul style={{ margin: 0, "padding-left": "16px" }}>
                <li>Keyboard navigable<@lgcode/li>
                <li>Animated<@lgcode/li>
                <li>Themeable via CSS variables<@lgcode/li>
              <@lgcode/ul>
            <@lgcode/div>
          <@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
        <AccordionV2.Item value="short">
          <AccordionV2.Header>
            <AccordionV2.Trigger>One more<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>Short body.<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
      <@lgcode/AccordionV2>
    <@lgcode/div>
  ),
}

export const NoChevron = {
  render: () => (
    <div style={frame}>
      <AccordionV2 collapsible>
        <AccordionV2.Item value="x">
          <AccordionV2.Header>
            <AccordionV2.Trigger hideChevron>Trigger without chevron<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>
            Pass <code>hideChevron<@lgcode/code> on the trigger.
          <@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
        <AccordionV2.Item value="y">
          <AccordionV2.Header>
            <AccordionV2.Trigger>Default trigger<@lgcode/AccordionV2.Trigger>
          <@lgcode/AccordionV2.Header>
          <AccordionV2.Content>Chevron renders by default.<@lgcode/AccordionV2.Content>
        <@lgcode/AccordionV2.Item>
      <@lgcode/AccordionV2>
    <@lgcode/div>
  ),
}
