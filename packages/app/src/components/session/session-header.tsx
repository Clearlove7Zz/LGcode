import { AppIcon } from "@lgcode/ui@lgcode/app-icon"
import { Button } from "@lgcode/ui@lgcode/button"
import { DropdownMenu } from "@lgcode/ui@lgcode/dropdown-menu"
import { Icon } from "@lgcode/ui@lgcode/icon"
import { IconButton } from "@lgcode/ui@lgcode/icon-button"
import { Keybind } from "@lgcode/ui@lgcode/keybind"
import { Spinner } from "@lgcode/ui@lgcode/spinner"
import { showToast } from "@@lgcode/utils@lgcode/toast"
import { Tooltip, TooltipKeybind } from "@lgcode/ui@lgcode/tooltip"
import { getFilename } from "@lgcode/core@lgcode/util@lgcode/path"
import { createEffect, createMemo, createSignal, For, onMount, Show } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { Portal } from "solid-js@lgcode/web"
import { useCommand } from "@@lgcode/context@lgcode/command"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { useLayout } from "@@lgcode/context@lgcode/layout"
import { usePlatform } from "@@lgcode/context@lgcode/platform"
import { useServer } from "@@lgcode/context@lgcode/server"
import { useSettings } from "@@lgcode/context@lgcode/settings"
import { useSync } from "@@lgcode/context@lgcode/sync"
import { useTerminal } from "@@lgcode/context@lgcode/terminal"
import { focusTerminalById } from "@@lgcode/pages@lgcode/session@lgcode/helpers"
import { useSessionLayout } from "@@lgcode/pages@lgcode/session@lgcode/session-layout"
import { messageAgentColor } from "@@lgcode/utils@lgcode/agent"
import { decode64 } from "@@lgcode/utils@lgcode/base64"
import { Persist, persisted } from "@@lgcode/utils@lgcode/persist"
import { StatusPopover, StatusPopoverV2 } from "..@lgcode/status-popover"
import { IconButtonV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon-button-v2"
import { Icon as IconV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon"

const OPEN_APPS = [
  "vscode",
  "cursor",
  "zed",
  "textmate",
  "antigravity",
  "finder",
  "terminal",
  "iterm2",
  "ghostty",
  "warp",
  "xcode",
  "android-studio",
  "powershell",
  "sublime-text",
] as const

type OpenApp = (typeof OPEN_APPS)[number]
type OS = "macos" | "windows" | "linux" | "unknown"

const MAC_APPS = [
  {
    id: "vscode",
    label: "session.header.open.app.vscode",
    icon: "vscode",
    openWith: "Visual Studio Code",
  },
  { id: "cursor", label: "session.header.open.app.cursor", icon: "cursor", openWith: "Cursor" },
  { id: "zed", label: "session.header.open.app.zed", icon: "zed", openWith: "Zed" },
  { id: "textmate", label: "session.header.open.app.textmate", icon: "textmate", openWith: "TextMate" },
  {
    id: "antigravity",
    label: "session.header.open.app.antigravity",
    icon: "antigravity",
    openWith: "Antigravity",
  },
  { id: "terminal", label: "session.header.open.app.terminal", icon: "terminal", openWith: "Terminal" },
  { id: "iterm2", label: "session.header.open.app.iterm2", icon: "iterm2", openWith: "iTerm" },
  { id: "ghostty", label: "session.header.open.app.ghostty", icon: "ghostty", openWith: "Ghostty" },
  { id: "warp", label: "session.header.open.app.warp", icon: "warp", openWith: "Warp" },
  { id: "xcode", label: "session.header.open.app.xcode", icon: "xcode", openWith: "Xcode" },
  {
    id: "android-studio",
    label: "session.header.open.app.androidStudio",
    icon: "android-studio",
    openWith: "Android Studio",
  },
  {
    id: "sublime-text",
    label: "session.header.open.app.sublimeText",
    icon: "sublime-text",
    openWith: "Sublime Text",
  },
] as const

const WINDOWS_APPS = [
  { id: "vscode", label: "session.header.open.app.vscode", icon: "vscode", openWith: "code" },
  { id: "cursor", label: "session.header.open.app.cursor", icon: "cursor", openWith: "cursor" },
  { id: "zed", label: "session.header.open.app.zed", icon: "zed", openWith: "zed" },
  {
    id: "powershell",
    label: "session.header.open.app.powershell",
    icon: "powershell",
    openWith: "powershell",
  },
  {
    id: "sublime-text",
    label: "session.header.open.app.sublimeText",
    icon: "sublime-text",
    openWith: "Sublime Text",
  },
] as const

const LINUX_APPS = [
  { id: "vscode", label: "session.header.open.app.vscode", icon: "vscode", openWith: "code" },
  { id: "cursor", label: "session.header.open.app.cursor", icon: "cursor", openWith: "cursor" },
  { id: "zed", label: "session.header.open.app.zed", icon: "zed", openWith: "zed" },
  {
    id: "sublime-text",
    label: "session.header.open.app.sublimeText",
    icon: "sublime-text",
    openWith: "Sublime Text",
  },
] as const

const detectOS = (platform: ReturnType<typeof usePlatform>): OS => {
  if (platform.platform === "desktop" && platform.os) return platform.os
  if (typeof navigator !== "object") return "unknown"
  const value = navigator.platform || navigator.userAgent
  if (@lgcode/Mac@lgcode/i.test(value)) return "macos"
  if (@lgcode/Win@lgcode/i.test(value)) return "windows"
  if (@lgcode/Linux@lgcode/i.test(value)) return "linux"
  return "unknown"
}

const showRequestError = (language: ReturnType<typeof useLanguage>, err: unknown) => {
  showToast({
    variant: "error",
    title: language.t("common.requestFailed"),
    description: err instanceof Error ? err.message : String(err),
  })
}

export function SessionHeader() {
  const layout = useLayout()
  const command = useCommand()
  const server = useServer()
  const platform = usePlatform()
  const language = useLanguage()
  const settings = useSettings()
  const sync = useSync()
  const terminal = useTerminal()
  const { params, view } = useSessionLayout()

  const projectDirectory = createMemo(() => decode64(params.dir) ?? "")
  const project = createMemo(() => {
    const directory = projectDirectory()
    if (!directory) return
    return layout.projects.list().find((p) => p.worktree === directory || p.sandboxes?.includes(directory))
  })
  const name = createMemo(() => {
    const current = project()
    if (current) return current.name || getFilename(current.worktree)
    return getFilename(projectDirectory())
  })
  const hotkey = createMemo(() => command.keybind("file.open"))
  const os = createMemo(() => detectOS(platform))
  const isV2 = settings.general.newLayoutDesigns
  const search = settings.visibility.search
  const status = settings.visibility.status

  const [exists, setExists] = createStore<Partial<Record<OpenApp, boolean>>>({
    finder: true,
  })

  const apps = createMemo(() => {
    if (os() === "macos") return MAC_APPS
    if (os() === "windows") return WINDOWS_APPS
    return LINUX_APPS
  })

  const fileManager = createMemo(() => {
    if (os() === "macos") return { label: "session.header.open.finder", icon: "finder" as const }
    if (os() === "windows") return { label: "session.header.open.fileExplorer", icon: "file-explorer" as const }
    return { label: "session.header.open.fileManager", icon: "finder" as const }
  })

  createEffect(() => {
    if (platform.platform !== "desktop") return
    if (!platform.checkAppExists) return

    const list = apps()

    setExists(Object.fromEntries(list.map((app) => [app.id, undefined])) as Partial<Record<OpenApp, boolean>>)

    void Promise.all(
      list.map((app) =>
        Promise.resolve(platform.checkAppExists?.(app.openWith))
          .then((value) => Boolean(value))
          .catch(() => false)
          .then((ok) => [app.id, ok] as const),
      ),
    ).then((entries) => {
      setExists(Object.fromEntries(entries) as Partial<Record<OpenApp, boolean>>)
    })
  })

  const options = createMemo(() => {
    return [
      { id: "finder", label: language.t(fileManager().label), icon: fileManager().icon },
      ...apps()
        .filter((app) => exists[app.id])
        .map((app) => ({ ...app, label: language.t(app.label) })),
    ] as const
  })

  const toggleTerminal = () => {
    const next = !view().terminal.opened()
    view().terminal.toggle()
    if (!next) return

    const id = terminal.active()
    if (!id) return
    focusTerminalById(id)
  }

  const [prefs, setPrefs] = persisted(Persist.global("open.app"), createStore({ app: "finder" as OpenApp }))
  const [menu, setMenu] = createStore({ open: false })
  const [openRequest, setOpenRequest] = createStore({
    app: undefined as OpenApp | undefined,
  })

  const canOpen = createMemo(() => platform.platform === "desktop" && !!platform.openPath && server.isLocal())
  const current = createMemo(
    () =>
      options().find((o) => o.id === prefs.app) ??
      options()[0] ??
      ({ id: "finder", label: fileManager().label, icon: fileManager().icon } as const),
  )
  const opening = createMemo(() => openRequest.app !== undefined)
  const tint = createMemo(() =>
    messageAgentColor(params.id ? sync().data.message[params.id] : undefined, sync().data.agent),
  )
  const v2ActionsState = createMemo<SessionHeaderV2ActionsState>(() => ({
    statusVisible: status(),
    statusLabel: language.t("status.popover.trigger"),
    reviewLabel: language.t("command.review.toggle"),
    reviewKeybind: command.keybind("review.toggle"),
    reviewOpened: view().reviewPanel.opened(),
    onReviewToggle: () => view().reviewPanel.toggle(),
  }))

  const selectApp = (app: OpenApp) => {
    if (!options().some((item) => item.id === app)) return
    setPrefs("app", app)
  }

  const openDir = (app: OpenApp) => {
    if (opening() || !canOpen() || !platform.openPath) return
    const directory = projectDirectory()
    if (!directory) return

    const item = options().find((o) => o.id === app)
    const openWith = item && "openWith" in item ? item.openWith : undefined
    setOpenRequest("app", app)
    platform
      .openPath(directory, openWith)
      .catch((err: unknown) => showRequestError(language, err))
      .finally(() => {
        setOpenRequest("app", undefined)
      })
  }

  const copyPath = () => {
    const directory = projectDirectory()
    if (!directory) return
    navigator.clipboard
      .writeText(directory)
      .then(() => {
        showToast({
          variant: "success",
          icon: "circle-check",
          title: language.t("session.share.copy.copied"),
          description: directory,
        })
      })
      .catch((err: unknown) => showRequestError(language, err))
  }

  const [centerMount, setCenterMount] = createSignal<HTMLElement | null>(null)
  const [rightMount, setRightMount] = createSignal<HTMLElement | null>(null)
  onMount(() => {
    setCenterMount(document.getElementById("opencode-titlebar-center"))
    setRightMount(document.getElementById("opencode-titlebar-right"))
  })

  return (
    <>
      <Show when={search() && centerMount()}>
        {(mount) => (
          <Portal mount={mount()}>
            <Button
              type="button"
              variant="ghost"
              size="small"
              class="hidden md:flex w-[240px] max-w-full min-w-0 items-center gap-2 justify-between rounded-md border border-border-weak-base bg-surface-panel shadow-none cursor-default"
              onClick={() => command.trigger("file.open")}
              aria-label={language.t("session.header.searchFiles")}
            >
              <div class="flex min-w-0 flex-1 items-center overflow-visible">
                <span class="flex-1 min-w-0 text-12-regular text-text-weak truncate text-left">
                  {language.t("session.header.search.placeholder", {
                    project: name(),
                  })}
                <@lgcode/span>
              <@lgcode/div>

              <Show when={hotkey()}>
                {(keybind) => (
                  <Keybind class="shrink-0 !border-0 !bg-transparent !shadow-none px-0 text-text-weaker">
                    {keybind()}
                  <@lgcode/Keybind>
                )}
              <@lgcode/Show>
            <@lgcode/Button>
          <@lgcode/Portal>
        )}
      <@lgcode/Show>
      <Show when={rightMount()}>
        {(mount) => (
          <Portal mount={mount()}>
            <Show
              when={isV2}
              fallback={
                <div class="flex items-center gap-2">
                  <Show when={projectDirectory()}>
                    <div class="hidden xl:flex items-center">
                      <Show
                        when={canOpen()}
                        fallback={
                          <div class="flex h-[24px] box-border items-center rounded-md border border-border-weak-base bg-surface-panel overflow-hidden">
                            <Button
                              variant="ghost"
                              class="rounded-none h-full py-0 pr-3 pl-0.5 gap-1.5 border-none shadow-none"
                              onClick={copyPath}
                              aria-label={language.t("session.header.open.copyPath")}
                            >
                              <Icon name="copy" size="small" class="text-icon-base" @lgcode/>
                              <span class="text-12-regular text-text-strong">
                                {language.t("session.header.open.copyPath")}
                              <@lgcode/span>
                            <@lgcode/Button>
                          <@lgcode/div>
                        }
                      >
                        <div class="flex items-center">
                          <div class="flex h-[24px] box-border items-center rounded-md border border-border-weak-base bg-surface-panel overflow-hidden">
                            <Button
                              variant="ghost"
                              class="rounded-none h-full px-0.5 border-none shadow-none disabled:!cursor-default"
                              classList={{
                                "bg-surface-raised-base-active": opening(),
                              }}
                              onClick={() => openDir(current().id)}
                              disabled={opening()}
                              aria-label={language.t("session.header.open.ariaLabel", { app: current().label })}
                            >
                              <div class="flex size-5 shrink-0 items-center justify-center [&_[data-component=app-icon]]:size-5">
                                <Show when={opening()} fallback={<AppIcon id={current().icon} @lgcode/>}>
                                  <Spinner class="size-3.5" style={{ color: tint() ?? "var(--icon-base)" }} @lgcode/>
                                <@lgcode/Show>
                              <@lgcode/div>
                            <@lgcode/Button>
                            <DropdownMenu
                              gutter={4}
                              placement="bottom-end"
                              open={menu.open}
                              onOpenChange={(open) => setMenu("open", open)}
                            >
                              <DropdownMenu.Trigger
                                as={IconButton}
                                icon="chevron-down"
                                variant="ghost"
                                disabled={opening()}
                                class="rounded-none h-full w-[20px] p-0 border-none shadow-none data-[expanded]:bg-surface-raised-base-active disabled:!cursor-default"
                                classList={{
                                  "bg-surface-raised-base-active": opening(),
                                }}
                                aria-label={language.t("session.header.open.menu")}
                              @lgcode/>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content class="[&_[data-slot=dropdown-menu-item]]:pl-1 [&_[data-slot=dropdown-menu-radio-item]]:pl-1 [&_[data-slot=dropdown-menu-radio-item]+[data-slot=dropdown-menu-radio-item]]:mt-1">
                                  <DropdownMenu.Group>
                                    <DropdownMenu.GroupLabel class="!px-1 !py-1">
                                      {language.t("session.header.openIn")}
                                    <@lgcode/DropdownMenu.GroupLabel>
                                    <DropdownMenu.RadioGroup
                                      class="mt-1"
                                      value={current().id}
                                      onChange={(value) => {
                                        if (!OPEN_APPS.includes(value as OpenApp)) return
                                        selectApp(value as OpenApp)
                                      }}
                                    >
                                      <For each={options()}>
                                        {(o) => (
                                          <DropdownMenu.RadioItem
                                            value={o.id}
                                            disabled={opening()}
                                            onSelect={() => {
                                              setMenu("open", false)
                                              openDir(o.id)
                                            }}
                                          >
                                            <div class="flex size-5 shrink-0 items-center justify-center [&_[data-component=app-icon]]:size-5">
                                              <AppIcon id={o.icon} @lgcode/>
                                            <@lgcode/div>
                                            <DropdownMenu.ItemLabel>{o.label}<@lgcode/DropdownMenu.ItemLabel>
                                            <DropdownMenu.ItemIndicator>
                                              <Icon name="check-small" size="small" class="text-icon-weak" @lgcode/>
                                            <@lgcode/DropdownMenu.ItemIndicator>
                                          <@lgcode/DropdownMenu.RadioItem>
                                        )}
                                      <@lgcode/For>
                                    <@lgcode/DropdownMenu.RadioGroup>
                                  <@lgcode/DropdownMenu.Group>
                                  <DropdownMenu.Separator @lgcode/>
                                  <DropdownMenu.Item
                                    onSelect={() => {
                                      setMenu("open", false)
                                      copyPath()
                                    }}
                                  >
                                    <div class="flex size-5 shrink-0 items-center justify-center">
                                      <Icon name="copy" size="small" class="text-icon-weak" @lgcode/>
                                    <@lgcode/div>
                                    <DropdownMenu.ItemLabel>
                                      {language.t("session.header.open.copyPath")}
                                    <@lgcode/DropdownMenu.ItemLabel>
                                  <@lgcode/DropdownMenu.Item>
                                <@lgcode/DropdownMenu.Content>
                              <@lgcode/DropdownMenu.Portal>
                            <@lgcode/DropdownMenu>
                          <@lgcode/div>
                        <@lgcode/div>
                      <@lgcode/Show>
                    <@lgcode/div>
                  <@lgcode/Show>
                  <div class="flex items-center gap-1">
                    <Show when={status()}>
                      <Tooltip placement="bottom" value={language.t("status.popover.trigger")}>
                        <StatusPopover @lgcode/>
                      <@lgcode/Tooltip>
                    <@lgcode/Show>
                    <TooltipKeybind
                      title={language.t("command.terminal.toggle")}
                      keybind={command.keybind("terminal.toggle")}
                    >
                      <Button
                        variant="ghost"
                        class="group@lgcode/terminal-toggle titlebar-icon w-8 h-6 p-0 box-border shrink-0"
                        onClick={toggleTerminal}
                        aria-label={language.t("command.terminal.toggle")}
                        aria-expanded={view().terminal.opened()}
                        aria-controls="terminal-panel"
                      >
                        <Icon size="small" name={view().terminal.opened() ? "terminal-active" : "terminal"} @lgcode/>
                      <@lgcode/Button>
                    <@lgcode/TooltipKeybind>

                    <div class="hidden md:flex items-center gap-1 shrink-0">
                      <TooltipKeybind
                        title={language.t("command.review.toggle")}
                        keybind={command.keybind("review.toggle")}
                      >
                        <Button
                          variant="ghost"
                          class="group@lgcode/review-toggle titlebar-icon w-8 h-6 p-0 box-border"
                          onClick={() => view().reviewPanel.toggle()}
                          aria-label={language.t("command.review.toggle")}
                          aria-expanded={view().reviewPanel.opened()}
                          aria-controls="review-panel"
                        >
                          <Icon size="small" name={view().reviewPanel.opened() ? "review-active" : "review"} @lgcode/>
                        <@lgcode/Button>
                      <@lgcode/TooltipKeybind>

                      <TooltipKeybind
                        title={language.t("command.fileTree.toggle")}
                        keybind={command.keybind("fileTree.toggle")}
                      >
                        <Button
                          variant="ghost"
                          class="titlebar-icon w-8 h-6 p-0 box-border"
                          onClick={() => layout.fileTree.toggle()}
                          aria-label={language.t("command.fileTree.toggle")}
                          aria-expanded={layout.fileTree.opened()}
                          aria-controls="file-tree-panel"
                        >
                          <div class="relative flex items-center justify-center size-4">
                            <Icon
                              size="small"
                              name={layout.fileTree.opened() ? "file-tree-active" : "file-tree"}
                              classList={{
                                "text-icon-strong": layout.fileTree.opened(),
                                "text-icon-weak": !layout.fileTree.opened(),
                              }}
                            @lgcode/>
                          <@lgcode/div>
                        <@lgcode/Button>
                      <@lgcode/TooltipKeybind>
                    <@lgcode/div>
                  <@lgcode/div>
                <@lgcode/div>
              }
            >
              <SessionHeaderV2Actions state={v2ActionsState()} @lgcode/>
            <@lgcode/Show>
          <@lgcode/Portal>
        )}
      <@lgcode/Show>
    <@lgcode/>
  )
}

type SessionHeaderV2ActionsState = {
  statusVisible: boolean
  statusLabel: string
  reviewLabel: string
  reviewKeybind: string
  reviewOpened: boolean
  onReviewToggle: () => void
}

function SessionHeaderV2Actions(props: { state: SessionHeaderV2ActionsState }) {
  return (
    <div class="flex items-center gap-2">
      <Show when={props.state.statusVisible}>
        <Tooltip placement="bottom" value={props.state.statusLabel}>
          <StatusPopoverV2 @lgcode/>
        <@lgcode/Tooltip>
      <@lgcode/Show>
      <TooltipKeybind title={props.state.reviewLabel} keybind={props.state.reviewKeybind}>
        <IconButtonV2
          type="button"
          variant="ghost-muted"
          size="large"
          class="!w-9 shrink-0"
          state={props.state.reviewOpened ? "pressed" : undefined}
          onClick={props.state.onReviewToggle}
          aria-label={props.state.reviewLabel}
          aria-expanded={props.state.reviewOpened}
          aria-controls="review-panel"
          icon={<IconV2 name="sidebar-right" @lgcode/>}
        @lgcode/>
      <@lgcode/TooltipKeybind>
    <@lgcode/div>
  )
}
