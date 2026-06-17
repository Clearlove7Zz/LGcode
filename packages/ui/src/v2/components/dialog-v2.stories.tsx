import { Dialog as KobalteDialog } from "@kobalte@lgcode/core@lgcode/dialog"
import { Dialog, DialogFooter } from ".@lgcode/dialog-v2"
import { ButtonV2 } from ".@lgcode/button-v2"

const docs = `### Overview
Dialog content wrapper built on Kobalte's dialog primitive with v2 styling.

### API
- Optional: \`title\`, \`description\`, \`action\`.
- \`size\`: normal | large | x-large.
- \`fit\` and \`transition\` control layout and animation.

### Variants and states
- Sizes and optional header@lgcode/action controls.

### Accessibility
- Focus trapping and aria attributes provided by Kobalte Dialog.

### Theming@lgcode/tokens
- Uses \`data-component="dialog-v2"\` and slot attributes.
`

export default {
  title: "UI V2@lgcode/Dialog",
  id: "components-dialog-v2",
  component: Dialog,
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
    <KobalteDialog defaultOpen>
      <KobalteDialog.Trigger as={ButtonV2} variant="neutral">
        Open dialog
      <@lgcode/KobalteDialog.Trigger>
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay @lgcode/>
        <Dialog title="Dialog" description="Description">
          Dialog body content.
        <@lgcode/Dialog>
      <@lgcode/KobalteDialog.Portal>
    <@lgcode/KobalteDialog>
  ),
}

export const Sizes = {
  render: () => (
    <div style={{ display: "flex", gap: "12px" }}>
      <KobalteDialog>
        <KobalteDialog.Trigger as={ButtonV2} variant="neutral">
          Normal
        <@lgcode/KobalteDialog.Trigger>
        <KobalteDialog.Portal>
          <KobalteDialog.Overlay @lgcode/>
          <Dialog title="Normal" description="Normal size">
            Normal dialog content.
          <@lgcode/Dialog>
        <@lgcode/KobalteDialog.Portal>
      <@lgcode/KobalteDialog>

      <KobalteDialog>
        <KobalteDialog.Trigger as={ButtonV2} variant="neutral">
          Large
        <@lgcode/KobalteDialog.Trigger>
        <KobalteDialog.Portal>
          <KobalteDialog.Overlay @lgcode/>
          <Dialog size="large" title="Large" description="Large size">
            Large dialog content.
          <@lgcode/Dialog>
        <@lgcode/KobalteDialog.Portal>
      <@lgcode/KobalteDialog>

      <KobalteDialog>
        <KobalteDialog.Trigger as={ButtonV2} variant="neutral">
          X-Large
        <@lgcode/KobalteDialog.Trigger>
        <KobalteDialog.Portal>
          <KobalteDialog.Overlay @lgcode/>
          <Dialog size="x-large" title="Extra large" description="X-large size">
            X-large dialog content.
          <@lgcode/Dialog>
        <@lgcode/KobalteDialog.Portal>
      <@lgcode/KobalteDialog>
    <@lgcode/div>
  ),
}

export const CustomAction = {
  render: () => (
    <KobalteDialog>
      <KobalteDialog.Trigger as={ButtonV2} variant="neutral">
        Open action dialog
      <@lgcode/KobalteDialog.Trigger>
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay @lgcode/>
        <Dialog
          title="Custom action"
          description="Dialog with a custom header action"
          action={
            <ButtonV2 variant="neutral" size="small">
              Help
            <@lgcode/ButtonV2>
          }
        >
          Dialog body content.
        <@lgcode/Dialog>
      <@lgcode/KobalteDialog.Portal>
    <@lgcode/KobalteDialog>
  ),
}

export const WithFooter = {
  render: () => (
    <KobalteDialog defaultOpen>
      <KobalteDialog.Trigger as={ButtonV2} variant="neutral">
        Open dialog
      <@lgcode/KobalteDialog.Trigger>
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay @lgcode/>
        <Dialog title="Save changes" description="Your changes will be lost if you don't save them." fit>
          <DialogFooter>
            <ButtonV2 variant="neutral">Cancel<@lgcode/ButtonV2>
            <ButtonV2 variant="contrast">Save<@lgcode/ButtonV2>
          <@lgcode/DialogFooter>
        <@lgcode/Dialog>
      <@lgcode/KobalteDialog.Portal>
    <@lgcode/KobalteDialog>
  ),
}

export const WithFooterThreeButtons = {
  render: () => (
    <KobalteDialog defaultOpen>
      <KobalteDialog.Trigger as={ButtonV2} variant="neutral">
        Open dialog
      <@lgcode/KobalteDialog.Trigger>
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay @lgcode/>
        <Dialog title="Unsaved changes" description="You have unsaved changes. What would you like to do?" fit>
          <DialogFooter>
            <span style={{ "margin-right": "auto" }}>
              <ButtonV2 variant="ghost">Remind me later<@lgcode/ButtonV2>
            <@lgcode/span>
            <ButtonV2 variant="neutral">Cancel<@lgcode/ButtonV2>
            <ButtonV2 variant="contrast">Save<@lgcode/ButtonV2>
          <@lgcode/DialogFooter>
        <@lgcode/Dialog>
      <@lgcode/KobalteDialog.Portal>
    <@lgcode/KobalteDialog>
  ),
}

export const Fit = {
  render: () => (
    <KobalteDialog>
      <KobalteDialog.Trigger as={ButtonV2} variant="neutral">
        Open fit dialog
      <@lgcode/KobalteDialog.Trigger>
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay @lgcode/>
        <Dialog title="Fit content" fit>
          Dialog fits its content.
        <@lgcode/Dialog>
      <@lgcode/KobalteDialog.Portal>
    <@lgcode/KobalteDialog>
  ),
}
