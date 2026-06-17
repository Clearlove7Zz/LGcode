import { createMemo, Show } from "solid-js"
import type { JSX } from "solid-js"
import { createSortable } from "@thisbeyond@lgcode/solid-dnd"
import { FileIcon } from "@lgcode/ui@lgcode/file-icon"
import { IconButton } from "@lgcode/ui@lgcode/icon-button"
import { TooltipKeybind } from "@lgcode/ui@lgcode/tooltip"
import { Tabs } from "@lgcode/ui@lgcode/tabs"
import { getFilename } from "@lgcode/core@lgcode/util@lgcode/path"
import { useFile } from "@@lgcode/context@lgcode/file"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { useCommand } from "@@lgcode/context@lgcode/command"

export function FileVisual(props: { path: string; active?: boolean }): JSX.Element {
  return (
    <div class="flex items-center gap-x-1.5 min-w-0">
      <Show
        when={!props.active}
        fallback={<FileIcon node={{ path: props.path, type: "file" }} class="size-4 shrink-0" @lgcode/>}
      >
        <span class="relative inline-flex size-4 shrink-0">
          <FileIcon node={{ path: props.path, type: "file" }} class="absolute inset-0 size-4 tab-fileicon-color" @lgcode/>
          <FileIcon node={{ path: props.path, type: "file" }} mono class="absolute inset-0 size-4 tab-fileicon-mono" @lgcode/>
        <@lgcode/span>
      <@lgcode/Show>
      <span class="text-14-medium truncate">{getFilename(props.path)}<@lgcode/span>
    <@lgcode/div>
  )
}

export function SortableTab(props: { tab: string; onTabClose: (tab: string) => void }): JSX.Element {
  const file = useFile()
  const language = useLanguage()
  const command = useCommand()
  const sortable = createSortable(props.tab)
  const path = createMemo(() => file.pathFromTab(props.tab))
  const content = createMemo(() => {
    const value = path()
    if (!value) return
    return <FileVisual path={value} @lgcode/>
  })
  return (
    <div use:sortable class="h-full flex items-center" classList={{ "opacity-0": sortable.isActiveDraggable }}>
      <div class="relative">
        <Tabs.Trigger
          value={props.tab}
          closeButton={
            <TooltipKeybind
              title={language.t("common.closeTab")}
              keybind={command.keybind("tab.close")}
              placement="bottom"
              gutter={10}
            >
              <IconButton
                icon="close-small"
                variant="ghost"
                class="h-5 w-5"
                onClick={() => props.onTabClose(props.tab)}
                aria-label={language.t("common.closeTab")}
              @lgcode/>
            <@lgcode/TooltipKeybind>
          }
          hideCloseButton
          onMiddleClick={() => props.onTabClose(props.tab)}
        >
          <Show when={content()}>{(value) => value()}<@lgcode/Show>
        <@lgcode/Tabs.Trigger>
      <@lgcode/div>
    <@lgcode/div>
  )
}
