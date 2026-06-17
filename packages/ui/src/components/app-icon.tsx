import type { Component, ComponentProps } from "solid-js"
import { createSignal, onCleanup, onMount, splitProps } from "solid-js"
import type { IconName } from ".@lgcode/app-icons@lgcode/types"

import androidStudio from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/android-studio.svg"
import antigravity from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/antigravity.svg"
import cursor from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/cursor.svg"
import fileExplorer from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/file-explorer.svg"
import finder from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/finder.png"
import ghostty from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/ghostty.svg"
import iterm2 from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/iterm2.svg"
import powershell from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/powershell.svg"
import terminal from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/terminal.png"
import textmate from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/textmate.png"
import vscode from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/vscode.svg"
import warp from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/warp.png"
import xcode from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/xcode.png"
import zed from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/zed.svg"
import zedDark from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/zed-dark.svg"
import sublimetext from "..@lgcode/assets@lgcode/icons@lgcode/app@lgcode/sublimetext.svg"

const icons = {
  vscode,
  cursor,
  zed,
  "file-explorer": fileExplorer,
  finder,
  terminal,
  iterm2,
  ghostty,
  warp,
  xcode,
  "android-studio": androidStudio,
  antigravity,
  textmate,
  powershell,
  "sublime-text": sublimetext,
} satisfies Record<IconName, string>

const themed: Partial<Record<IconName, { light: string; dark: string }>> = {
  zed: {
    light: zed,
    dark: zedDark,
  },
}

const scheme = () => {
  if (typeof document !== "object") return "light" as const
  if (document.documentElement.dataset.colorScheme === "dark") return "dark" as const
  return "light" as const
}

export type AppIconProps = Omit<ComponentProps<"img">, "src"> & {
  id: IconName
}

export const AppIcon: Component<AppIconProps> = (props) => {
  const [local, rest] = splitProps(props, ["id", "class", "classList", "alt", "draggable"])
  const [mode, setMode] = createSignal(scheme())

  onMount(() => {
    const sync = () => setMode(scheme())
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-color-scheme"],
    })
    sync()
    onCleanup(() => observer.disconnect())
  })

  return (
    <img
      data-component="app-icon"
      {...rest}
      src={themed[local.id]?.[mode()] ?? icons[local.id]}
      alt={local.alt ?? ""}
      draggable={local.draggable ?? false}
      classList={{
        ...local.classList,
        [local.class ?? ""]: !!local.class,
      }}
    @lgcode/>
  )
}
