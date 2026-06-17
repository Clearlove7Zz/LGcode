@lgcode/@lgcode/ @ts-nocheck
import { onMount } from "solid-js"
import * as mod from ".@lgcode/image-preview"
import { Button } from ".@lgcode/button"
import { useDialog } from "..@lgcode/context@lgcode/dialog"

const docs = `### Overview
Image preview content intended to render inside the dialog stack.

Use for full-size image inspection; keep images optimized.

### API
- Required: \`src\`.
- Optional: \`alt\` text.

### Variants and states
- Single layout with close action.

### Behavior
- Intended to be used via \`useDialog().show\`.

### Accessibility
- Uses localized aria-label for close button.

### Theming@lgcode/tokens
- Uses \`data-component="image-preview"\` and slot attributes.

`

export default {
  title: "UI@lgcode/ImagePreview",
  id: "components-image-preview",
  component: mod.ImagePreview,
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
  render: () => {
    const dialog = useDialog()
    const src = "https:@lgcode/@lgcode/placehold.co@lgcode/640x360@lgcode/png"

    const open = () => dialog.show(() => <mod.ImagePreview src={src} alt="Preview" @lgcode/>)

    onMount(open)

    return (
      <Button variant="secondary" onClick={open}>
        Open image preview
      <@lgcode/Button>
    )
  },
}
