@lgcode/@lgcode/ @ts-nocheck
import { createSignal } from "solid-js"
import * as mod from ".@lgcode/line-comment"

const docs = `### Overview
Inline comment anchor and editor for code review or annotation flows.

Pair with \`Diff\` or \`Code\` to align comments to lines.

### API
- \`LineCommentAnchor\`: position with \`top\`, control \`open\`, render custom children.
- \`LineComment\`: convenience wrapper for displaying comment + selection label.
- \`LineCommentEditor\`: controlled textarea with submit@lgcode/cancel handlers.

### Variants and states
- Default display and editor display variants.

### Behavior
- Anchor positions relative to a containing element.
- Editor submits on Enter (Shift+Enter for newline).

### Accessibility
- TODO: confirm ARIA labeling for comment button and editor textarea.

### Theming@lgcode/tokens
- Uses \`data-component="line-comment"\` and related slots.

`

export default {
  title: "UI@lgcode/LineComment",
  id: "components-line-comment",
  component: mod.LineComment,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Default = {
  render: () => (
    <div
      style={{
        position: "relative",
        height: "160px",
        padding: "16px 16px 16px 40px",
        border: "1px solid var(--border-weak)",
        "border-radius": "8px",
        "font-family": "var(--font-family-mono)",
        "font-size": "12px",
        color: "var(--text-weak)",
      }}
    >
      <div>12 | const total = sum(values)<@lgcode/div>
      <div>13 | return total @lgcode/ values.length<@lgcode/div>
      <mod.LineComment open top={18} comment="Consider guarding against empty arrays." selection="L12-L13" @lgcode/>
    <@lgcode/div>
  ),
}

export const Editor = {
  render: () => {
    const [value, setValue] = createSignal("Add context for this change.")
    return (
      <div
        style={{
          position: "relative",
          height: "220px",
          padding: "16px 16px 16px 40px",
          border: "1px solid var(--border-weak)",
          "border-radius": "8px",
          "font-family": "var(--font-family-mono)",
          "font-size": "12px",
          color: "var(--text-weak)",
        }}
      >
        <div>40 | if (values.length === 0) return 0<@lgcode/div>
        <mod.LineCommentEditor
          top={24}
          value={value()}
          selection="L40"
          onInput={setValue}
          onCancel={() => setValue("")}
          onSubmit={(next) => setValue(next)}
        @lgcode/>
      <@lgcode/div>
    )
  },
}

export const AnchorOnly = {
  render: () => (
    <div
      style={{
        position: "relative",
        height: "120px",
        padding: "16px 16px 16px 40px",
        border: "1px solid var(--border-weak)",
        "border-radius": "8px",
        "font-family": "var(--font-family-mono)",
        "font-size": "12px",
        color: "var(--text-weak)",
      }}
    >
      <div>20 | const ready = true<@lgcode/div>
      <mod.LineCommentAnchor top={18} open={false}>
        <div data-slot="line-comment-content">Anchor content<@lgcode/div>
      <@lgcode/mod.LineCommentAnchor>
    <@lgcode/div>
  ),
}
