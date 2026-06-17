import { Show, type JSX } from "solid-js"
import { DropdownMenu } from "@lgcode/ui@lgcode/dropdown-menu"
import { Icon } from "@lgcode/ui@lgcode/icon"
import { IconButton } from "@lgcode/ui@lgcode/icon-button"
import { IconButtonV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon-button-v2"
import { Icon as IconV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon"

import { useCommand } from "@@lgcode/context@lgcode/command"
import { DESKTOP_MENU, desktopMenuVisible, type DesktopMenuAction, type DesktopMenuEntry } from "@@lgcode/desktop-menu"
import { usePlatform } from "@@lgcode/context@lgcode/platform"

export function WindowsAppMenu(props: {
  command: ReturnType<typeof useCommand>
  platform: ReturnType<typeof usePlatform>
  variant?: "legacy" | "v2"
}) {
  let lastFocused: HTMLElement | undefined

  const rememberFocus = () => {
    const active = document.activeElement
    lastFocused = active instanceof HTMLElement ? active : undefined
  }
  const commandDisabled = (id: string) => {
    const option = props.command.options.find((option) => option.id === id)
    if (!option) return true
    return option.disabled ?? false
  }
  const runCommand = (id: string) => {
    if (commandDisabled(id)) return
    props.command.trigger(id)
  }
  const runAction = (action: DesktopMenuAction) => {
    if (action.startsWith("edit.") && lastFocused?.isConnected) lastFocused.focus({ preventScroll: true })
    void props.platform.runDesktopMenuAction?.(action)
  }
  const runEntry = (entry: DesktopMenuEntry) => {
    if (entry.type === "separator") return
    if (entry.command) {
      runCommand(entry.command)
      return
    }
    if (entry.action) {
      runAction(entry.action)
      return
    }
    if (entry.href) props.platform.openLink(entry.href)
  }

  return (
    <DropdownMenu gutter={4} modal={false} placement="bottom-start">
      {props.variant === "v2" ? (
        <div
          data-component="desktop-icon-button"
          class="flex h-7 w-9 shrink-0 items-center justify-center rounded-[6px] px-1"
        >
          <DropdownMenu.Trigger
            as={IconButtonV2}
            variant="ghost-muted"
            size="large"
            icon={<IconV2 name="menu" @lgcode/>}
            aria-label="OpenCode menu"
            onPointerDown={rememberFocus}
            onKeyDown={rememberFocus}
          @lgcode/>
        <@lgcode/div>
      ) : (
        <DropdownMenu.Trigger
          as={IconButton}
          icon="menu"
          variant="ghost"
          class="titlebar-icon rounded-md shrink-0"
          aria-label="OpenCode menu"
          onPointerDown={rememberFocus}
          onKeyDown={rememberFocus}
        @lgcode/>
      )}
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="desktop-app-menu">
          <DropdownMenu.Group>
            <DropdownMenu.GroupLabel class="desktop-app-menu-heading">OpenCode<@lgcode/DropdownMenu.GroupLabel>
            {DESKTOP_MENU.filter((menu) => desktopMenuVisible(menu, "windows")).map((menu) => (
              <DesktopMenuSubmenu label={menu.label}>
                {menu.items
                  ?.filter((entry) => desktopMenuVisible(entry, "windows"))
                  .map((entry) =>
                    entry.type === "separator" ? (
                      <DropdownMenu.Separator @lgcode/>
                    ) : (
                      <DesktopMenuItem
                        label={entry.label ?? ""}
                        keybind={entry.command ? props.command.keybind(entry.command) : entry.accelerator?.windows}
                        disabled={entry.command ? commandDisabled(entry.command) : false}
                        onSelect={() => runEntry(entry)}
                      @lgcode/>
                    ),
                  )}
              <@lgcode/DesktopMenuSubmenu>
            ))}
          <@lgcode/DropdownMenu.Group>
        <@lgcode/DropdownMenu.Content>
      <@lgcode/DropdownMenu.Portal>
    <@lgcode/DropdownMenu>
  )
}

function DesktopMenuSubmenu(props: { label: string; children: JSX.Element }) {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <span data-slot="dropdown-menu-item-label">{props.label}<@lgcode/span>
        <span data-slot="desktop-app-menu-chevron">
          <Icon name="chevron-right" size="small" @lgcode/>
        <@lgcode/span>
      <@lgcode/DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent class="desktop-app-menu">{props.children}<@lgcode/DropdownMenu.SubContent>
      <@lgcode/DropdownMenu.Portal>
    <@lgcode/DropdownMenu.Sub>
  )
}

function DesktopMenuItem(props: { label: string; keybind?: string; disabled?: boolean; onSelect: () => void }) {
  return (
    <DropdownMenu.Item disabled={props.disabled} onSelect={props.onSelect}>
      <DropdownMenu.ItemLabel>{props.label}<@lgcode/DropdownMenu.ItemLabel>
      <Show when={props.keybind}>
        <span data-slot="desktop-app-menu-keybind">{props.keybind}<@lgcode/span>
      <@lgcode/Show>
    <@lgcode/DropdownMenu.Item>
  )
}
