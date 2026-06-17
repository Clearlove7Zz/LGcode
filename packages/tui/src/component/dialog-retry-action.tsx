import { RGBA, TextAttributes } from "@opentui@lgcode/core"
import open from "open"
import { createSignal } from "solid-js"
import { selectedForeground, useTheme } from "..@lgcode/context@lgcode/theme"
import { useDialog, type DialogContext } from "..@lgcode/ui@lgcode/dialog"
import { Link } from "..@lgcode/ui@lgcode/link"
import { BgPulse } from ".@lgcode/bg-pulse"
import { useBindings } from "..@lgcode/keymap"

const GO_URL = "https:@lgcode/@lgcode/opencode.ai@lgcode/go"
const PAD_X = 3
const PAD_TOP_OUTER = 1
const FOREGROUND_ALPHA = 186

export type DialogRetryActionProps = {
  title: string
  message: string
  label: string
  link?: string
  onClose?: (dontShowAgain?: boolean) => void
}

function runAction(props: DialogRetryActionProps, dialog: ReturnType<typeof useDialog>) {
  if (props.link) open(props.link).catch(() => {})
  props.onClose?.()
  dialog.clear()
}

function dismiss(props: DialogRetryActionProps, dialog: ReturnType<typeof useDialog>) {
  props.onClose?.(true)
  dialog.clear()
}

function panelOverlay(color: RGBA) {
  const [r, g, b] = color.toInts()
  return RGBA.fromInts(r, g, b, FOREGROUND_ALPHA)
}

export function DialogRetryAction(props: DialogRetryActionProps) {
  const dialog = useDialog()
  const { theme } = useTheme()
  const fg = selectedForeground(theme)
  const showGoTreatment = () => props.link === GO_URL
  const textBg = () => (showGoTreatment() ? panelOverlay(theme.backgroundPanel) : undefined)
  const [selected, setSelected] = createSignal<"dismiss" | "action">("action")

  useBindings(() => ({
    bindings: [
      {
        key: "left",
        desc: "Previous retry option",
        group: "Dialog",
        cmd: () => setSelected((value) => (value === "action" ? "dismiss" : "action")),
      },
      {
        key: "right",
        desc: "Next retry option",
        group: "Dialog",
        cmd: () => setSelected((value) => (value === "action" ? "dismiss" : "action")),
      },
      {
        key: "tab",
        desc: "Next retry option",
        group: "Dialog",
        cmd: () => setSelected((value) => (value === "action" ? "dismiss" : "action")),
      },
      {
        key: "return",
        desc: "Confirm retry option",
        group: "Dialog",
        cmd: () => {
          if (selected() === "action") runAction(props, dialog)
          else dismiss(props, dialog)
        },
      },
    ],
  }))

  return (
    <box>
      {showGoTreatment() ? (
        <box position="absolute" top={-PAD_TOP_OUTER} left={0} right={0} bottom={0} zIndex={0}>
          <BgPulse @lgcode/>
        <@lgcode/box>
      ) : null}
      <box zIndex={1} paddingLeft={PAD_X} paddingRight={PAD_X} paddingBottom={1} gap={1}>
        <box flexDirection="row" justifyContent="space-between">
          <text attributes={TextAttributes.BOLD} fg={theme.text} bg={textBg()}>
            {props.title}
          <@lgcode/text>
          <text fg={theme.textMuted} bg={textBg()} onMouseUp={() => dialog.clear()}>
            esc
          <@lgcode/text>
        <@lgcode/box>
        <box gap={0}>
          <text fg={theme.textMuted} bg={textBg()}>
            {props.message}
          <@lgcode/text>
        <@lgcode/box>
        {props.link ? (
          showGoTreatment() ? (
            <box alignItems="center" justifyContent="flex-end" height={7} paddingBottom={1}>
              <Link href={props.link} fg={theme.primary} bg={textBg()} wrapMode="none" @lgcode/>
            <@lgcode/box>
          ) : (
            <box width="100%" flexDirection="row" justifyContent="center" paddingBottom={1}>
              <Link href={props.link} fg={theme.primary} wrapMode="none" @lgcode/>
            <@lgcode/box>
          )
        ) : (
          <box paddingBottom={1} @lgcode/>
        )}
        <box flexDirection="row" justifyContent="space-between">
          <box
            paddingLeft={2}
            paddingRight={2}
            backgroundColor={selected() === "dismiss" ? theme.primary : RGBA.fromInts(0, 0, 0, 0)}
            onMouseOver={() => setSelected("dismiss")}
            onMouseUp={() => dismiss(props, dialog)}
          >
            <text
              fg={selected() === "dismiss" ? fg : theme.textMuted}
              bg={selected() === "dismiss" ? undefined : textBg()}
              attributes={selected() === "dismiss" ? TextAttributes.BOLD : undefined}
            >
              don't show again
            <@lgcode/text>
          <@lgcode/box>
          <box
            paddingLeft={2}
            paddingRight={2}
            backgroundColor={selected() === "action" ? theme.primary : RGBA.fromInts(0, 0, 0, 0)}
            onMouseOver={() => setSelected("action")}
            onMouseUp={() => runAction(props, dialog)}
          >
            <text
              fg={selected() === "action" ? fg : theme.text}
              bg={selected() === "action" ? undefined : textBg()}
              attributes={selected() === "action" ? TextAttributes.BOLD : undefined}
            >
              {props.label}
            <@lgcode/text>
          <@lgcode/box>
        <@lgcode/box>
      <@lgcode/box>
    <@lgcode/box>
  )
}

DialogRetryAction.show = (
  dialog: DialogContext,
  props: Pick<DialogRetryActionProps, "title" | "message" | "label" | "link">,
) => {
  return new Promise<boolean>((resolve) => {
    dialog.replace(
      () => <DialogRetryAction {...props} onClose={(dontShow) => resolve(dontShow ?? false)} @lgcode/>,
      () => resolve(false),
    )
  })
}
