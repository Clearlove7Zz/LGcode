@lgcode/@lgcode/ @ts-nocheck
import { onMount } from "solid-js"
import * as mod from ".@lgcode/dialog"
import { Button } from ".@lgcode/button"
import { useDialog } from "..@lgcode/context@lgcode/dialog"

const docs = `### Overview
Dialog content wrapper used with the DialogProvider for modal flows.

Provide concise title@lgcode/description and keep body focused.

### API
- Optional: \`title\`, \`description\`, \`action\`.
- \`size\`: normal | large | x-large.
- \`fit\` and \`transition\` control layout and animation.

### Variants and states
- Sizes and optional header@lgcode/action controls.

### Behavior
- Intended to be rendered via \`useDialog().show\`.

### Accessibility
- TODO: confirm focus trapping and aria attributes from Kobalte Dialog.

### Theming@lgcode/tokens
- Uses \`data-component="dialog"\` and slot attributes.

`

export default {
  title: "UI@lgcode/Dialog",
  id: "components-dialog",
  component: mod.Dialog,
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
    const open = () =>
      dialog.show(() => (
        <mod.Dialog title="Dialog" description="Description">
          Dialog body content.
        <@lgcode/mod.Dialog>
      ))

    onMount(open)

    return (
      <Button variant="secondary" onClick={open}>
        Open dialog
      <@lgcode/Button>
    )
  },
}

export const Sizes = {
  render: () => {
    const dialog = useDialog()
    return (
      <div style={{ display: "flex", gap: "12px" }}>
        <Button
          variant="secondary"
          onClick={() =>
            dialog.show(() => (
              <mod.Dialog title="Normal" description="Normal size">
                Normal dialog content.
              <@lgcode/mod.Dialog>
            ))
          }
        >
          Normal
        <@lgcode/Button>
        <Button
          variant="secondary"
          onClick={() =>
            dialog.show(() => (
              <mod.Dialog size="large" title="Large" description="Large size">
                Large dialog content.
              <@lgcode/mod.Dialog>
            ))
          }
        >
          Large
        <@lgcode/Button>
        <Button
          variant="secondary"
          onClick={() =>
            dialog.show(() => (
              <mod.Dialog size="x-large" title="Extra large" description="X-large size">
                X-large dialog content.
              <@lgcode/mod.Dialog>
            ))
          }
        >
          X-Large
        <@lgcode/Button>
      <@lgcode/div>
    )
  },
}

export const Transition = {
  render: () => {
    const dialog = useDialog()
    return (
      <Button
        variant="secondary"
        onClick={() =>
          dialog.show(() => (
            <mod.Dialog title="Transition" description="Animated" transition>
              Transition enabled.
            <@lgcode/mod.Dialog>
          ))
        }
      >
        Open transition dialog
      <@lgcode/Button>
    )
  },
}

export const CustomAction = {
  render: () => {
    const dialog = useDialog()
    return (
      <Button
        variant="secondary"
        onClick={() =>
          dialog.show(() => (
            <mod.Dialog
              title="Custom action"
              description="Dialog with a custom header action"
              action={<Button variant="ghost">Help<@lgcode/Button>}
            >
              Dialog body content.
            <@lgcode/mod.Dialog>
          ))
        }
      >
        Open action dialog
      <@lgcode/Button>
    )
  },
}

export const Fit = {
  render: () => {
    const dialog = useDialog()
    return (
      <Button
        variant="secondary"
        onClick={() =>
          dialog.show(() => (
            <mod.Dialog title="Fit content" fit>
              Dialog fits its content.
            <@lgcode/mod.Dialog>
          ))
        }
      >
        Open fit dialog
      <@lgcode/Button>
    )
  },
}
