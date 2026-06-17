@lgcode/@lgcode/ Lifecycle management for the split-footer renderer.
@lgcode/@lgcode/
@lgcode/@lgcode/ Creates the OpenTUI CliRenderer in split-footer mode, resolves the theme
@lgcode/@lgcode/ from the terminal palette, writes the entry splash to scrollback, and
@lgcode/@lgcode/ constructs the RunFooter. Returns a Lifecycle handle whose close() writes
@lgcode/@lgcode/ the exit splash and tears everything down in the right order:
@lgcode/@lgcode/ footer.close → footer.destroy → renderer shutdown.
@lgcode/@lgcode/
@lgcode/@lgcode/ Also wires SIGINT so Ctrl-c clears a live prompt draft first, then falls
@lgcode/@lgcode/ back to the usual two-press exit sequence through RunFooter.requestExit().
import path from "path"
import { CliRenderEvents, createCliRenderer, type CliRenderer, type ScrollbackWriter } from "@opentui@lgcode/core"
import { createDefaultOpenTuiKeymap } from "@opentui@lgcode/keymap@lgcode/opentui"
import { Global } from "@lgcode/core@lgcode/global"
import { openEditor } from "@lgcode/tui@lgcode/editor"
import { registerOpencodeKeymap } from "@lgcode/tui@lgcode/keymap"
import { Session as SessionApi } from "@@lgcode/session@lgcode/session"
import * as Locale from "@@lgcode/util@lgcode/locale"
import { resolveInteractiveStdin } from ".@lgcode/runtime.stdin"
import { entrySplash, exitSplash, splashMeta } from ".@lgcode/splash"
import { resolveRunTheme } from ".@lgcode/theme"
import type {
  FooterApi,
  PermissionReply,
  QuestionReject,
  QuestionReply,
  RunAgent,
  RunInput,
  RunPrompt,
  RunResource,
  RunTuiConfig,
} from ".@lgcode/types"
import { formatModelLabel } from ".@lgcode/variant.shared"

const FOOTER_HEIGHT = 4

type SplashState = {
  entry: boolean
  exit: boolean
}

type CycleResult = {
  modelLabel?: string
  status?: string
  variant?: string | undefined
  variants?: string[]
}

type FooterLabels = {
  agentLabel: string
  modelLabel: string
}

export type LifecycleInput = {
  directory: string
  findFiles: (query: string) => Promise<string[]>
  agents: RunAgent[]
  resources: RunResource[]
  sessionID: string
  sessionTitle?: string
  getSessionID?: () => string | undefined
  first: boolean
  history: RunPrompt[]
  agent: string | undefined
  model: RunInput["model"]
  variant: string | undefined
  tuiConfig: RunTuiConfig
  backgroundSubagents: boolean
  onPermissionReply: (input: PermissionReply) => void | Promise<void>
  onQuestionReply: (input: QuestionReply) => void | Promise<void>
  onQuestionReject: (input: QuestionReject) => void | Promise<void>
  onCycleVariant?: () => CycleResult | void
  onModelSelect?: (model: NonNullable<RunInput["model"]>) => CycleResult | void | Promise<CycleResult | void>
  onVariantSelect?: (variant: string | undefined) => CycleResult | void | Promise<CycleResult | void>
  onInterrupt?: () => void
  onBackground?: () => void
  onSubagentSelect?: (sessionID: string | undefined) => void
}

export type Lifecycle = {
  footer: FooterApi
  onResize(fn: () => void): () => void
  refreshTheme(): void
  resetForReplay(input: { sessionTitle?: string; sessionID?: string; history: RunPrompt[] }): Promise<void>
  close(input: { showExit: boolean; sessionTitle?: string; sessionID?: string; history?: RunPrompt[] }): Promise<void>
}

@lgcode/@lgcode/ Gracefully tears down the renderer. Order matters: switch external output
@lgcode/@lgcode/ back to passthrough before leaving split-footer mode, so pending stdout
@lgcode/@lgcode/ doesn't get captured into the now-dead scrollback pipeline.
function shutdown(renderer: CliRenderer): void {
  if (renderer.isDestroyed) {
    return
  }

  if (renderer.externalOutputMode === "capture-stdout") {
    renderer.externalOutputMode = "passthrough"
  }

  if (renderer.screenMode === "split-footer") {
    renderer.screenMode = "main-screen"
  }

  if (!renderer.isDestroyed) {
    renderer.destroy()
  }
}

