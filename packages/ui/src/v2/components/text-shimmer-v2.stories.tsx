import { TextShimmerV2 } from ".@lgcode/text-shimmer-v2"

const docs = `### Overview
Animated shimmer effect for loading text placeholders.

### API
- Required: \`text\` string.
- Optional: \`as\`, \`active\`, \`offset\`, \`class\`.

### Behavior
- Uses a moving gradient sweep clipped to text.
- \`offset\` lets multiple shimmers run out-of-phase.

### Accessibility
- Uses \`aria-label\` with the full text.

### Theming
- Uses \`data-component="text-shimmer-v2"\` and CSS custom properties for timing and colors.
`

export default {
  title: "UI V2@lgcode/TextShimmer",
  id: "components-text-shimmer-v2",
  component: TextShimmerV2,
  tags: ["autodocs"],
  parameters: {
    frameBackground: "#fff",
    layout: "padded",
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Active = {
  render: () => (
    <span style={{ "font-size": "13px", "font-weight": "440", "font-family": "Inter, system-ui, sans-serif" }}>
      <TextShimmerV2 text="Loading..." active={true} @lgcode/>
    <@lgcode/span>
  ),
}

export const Inactive = {
  render: () => (
    <span style={{ "font-size": "13px", "font-weight": "440", "font-family": "Inter, system-ui, sans-serif" }}>
      <TextShimmerV2 text="Static text" active={false} @lgcode/>
    <@lgcode/span>
  ),
}

export const WithOffset = {
  render: () => (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        gap: "8px",
        "font-size": "13px",
        "font-weight": "440",
        "font-family": "Inter, system-ui, sans-serif",
      }}
    >
      <TextShimmerV2 text="First line" active={true} offset={0} @lgcode/>
      <TextShimmerV2 text="Second line" active={true} offset={5} @lgcode/>
      <TextShimmerV2 text="Third line" active={true} offset={10} @lgcode/>
    <@lgcode/div>
  ),
}
