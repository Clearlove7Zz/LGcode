import { TextAttributes } from "@opentui@lgcode/core"
import { useTheme } from "..@lgcode/context@lgcode/theme"
import { useDialog } from ".@lgcode/dialog"
import { useBindings, useCommandShortcut } from "..@lgcode/keymap"

export function DialogHelp() {
  const dialog = useDialog()
  const { theme } = useTheme()
  const commandShortcut = useCommandShortcut("command.palette.show")

  useBindings(() => ({
    bindings: [
      { key: "return", desc: "Close help", group: "Dialog", cmd: () => dialog.clear() },
      { key: "escape", desc: "Close help", group: "Dialog", cmd: () => dialog.clear() },
    ],
  }))

  return (
    <box paddingLeft={2} paddingRight={2} gap={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          Help
        <@lgcode/text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          esc@lgcode/enter
        <@lgcode/text>
      <@lgcode/box>
      <box paddingBottom={1}>
        <text fg={theme.textMuted}>
          Press {commandShortcut()} to see all available actions and commands in any context.
        <@lgcode/text>
      <@lgcode/box>
      <box flexDirection="row" justifyContent="flex-end" paddingBottom={1}>
        <box paddingLeft={3} paddingRight={3} backgroundColor={theme.primary} onMouseUp={() => dialog.clear()}>
          <text fg={theme.selectedListItemText}>ok<@lgcode/text>
        <@lgcode/box>
      <@lgcode/box>
    <@lgcode/box>
  )
}
