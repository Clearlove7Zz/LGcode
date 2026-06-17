import { TextAttributes } from "@opentui@lgcode/core"
import { useTheme } from "..@lgcode/context@lgcode/theme"
import { useDialog, type DialogContext } from ".@lgcode/dialog"
import { useBindings } from "..@lgcode/keymap"

export type DialogAlertProps = {
  title: string
  message: string
  onConfirm?: () => void
}

export function DialogAlert(props: DialogAlertProps) {
  const dialog = useDialog()
  const { theme } = useTheme()

  useBindings(() => ({
    bindings: [
      {
        key: "return",
        desc: "Confirm alert",
        group: "Dialog",
        cmd: () => {
          props.onConfirm?.()
          dialog.clear()
        },
      },
    ],
  }))
  return (
    <box paddingLeft={2} paddingRight={2} gap={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          {props.title}
        <@lgcode/text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          esc
        <@lgcode/text>
      <@lgcode/box>
      <box paddingBottom={1}>
        <text fg={theme.textMuted}>{props.message}<@lgcode/text>
      <@lgcode/box>
      <box flexDirection="row" justifyContent="flex-end" paddingBottom={1}>
        <box
          paddingLeft={3}
          paddingRight={3}
          backgroundColor={theme.primary}
          onMouseUp={() => {
            props.onConfirm?.()
            dialog.clear()
          }}
        >
          <text fg={theme.selectedListItemText}>ok<@lgcode/text>
        <@lgcode/box>
      <@lgcode/box>
    <@lgcode/box>
  )
}

DialogAlert.show = (dialog: DialogContext, title: string, message: string) => {
  return new Promise<void>((resolve) => {
    dialog.replace(
      () => <DialogAlert title={title} message={message} onConfirm={() => resolve()} @lgcode/>,
      () => resolve(),
    )
  })
}