function splashInfo(title: string | undefined, history: RunPrompt[]) {
  if (title && !SessionApi.isDefaultTitle(title)) {
    return {
      title,
      showSession: true,
    }
  }

  const next = history.find((item) => item.text.trim().length > 0)
  return {
    title: next?.text ?? title,
    showSession: !!next,
  }
}

function footerLabels(input: Pick<RunInput, "agent" | "model" | "variant">): FooterLabels {
  const agentLabel = Locale.titlecase(input.agent ?? "build")

  if (!input.model) {
    return {
      agentLabel,
      modelLabel: "Model default",
    }
  }

  return {
    agentLabel,
    modelLabel: formatModelLabel(input.model, input.variant),
  }
}

function directoryLabel(directory: string) {
  const resolved = path.resolve(directory)
  const display =
    resolved === Global.Path.home
      ? "~"
      : resolved.startsWith(`${Global.Path.home}${path.sep}`)
        ? resolved.replace(Global.Path.home, "~")
        : resolved
  return display.replaceAll("\\", "@lgcode/")
}

function queueSplash(
  renderer: Pick<CliRenderer, "writeToScrollback" | "requestRender">,
  state: SplashState,
  phase: keyof SplashState,
  write: ScrollbackWriter | undefined,
): boolean {
  if (state[phase]) {
    return false
  }

  if (!write) {
    return false
  }

  state[phase] = true
  renderer.writeToScrollback(write)
  renderer.requestRender()
  return true
}

