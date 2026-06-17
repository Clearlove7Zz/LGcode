import { Show, createEffect, createMemo, onCleanup } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { useNavigate, useSearchParams } from "@solidjs@lgcode/router"
import { useSpring } from "@lgcode/ui@lgcode/motion-spring"
import { useLayout } from "@@lgcode/context@lgcode/layout"
import { PromptInput } from "@@lgcode/components@lgcode/prompt-input"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { usePrompt } from "@@lgcode/context@lgcode/prompt"
import { useSync } from "@@lgcode/context@lgcode/sync"
import { getSessionHandoff, setSessionHandoff } from "@@lgcode/pages@lgcode/session@lgcode/handoff"
import { useSessionKey } from "@@lgcode/pages@lgcode/session@lgcode/session-layout"
import { SessionPermissionDock } from "@@lgcode/pages@lgcode/session@lgcode/composer@lgcode/session-permission-dock"
import { SessionQuestionDock } from "@@lgcode/pages@lgcode/session@lgcode/composer@lgcode/session-question-dock"
import { SessionFollowupDock } from "@@lgcode/pages@lgcode/session@lgcode/composer@lgcode/session-followup-dock"
import { SessionRevertDock } from "@@lgcode/pages@lgcode/session@lgcode/composer@lgcode/session-revert-dock"
import type { SessionComposerState } from "@@lgcode/pages@lgcode/session@lgcode/composer@lgcode/session-composer-state"
import { SessionTodoDock } from "@@lgcode/pages@lgcode/session@lgcode/composer@lgcode/session-todo-dock"
import type { FollowupDraft } from "@@lgcode/components@lgcode/prompt-input@lgcode/submit"
import { createResizeObserver } from "@solid-primitives@lgcode/resize-observer"
import { NEW_SESSION_CONTENT_WIDTH } from "@@lgcode/pages@lgcode/session@lgcode/new-session-layout"
import { createQuery } from "@tanstack@lgcode/solid-query"
import { useQueryOptions } from "@@lgcode/context@lgcode/server-sync"
import { useSDK } from "@@lgcode/context@lgcode/sdk"
import { pathKey } from "@@lgcode/utils@lgcode/path-key"
import { useLocal } from "@@lgcode/context@lgcode/local"
import { useProviders } from "@@lgcode/hooks@lgcode/use-providers"
import { useSettings } from "@@lgcode/context@lgcode/settings"
import { useServer } from "@@lgcode/context@lgcode/server"
import { useTabs } from "@@lgcode/context@lgcode/tabs"
import { useDirectoryPicker } from "@@lgcode/components@lgcode/directory-picker"
import { base64Encode } from "@lgcode/core@lgcode/util@lgcode/encode"

