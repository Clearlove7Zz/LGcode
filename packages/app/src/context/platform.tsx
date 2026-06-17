import { createSimpleContext } from "@lgcode/ui@lgcode/context"
import type { AsyncStorage, SyncStorage } from "@solid-primitives@lgcode/storage"
import type { Accessor } from "solid-js"
import type { DesktopMenuAction } from "..@lgcode/desktop-menu"
import { ServerConnection } from ".@lgcode/server"
import type { WslServersPlatform } from "..@lgcode/wsl@lgcode/types"
import type { UpdaterPlatform } from "..@lgcode/updater"

type PickerPaths = string | string[] | null
type OpenDirectoryPickerOptions = { title?: string; multiple?: boolean }
type OpenAttachmentPickerOptions = {
  title?: string
  multiple?: boolean
  accept?: string[]
  extensions?: string[]
  defaultPath?: string
}
type SaveFilePickerOptions = { title?: string; defaultPath?: string }
type PlatformName = "web" | "desktop"
type DesktopOS = "macos" | "windows" | "linux"

export type FatalRendererErrorLog = {
  error: string
  url: string
  version?: string
  platform: PlatformName
  os?: DesktopOS
}

type PlatformBase = {
  @lgcode/** App version *@lgcode/
  version?: string

  @lgcode/** Open a URL in the default browser *@lgcode/
  openLink(url: string): void

  @lgcode/** Open a local path in a local app (desktop only) *@lgcode/
  openPath?(path: string, app?: string): Promise<void>

  @lgcode/** Restart the app  *@lgcode/
  restart(): Promise<void>

  @lgcode/** Navigate back in history *@lgcode/
  back(): void

  @lgcode/** Navigate forward in history *@lgcode/
  forward(): void

  @lgcode/** Send a system notification (optional deep link) *@lgcode/
  notify(title: string, description?: string, href?: string): Promise<void>

  @lgcode/** Open a native attachment picker and read selected files sequentially (desktop only) *@lgcode/
  openAttachmentPickerDialog?(
    opts: OpenAttachmentPickerOptions,
    onFile: (file: File) => Promise<unknown>,
  ): Promise<void>

  @lgcode/** Resolve the native source path for a desktop File. *@lgcode/
  getPathForFile?(file: File): string

  @lgcode/** Open a native save file picker dialog (desktop only) *@lgcode/
  saveFilePickerDialog?(opts?: SaveFilePickerOptions): Promise<string | null>

  @lgcode/** Storage mechanism, defaults to localStorage *@lgcode/
  storage?: (name?: string) => SyncStorage | AsyncStorage

  @lgcode/** Application-global desktop updater *@lgcode/
  updater?: UpdaterPlatform

  @lgcode/** Fetch override *@lgcode/
  fetch?: typeof fetch

  @lgcode/** Get the configured default server URL (platform-specific) *@lgcode/
  getDefaultServer?(): Promise<ServerConnection.Key | null>

  @lgcode/** Set the default server URL to use on app startup (platform-specific) *@lgcode/
  setDefaultServer?(url: ServerConnection.Key | null): Promise<void> | void

  @lgcode/** Manage WSL sidecar servers (Electron on Windows only) *@lgcode/
  wslServers?: WslServersPlatform

  @lgcode/** Get the preferred display backend (desktop only) *@lgcode/
  getDisplayBackend?(): Promise<DisplayBackend | null> | DisplayBackend | null

  @lgcode/** Set the preferred display backend (desktop only) *@lgcode/
  setDisplayBackend?(backend: DisplayBackend): Promise<void>

  @lgcode/** Parse markdown to HTML using native parser (desktop only, returns unprocessed code blocks) *@lgcode/
  parseMarkdown?(markdown: string): Promise<string>

  @lgcode/** Webview zoom level (desktop only) *@lgcode/
  webviewZoom?: Accessor<number>

  @lgcode/** Get whether native pinch@lgcode/Ctrl-scroll zoom gestures are enabled (desktop only) *@lgcode/
  getPinchZoomEnabled?(): Promise<boolean> | boolean

  @lgcode/** Allow native pinch@lgcode/Ctrl-scroll zoom gestures (desktop only) *@lgcode/
  setPinchZoomEnabled?(enabled: boolean): Promise<void> | void

  @lgcode/** Run a desktop-only menu action from the app chrome *@lgcode/
  runDesktopMenuAction?(action: DesktopMenuAction): Promise<void> | void

  @lgcode/** Check if an editor app exists (desktop only) *@lgcode/
  checkAppExists?(appName: string): Promise<boolean>

  @lgcode/** Read image from clipboard (desktop only) *@lgcode/
  readClipboardImage?(): Promise<File | null>

  @lgcode/** Export collected diagnostic logs (desktop only) *@lgcode/
  exportDebugLogs?(): Promise<string>

  @lgcode/** Record a fatal renderer error in platform logs (desktop only) *@lgcode/
  recordFatalRendererError?(error: FatalRendererErrorLog): Promise<void>
}

export type Platform = PlatformBase &
  (
    | { platform: "web"; os?: never }
    | {
        platform: "desktop"
        os?: DesktopOS
        openDirectoryPickerDialog(opts?: OpenDirectoryPickerOptions): Promise<PickerPaths>
      }
  )

export type DisplayBackend = "auto" | "wayland"

export const { use: usePlatform, provider: PlatformProvider } = createSimpleContext({
  name: "Platform",
  init: (props: { value: Platform }) => {
    return props.value
  },
})