@lgcode/@lgcode/ Boots the split-footer renderer and constructs the RunFooter.
@lgcode/@lgcode/
@lgcode/@lgcode/ The renderer starts in split-footer mode with captured stdout so that
@lgcode/@lgcode/ scrollback commits and footer repaints happen in the same frame. After
@lgcode/@lgcode/ the entry splash, RunFooter takes over the footer region.
export async function createRuntimeLifecycle(input: LifecycleInput): Promise<Lifecycle> {
  const source = resolveInteractiveStdin()
  let unregisterKeymap: (() => void) | undefined

  try {
    const renderer = await createCliRenderer({
      stdin: source.stdin,
      targetFps: 30,
      maxFps: 60,
      useMouse: false,
      autoFocus: false,
      openConsoleOnError: false,
      exitOnCtrlC: false,
      useKittyKeyboard: { events: process.platform === "win32" },
      screenMode: "split-footer",
      footerHeight: FOOTER_HEIGHT,
      externalOutputMode: "capture-stdout",
      consoleMode: "disabled",
      clearOnShutdown: false,
    })
    const theme = await resolveRunTheme(renderer)
    renderer.setBackgroundColor(theme.background)
    const keymap = createDefaultOpenTuiKeymap(renderer)
    unregisterKeymap = registerOpencodeKeymap(keymap, renderer, input.tuiConfig)
    const state: SplashState = {
      entry: false,
      exit: false,
    }
    const splash = splashInfo(input.sessionTitle, input.history)
    const meta = splashMeta({
      title: splash.title,
      session_id: input.sessionID,
    })
    const labels = footerLabels({
      agent: input.agent,
      model: input.model,
      variant: input.variant,
    })
    const footerTask = import(".@lgcode/footer")
    const wrote = queueSplash(
      renderer,
      state,
      "entry",
      entrySplash({
        ...meta,
        theme: theme.splash,
        showSession: splash.showSession,
        detail: directoryLabel(input.directory),
      }),
    )
    await renderer.idle().catch(() => {})

    const { RunFooter } = await footerTask
    let closed = false
    let sigintRegistered = false

    const footer = new RunFooter(renderer, {
      directory: input.directory,
      findFiles: input.findFiles,
      agents: input.agents,
      resources: input.resources,
      sessionID: input.getSessionID ?? (() => input.sessionID),
      ...labels,
      model: input.model,
      variant: input.variant,
      first: input.first,
      history: input.history,
      theme,
      wrote,
      keymap,
      tuiConfig: input.tuiConfig,
      backgroundSubagents: input.backgroundSubagents,
      diffStyle: input.tuiConfig.diff_style ?? "auto",
      onPermissionReply: input.onPermissionReply,
      onQuestionReply: input.onQuestionReply,
      onQuestionReject: input.onQuestionReject,
      onCycleVariant: input.onCycleVariant,
      onModelSelect: input.onModelSelect,
      onVariantSelect: input.onVariantSelect,
      onInterrupt: input.onInterrupt,
      onBackground: input.onBackground,
      onEditorOpen: async ({ value }) => {
        if (closed || renderer.isDestroyed) {
          return
        }

        await renderer.idle().catch(() => {})
        const ignore = () => {}
        detachSigint()
        process.on("SIGINT", ignore)
        try {
          return await openEditor({
            value,
            cwd: input.directory,
            renderer,
            stdin: source.stdin,
          })
        } finally {
          process.off("SIGINT", ignore)
          attachSigint()
        }
      },
      onSubagentSelect: input.onSubagentSelect,
    })

    const sigint = () => {
      footer.requestExit()
    }

    const attachSigint = () => {
      if (closed || sigintRegistered) {
        return
      }

      process.on("SIGINT", sigint)
      sigintRegistered = true
    }

    const detachSigint = () => {
      if (!sigintRegistered) {
        return
      }

      process.off("SIGINT", sigint)
      sigintRegistered = false
    }

    attachSigint()

    const close = async (next: {
      showExit: boolean
      sessionTitle?: string
      sessionID?: string
      history?: RunPrompt[]
    }) => {
      if (closed) {
        return
      }

      closed = true
      detachSigint()
      let wroteExit = false

      try {
        await footer.idle().catch(() => {})

        const show = renderer.isDestroyed ? false : next.showExit
        if (!renderer.isDestroyed && show) {
          const sessionID = next.sessionID || input.getSessionID?.() || input.sessionID
          const splash = splashInfo(next.sessionTitle ?? input.sessionTitle, next.history ?? input.history)
          wroteExit = queueSplash(
            renderer,
            state,
            "exit",
            exitSplash({
              ...splashMeta({
                title: splash.title,
                session_id: sessionID,
              }),
              theme: footer.currentTheme().splash,
            }),
          )
          await renderer.idle().catch(() => {})
        }
      } finally {
        footer.close()
        await footer.idle().catch(() => {})
        footer.destroy()
        unregisterKeymap?.()
        shutdown(renderer)
        if (!wroteExit) {
          process.stdout.write("\n")
        }
        source.cleanup?.()
      }
    }

    return {
      footer,
      refreshTheme() {
        footer.refreshTheme()
      },
      onResize(fn) {
        let width = renderer.terminalWidth
        let height = renderer.terminalHeight
        const resize = () => {
          if (width === renderer.terminalWidth && height === renderer.terminalHeight) {
            return
          }

          width = renderer.terminalWidth
          height = renderer.terminalHeight
          fn()
        }
        renderer.on(CliRenderEvents.RESIZE, resize)
        return () => renderer.off(CliRenderEvents.RESIZE, resize)
      },
      async resetForReplay(next) {
        if (closed || renderer.isDestroyed || footer.isClosed) {
          throw new Error("runtime closed")
        }

        await footer.idle()
        if (closed || renderer.isDestroyed || footer.isClosed) {
          throw new Error("runtime closed")
        }

        footer.resetForReplay(true)
        renderer.resetSplitFooterForReplay({ clearSavedLines: true })
        const splash = splashInfo(next.sessionTitle ?? input.sessionTitle, next.history)
        renderer.writeToScrollback(
          entrySplash({
            ...splashMeta({
              title: splash.title,
              session_id: next.sessionID ?? input.getSessionID?.() ?? input.sessionID,
            }),
            theme: footer.currentTheme().splash,
            showSession: splash.showSession,
            detail: directoryLabel(input.directory),
          }),
        )
        renderer.requestRender()
      },
      close,
    }
  } catch (error) {
    unregisterKeymap?.()
    source.cleanup?.()
    throw error
  }
}