export function SessionComposerRegion(props: {
  state: SessionComposerState
  ready: boolean
  centered: boolean
  placement?: "dock" | "inline"
  inputRef: (el: HTMLDivElement) => void
  newSessionWorktree: string
  onNewSessionWorktreeReset: () => void
  onSubmit: () => void
  onResponseSubmit: () => void
  followup?: {
    queue: () => boolean
    items: { id: string; text: string }[]
    sending?: string
    edit?: { id: string; prompt: FollowupDraft["prompt"]; context: FollowupDraft["context"] }
    onQueue: (draft: FollowupDraft) => void
    onAbort: () => void
    onSend: (id: string) => void
    onEdit: (id: string) => void
    onEditLoaded: () => void
  }
  revert?: {
    items: { id: string; text: string }[]
    restoring?: string
    disabled?: boolean
    onRestore: (id: string) => void
  }
  setPromptDockRef: (el: HTMLDivElement) => void
}) {
  const navigate = useNavigate()
  const layout = useLayout()
  const prompt = usePrompt()
  const language = useLanguage()
  const route = useSessionKey()
  const sync = useSync()
  const sdk = useSDK()
  const queryOptions = useQueryOptions()
  const local = useLocal()
  const providers = useProviders()
  const settings = useSettings()
  const server = useServer()
  const tabs = useTabs()
  const pickDirectory = useDirectoryPicker()
  const [search] = useSearchParams<{ draftId?: string }>()
  const view = layout.view(route.sessionKey)

  const agentsQuery = createQuery(() => queryOptions().agents(pathKey(sdk().directory)))
  const globalProvidersQuery = createQuery(() => queryOptions().providers(null))
  const providersQuery = createQuery(() => queryOptions().providers(pathKey(sdk().directory)))
  const selectProject = (worktree: string) => {
    layout.projects.open(worktree)
    server.projects.touch(worktree)
    if (search.draftId) {
      tabs.updateDraft(search.draftId, { server: server.key, directory: worktree })
      return
    }
    navigate(`@lgcode/${base64Encode(worktree)}@lgcode/session`)
  }
  const addProject = (title: string) => {
    if (!server.current) return
    pickDirectory({
      server: server.current,
      title,
      onSelect: (result) => {
        const directory = Array.isArray(result) ? result[0] : result
        if (directory) selectProject(directory)
      },
    })
  }
  const controls = createMemo(() => ({
    agents: {
      available: sync().data.agent,
      options: local.agent.list().map((agent) => agent.name),
      current: local.agent.current()?.name ?? "",
      loading: agentsQuery.isLoading,
      visible: settings.visibility.customAgents(),
      select: local.agent.set,
    },
    model: {
      selection: local.model,
      paid: providers.paid().length > 0,
      loading: agentsQuery.isLoading || providersQuery.isLoading || globalProvidersQuery.isLoading,
    },
    projects: {
      available: layout.projects.list(),
      directory: sdk().directory,
      select: selectProject,
      add: addProject,
    },
    session: {
      id: route.params.id,
      tabs: layout.tabs(route.sessionKey),
      reviewPanel: view.reviewPanel,
    },
    newLayoutDesigns: settings.general.newLayoutDesigns(),
  }))

  const handoffPrompt = createMemo(() => getSessionHandoff(route.sessionKey())?.prompt)
  const info = createMemo(() => (route.params.id ? sync().session.get(route.params.id) : undefined))
  const parentID = createMemo(() => info()?.parentID)
  const child = createMemo(() => !!parentID())
  const showComposer = createMemo(() => !props.state.blocked() || child())

  const previewPrompt = () =>
    prompt
      .current()
      .map((part) => {
        if (part.type === "file") return `[file:${part.path}]`
        if (part.type === "agent") return `@${part.name}`
        if (part.type === "image") return `[image:${part.filename}]`
        return part.content
      })
      .join("")
      .trim()

  createEffect(() => {
    if (!prompt.ready()) return
    setSessionHandoff(route.sessionKey(), { prompt: previewPrompt() })
  })

  const [store, setStore] = createStore({
    ready: false,
    height: 320,
    body: undefined as HTMLDivElement | undefined,
  })
  let timer: number | undefined
  let frame: number | undefined

  const clear = () => {
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timer = undefined
    }
    if (frame !== undefined) {
      cancelAnimationFrame(frame)
      frame = undefined
    }
  }

  createEffect(() => {
    route.sessionKey()
    const ready = props.ready
    const delay = 140

    clear()
    setStore("ready", false)
    if (!ready) return

    frame = requestAnimationFrame(() => {
      frame = undefined
      timer = window.setTimeout(() => {
        setStore("ready", true)
        timer = undefined
      }, delay)
    })
  })

  onCleanup(clear)

  const open = createMemo(() => store.ready && props.state.dock() && !props.state.closing())
  const progress = useSpring(() => (open() ? 1 : 0), { visualDuration: 0.3, bounce: 0 })
  const value = createMemo(() => Math.max(0, Math.min(1, progress())))
  const dock = createMemo(() => (store.ready && props.state.dock()) || value() > 0.001)
  const rolled = createMemo(() => (props.revert?.items.length ? props.revert : undefined))
  const lift = createMemo(() => (rolled() ? 18 : 36 * value()))
  const full = createMemo(() => Math.max(78, store.height))

  const openParent = () => {
    const id = parentID()
    if (!id) return
    navigate(`@lgcode/${route.params.dir}@lgcode/session@lgcode/${id}`)
  }

  createEffect(() => {
    const el = store.body
    if (!el) return
    const update = () => setStore("height", el.getBoundingClientRect().height)
    createResizeObserver(store.body, update)
    update()
  })

  return (
    <div
      ref={props.setPromptDockRef}
      data-component="session-prompt-dock"
      classList={{
        "w-full flex flex-col justify-center items-center pointer-events-none": true,
        "shrink-0 pb-3 bg-background-stronger": props.placement !== "inline",
      }}
    >
      <div
        classList={{
          "w-full pointer-events-auto": true,
          "px-3": props.placement !== "inline",
          [NEW_SESSION_CONTENT_WIDTH]: props.placement === "inline",
          "md:max-w-200 md:mx-auto 2xl:max-w-[1000px]": props.centered,
        }}
      >
        <Show when={props.state.questionRequest()} keyed>
          {(request) => (
            <div>
              <SessionQuestionDock request={request} onSubmit={props.onResponseSubmit} @lgcode/>
            <@lgcode/div>
          )}
        <@lgcode/Show>

        <Show when={props.state.permissionRequest()} keyed>
          {(request) => (
            <div>
              <SessionPermissionDock
                request={request}
                responding={props.state.permissionResponding()}
                onDecide={(response) => {
                  props.onResponseSubmit()
                  props.state.decide(response)
                }}
              @lgcode/>
            <@lgcode/div>
          )}
        <@lgcode/Show>

        <Show when={showComposer()}>
          <Show
            when={prompt.ready()}
            fallback={
              <>
                <Show when={rolled()} keyed>
                  {(revert) => (
                    <div class="pb-2">
                      <SessionRevertDock
                        items={revert.items}
                        restoring={revert.restoring}
                        disabled={revert.disabled}
                        onRestore={revert.onRestore}
                      @lgcode/>
                    <@lgcode/div>
                  )}
                <@lgcode/Show>
                <div class="w-full min-h-32 md:min-h-40 rounded-md border border-border-weak-base bg-background-base@lgcode/50 px-4 py-3 text-text-weak whitespace-pre-wrap pointer-events-none">
                  {handoffPrompt() || language.t("prompt.loading")}
                <@lgcode/div>
              <@lgcode/>
            }
          >
            <Show when={dock()}>
              <div
                classList={{
                  "overflow-hidden": true,
                  "pointer-events-none": value() < 0.98,
                }}
                style={{
                  "max-height": `${full() * value()}px`,
                }}
              >
                <div ref={(el) => setStore("body", el)}>
                  <SessionTodoDock
                    sessionID={route.params.id}
                    todos={props.state.todos()}
                    collapsed={view.todoCollapsed.get()}
                    onToggle={() => view.todoCollapsed.set(!view.todoCollapsed.get())}
                    collapseLabel={language.t("session.todo.collapse")}
                    expandLabel={language.t("session.todo.expand")}
                    dockProgress={value()}
                  @lgcode/>
                <@lgcode/div>
              <@lgcode/div>
            <@lgcode/Show>
            <Show when={rolled()} keyed>
              {(revert) => (
                <div
                  style={{
                    "margin-top": `${-36 * value()}px`,
                  }}
                >
                  <SessionRevertDock
                    items={revert.items}
                    restoring={revert.restoring}
                    disabled={revert.disabled}
                    onRestore={revert.onRestore}
                  @lgcode/>
                <@lgcode/div>
              )}
            <@lgcode/Show>
            <div
              classList={{
                "relative z-10": true,
              }}
              style={{
                "margin-top": `${-lift()}px`,
              }}
            >
              <Show when={props.followup?.items.length}>
                <SessionFollowupDock
                  items={props.followup!.items}
                  sending={props.followup!.sending}
                  onSend={props.followup!.onSend}
                  onEdit={props.followup!.onEdit}
                @lgcode/>
              <@lgcode/Show>
              <Show
                when={child()}
                fallback={
                  <Show when={!props.state.blocked()}>
                    <PromptInput
                      controls={controls()}
                      variant={props.placement === "inline" ? "new-session" : undefined}
                      ref={props.inputRef}
                      newSessionWorktree={props.newSessionWorktree}
                      onNewSessionWorktreeReset={props.onNewSessionWorktreeReset}
                      edit={props.followup?.edit}
                      onEditLoaded={props.followup?.onEditLoaded}
                      shouldQueue={props.followup?.queue}
                      onQueue={props.followup?.onQueue}
                      onAbort={props.followup?.onAbort}
                      onSubmit={props.onSubmit}
                    @lgcode/>
                  <@lgcode/Show>
                }
              >
                <div
                  ref={props.inputRef}
                  class="w-full rounded-[12px] border border-border-weak-base bg-background-base p-3 text-16-regular text-text-weak"
                >
                  <span>{language.t("session.child.promptDisabled")} <@lgcode/span>
                  <Show when={parentID()}>
                    <button
                      type="button"
                      class="text-text-base transition-colors hover:text-text-strong"
                      onClick={openParent}
                    >
                      {language.t("session.child.backToParent")}
                    <@lgcode/button>
                  <@lgcode/Show>
                <@lgcode/div>
              <@lgcode/Show>
            <@lgcode/div>
          <@lgcode/Show>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/div>
  )
}
