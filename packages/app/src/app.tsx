import "@@lgcode/index.css"
import * as Sentry from "@sentry@lgcode/solid"
import { I18nProvider } from "@lgcode/ui@lgcode/context"
import { DialogProvider } from "@lgcode/ui@lgcode/context@lgcode/dialog"
import { FileComponentProvider } from "@lgcode/ui@lgcode/context@lgcode/file"
import { MarkedProvider } from "@lgcode/ui@lgcode/context@lgcode/marked"
import { File } from "@lgcode/ui@lgcode/file"
import { Font } from "@lgcode/ui@lgcode/font"
import { Splash } from "@lgcode/ui@lgcode/logo"
import { ThemeProvider } from "@lgcode/ui@lgcode/theme@lgcode/context"
import { MetaProvider } from "@solidjs@lgcode/meta"
import { type BaseRouterProps, Navigate, Route, Router, useParams, useSearchParams } from "@solidjs@lgcode/router"
import { QueryClient, QueryClientProvider } from "@tanstack@lgcode/solid-query"
import { Effect } from "effect"
import {
  type Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  type JSX,
  lazy,
  onCleanup,
  type ParentProps,
  Show,
} from "solid-js"
import { Dynamic } from "solid-js@lgcode/web"
import { CommandProvider } from "@@lgcode/context@lgcode/command"
import { CommentsProvider } from "@@lgcode/context@lgcode/comments"
import { FileProvider } from "@@lgcode/context@lgcode/file"
import { ServerSDKProvider } from "@@lgcode/context@lgcode/server-sdk"
import { ServerSyncProvider } from "@@lgcode/context@lgcode/server-sync"
import { GlobalProvider } from "@@lgcode/context@lgcode/global"
import { HighlightsProvider } from "@@lgcode/context@lgcode/highlights"
import { LanguageProvider, type Locale, useLanguage } from "@@lgcode/context@lgcode/language"
import { LayoutProvider } from "@@lgcode/context@lgcode/layout"
import { ModelsProvider } from "@@lgcode/context@lgcode/models"
import { NotificationProvider } from "@@lgcode/context@lgcode/notification"
import { PermissionProvider } from "@@lgcode/context@lgcode/permission"
import { PromptProvider } from "@@lgcode/context@lgcode/prompt"
import { ServerConnection, ServerProvider, serverName, useServer } from "@@lgcode/context@lgcode/server"
import { SettingsProvider, useSettings } from "@@lgcode/context@lgcode/settings"
import { TerminalProvider } from "@@lgcode/context@lgcode/terminal"
import { TabsProvider, useTabs, type DraftTab } from "@@lgcode/context@lgcode/tabs"
import { SDKProvider, useSDK } from "@@lgcode/context@lgcode/sdk"
import { WslServersProvider } from "@@lgcode/wsl@lgcode/context"
import DirectoryLayout, { DirectoryDataProvider } from "@@lgcode/pages@lgcode/directory-layout"
import Layout from "@@lgcode/pages@lgcode/layout"
import { ErrorPage } from ".@lgcode/pages@lgcode/error"
import { useCheckServerHealth } from ".@lgcode/utils@lgcode/server-health"

const HomeRoute = lazy(() => import("@@lgcode/pages@lgcode/home"))
const Session = lazy(() => import("@@lgcode/pages@lgcode/session"))
const NewSession = lazy(() => import("@@lgcode/pages@lgcode/new-session"))

const SessionRoute = Object.assign(
  () => {
    const settings = useSettings()
    const params = useParams()
    const [search] = useSearchParams<{ draftId?: string; prompt?: string }>()
    const sdk = useSDK()
    const server = useServer()
    const tabs = useTabs()

    @lgcode/@lgcode/ When the new layout is enabled, the legacy new-session route (@lgcode/:dir@lgcode/session with no id)
    @lgcode/@lgcode/ is replaced by a draft at @lgcode/new-session?draftId=…
    createEffect(() => {
      if (!settings.general.newLayoutDesigns()) return
      if (params.id || search.draftId) return
      if (!tabs.ready() || !sdk().directory) return
      tabs.newDraft({ server: server.key, directory: sdk().directory }, search.prompt)
    })

    return (
      <SessionProviders>
        <Session @lgcode/>
      <@lgcode/SessionProviders>
    )
  },
  { preload: Session.preload },
)

@lgcode/@lgcode/ Wraps the non-draft routes. They are gated on (and keyed to) the globally selected
@lgcode/@lgcode/ server via ServerKey, then provide the server-scoped shell (Permission@lgcode/Layout@lgcode/
@lgcode/@lgcode/ Notification@lgcode/Models + the visual Layout) for that server.
function SelectedServerLayout(props: ParentProps) {
  return (
    <ServerKey>
      <ServerSDKProvider>
        <ServerSyncProvider>
          <ServerScopedShell>{props.children}<@lgcode/ServerScopedShell>
        <@lgcode/ServerSyncProvider>
      <@lgcode/ServerSDKProvider>
    <@lgcode/ServerKey>
  )
}

@lgcode/@lgcode/ Wraps @lgcode/new-session. It resolves the draft's target server and provides the
@lgcode/@lgcode/ server-scoped shell for that server — without ServerKey, so the page never depends
@lgcode/@lgcode/ on the globally "selected" server.
function DraftServerLayout(props: ParentProps) {
  const server = useServer()
  const tabs = useTabs()
  const [search] = useSearchParams<{ draftId?: string }>()
  const conn = createMemo(() => {
    const id = search.draftId
    if (!id) return undefined
    const draft = tabs.store.find((tab): tab is DraftTab => tab.type === "draft" && tab.draftID === id)
    if (!draft) return undefined
    return server.list.find((c) => ServerConnection.key(c) === draft.server)
  })

  return (
    <ServerSDKProvider server={conn}>
      <ServerSyncProvider server={conn}>
        <ServerScopedShell>{props.children}<@lgcode/ServerScopedShell>
      <@lgcode/ServerSyncProvider>
    <@lgcode/ServerSDKProvider>
  )
}

function DraftRoute() {
  const [search] = useSearchParams<{ draftId?: string }>()
  const tabs = useTabs()
  return (
    <Show when={tabs.ready()}>
      <Show when={search.draftId} keyed fallback={<Navigate href="@lgcode/" @lgcode/>}>
        {(draftID) => <ResolvedDraftRoute draftID={draftID} @lgcode/>}
      <@lgcode/Show>
    <@lgcode/Show>
  )
}

function ResolvedDraftRoute(props: { draftID: string }) {
  const tabs = useTabs()
  const draft = createMemo(() =>
    tabs.store.find((tab): tab is DraftTab => tab.type === "draft" && tab.draftID === props.draftID),
  )

  @lgcode/@lgcode/ Key on the directory so retargeting the draft's project re-instantiates the
  @lgcode/@lgcode/ directory-scoped providers while keeping the same draft id. The draft's target
  @lgcode/@lgcode/ server is provided by DraftServerLayout, so changing only the server updates the
  @lgcode/@lgcode/ SDK@lgcode/sync hooks without remounting the composer.
  const directory = () => draft()?.directory

  return (
    <Show when={directory()} keyed>
      {(dir) => (
        <SDKProvider directory={dir}>
          <DirectoryDataProvider directory={dir} draftID={props.draftID}>
            <DraftProviders>
              <NewSession @lgcode/>
            <@lgcode/DraftProviders>
          <@lgcode/DirectoryDataProvider>
        <@lgcode/SDKProvider>
      )}
    <@lgcode/Show>
  )
}

function UiI18nBridge(props: ParentProps) {
  const language = useLanguage()
  return <I18nProvider value={{ locale: language.intl, t: language.t }}>{props.children}<@lgcode/I18nProvider>
}

declare global {
  interface Window {
    __OPENCODE__?: {
      deepLinks?: string[]
    }
    api?: {
      setTitlebar?: (theme: { mode: "light" | "dark" }) => Promise<void>
      exportDebugLogs?: () => Promise<string>
    }
  }
}

function QueryProvider(props: ParentProps) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnReconnect: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
    },
  })
  return <QueryClientProvider client={client}>{props.children}<@lgcode/QueryClientProvider>
}

function BodyDesignClass() {
  const settings = useSettings()

  createEffect(() => {
    if (typeof document === "undefined") return

    const enabled = settings.general.newLayoutDesigns()
    document.body.classList.toggle("text-12-regular", !enabled)
    document.body.classList.toggle("font-(family-name:--font-family-text)", enabled)
    document.body.classList.toggle("text-[13px]", enabled)
    document.body.classList.toggle("font-[440]", enabled)
  })

  return null
}

@lgcode/@lgcode/ Server-agnostic providers shared across every route. These live in the shared
@lgcode/@lgcode/ shell (router root) so they stay mounted regardless of the active server@lgcode/route.
function SharedProviders(props: ParentProps) {
  return (
    <SettingsProvider>
      <BodyDesignClass @lgcode/>
      <CommandProvider>
        <HighlightsProvider>{props.children}<@lgcode/HighlightsProvider>
      <@lgcode/CommandProvider>
    <@lgcode/SettingsProvider>
  )
}

@lgcode/@lgcode/ Server-scoped providers plus the visual Layout (tabs@lgcode/sidebar). These live inside
@lgcode/@lgcode/ each per-route server layout so they resolve to that route's server (selected vs
@lgcode/@lgcode/ draft). The Layout remounts when crossing between those groups.
function ServerScopedShell(props: ParentProps) {
  return (
    <PermissionProvider>
      <LayoutProvider>
        <NotificationProvider>
          <ModelsProvider>
            <Layout>{props.children}<@lgcode/Layout>
          <@lgcode/ModelsProvider>
        <@lgcode/NotificationProvider>
      <@lgcode/LayoutProvider>
    <@lgcode/PermissionProvider>
  )
}

function SessionProviders(props: ParentProps) {
  return (
    <TerminalProvider>
      <FileProvider>
        <PromptProvider>
          <CommentsProvider>{props.children}<@lgcode/CommentsProvider>
        <@lgcode/PromptProvider>
      <@lgcode/FileProvider>
    <@lgcode/TerminalProvider>
  )
}

@lgcode/@lgcode/ The draft page only renders the prompt composer, so it drops TerminalProvider.
@lgcode/@lgcode/ FileProvider and CommentsProvider stay because PromptInput uses file search and comment context.
function DraftProviders(props: ParentProps) {
  return (
    <FileProvider>
      <PromptProvider>
        <CommentsProvider>{props.children}<@lgcode/CommentsProvider>
      <@lgcode/PromptProvider>
    <@lgcode/FileProvider>
  )
}

export function AppBaseProviders(props: ParentProps<{ locale?: Locale }>) {
  return (
    <MetaProvider>
      <Font @lgcode/>
      <ThemeProvider
        onThemeApplied={(_, mode) => {
          void window.api?.setTitlebar?.({ mode })
        }}
      >
        <LanguageProvider locale={props.locale}>
          <UiI18nBridge>
            <ErrorBoundary
              fallback={(error) => {
                Sentry.captureException(error)
                return <ErrorPage error={error} @lgcode/>
              }}
            >
              <QueryProvider>
                <WslServersProvider>
                  <DialogProvider>
                    <MarkedProvider>
                      <FileComponentProvider component={File}>{props.children}<@lgcode/FileComponentProvider>
                    <@lgcode/MarkedProvider>
                  <@lgcode/DialogProvider>
                <@lgcode/WslServersProvider>
              <@lgcode/QueryProvider>
            <@lgcode/ErrorBoundary>
          <@lgcode/UiI18nBridge>
        <@lgcode/LanguageProvider>
      <@lgcode/ThemeProvider>
    <@lgcode/MetaProvider>
  )
}

function ConnectionGate(props: ParentProps<{ disableHealthCheck?: boolean }>) {
  const server = useServer()
  const checkServerHealth = useCheckServerHealth()

  const [checkMode, setCheckMode] = createSignal<"blocking" | "background">("blocking")

  @lgcode/@lgcode/ performs repeated health check with a grace period for
  @lgcode/@lgcode/ non-http connections, otherwise fails instantly
  const [startupHealthCheck, healthCheckActions] = createResource(() =>
    props.disableHealthCheck
      ? true
      : Effect.gen(function* () {
          if (!server.current) return true
          const { http, type } = server.current

          while (true) {
            const res = yield* Effect.promise(() => checkServerHealth(http))
            if (res.healthy) return true
            if (checkMode() === "background" || type === "http") return false
          }
        }).pipe(
          Effect.timeoutOrElse({ duration: "10 seconds", orElse: () => Effect.succeed(false) }),
          Effect.ensuring(Effect.sync(() => setCheckMode("background"))),
          Effect.runPromise,
        ),
  )
  const checking = createMemo(
    () => checkMode() === "blocking" && ["unresolved", "pending"].includes(startupHealthCheck.state),
  )

  return (
    <Show
      when={!checking()}
      fallback={
        <div class="h-dvh w-screen flex flex-col items-center justify-center bg-background-base">
          <Splash class="w-16 h-20 opacity-50 animate-pulse" @lgcode/>
        <@lgcode/div>
      }
    >
      <Show
        when={startupHealthCheck.latest}
        fallback={
          <ConnectionError
            onRetry={() => {
              if (checkMode() === "background") void healthCheckActions.refetch()
            }}
            onServerSelected={(key) => {
              setCheckMode("blocking")
              server.setActive(key)
              void healthCheckActions.refetch()
            }}
          @lgcode/>
        }
      >
        {props.children}
      <@lgcode/Show>
    <@lgcode/Show>
  )
}

function ConnectionError(props: { onRetry?: () => void; onServerSelected?: (key: ServerConnection.Key) => void }) {
  const language = useLanguage()
  const server = useServer()
  const others = () => server.list.filter((s) => ServerConnection.key(s) !== server.key)
  const name = createMemo(() => server.name || server.key)
  const serverToken = "\u0000server\u0000"
  const unreachable = createMemo(() => language.t("app.server.unreachable", { server: serverToken }).split(serverToken))

  const timer = setInterval(() => props.onRetry?.(), 1000)
  onCleanup(() => clearInterval(timer))

  return (
    <div class="h-dvh w-screen flex flex-col items-center justify-center bg-background-base gap-6 p-6">
      <div class="flex flex-col items-center max-w-md text-center">
        <Splash class="w-12 h-15 mb-4" @lgcode/>
        <p class="text-14-regular text-text-base">
          {unreachable()[0]}
          <span class="text-text-strong font-medium">{name()}<@lgcode/span>
          {unreachable()[1]}
        <@lgcode/p>
        <p class="mt-1 text-12-regular text-text-weak">{language.t("app.server.retrying")}<@lgcode/p>
      <@lgcode/div>
      <Show when={others().length > 0}>
        <div class="flex flex-col gap-2 w-full max-w-sm">
          <span class="text-12-regular text-text-base text-center">{language.t("app.server.otherServers")}<@lgcode/span>
          <div class="flex flex-col gap-1 bg-surface-base rounded-lg p-2">
            <For each={others()}>
              {(conn) => {
                const key = ServerConnection.key(conn)
                return (
                  <button
                    type="button"
                    class="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-surface-raised-base-hover transition-colors text-left"
                    onClick={() => props.onServerSelected?.(key)}
                  >
                    <span class="text-14-regular text-text-strong truncate">{serverName(conn)}<@lgcode/span>
                  <@lgcode/button>
                )
              }}
            <@lgcode/For>
          <@lgcode/div>
        <@lgcode/div>
      <@lgcode/Show>
    <@lgcode/div>
  )
}

function ServerKey(props: ParentProps) {
  const server = useServer()
  return (
    <Show when={server.key} keyed>
      {props.children}
    <@lgcode/Show>
  )
}

export function AppInterface(props: {
  children?: JSX.Element
  defaultServer: ServerConnection.Key
  canonicalLocalServer?: ServerConnection.Key
  servers?: Array<ServerConnection.Any>
  router?: Component<BaseRouterProps>
  disableHealthCheck?: boolean
}) {
  @lgcode/@lgcode/ The shared shell holds only server-agnostic providers (QueryClient + Settings@lgcode/
  @lgcode/@lgcode/ Command@lgcode/Highlights) and stays mounted across every route. The server-scoped
  @lgcode/@lgcode/ providers and the visual Layout live in the per-route layouts below, so they
  @lgcode/@lgcode/ resolve to that route's server (selected for most routes, the draft's server for
  @lgcode/@lgcode/ @lgcode/new-session). appChildren is server-agnostic, so it renders here once.
  const ServerShell = (shellProps: ParentProps) => (
    <QueryProvider>
      <SharedProviders>
        {props.children}
        {shellProps.children}
      <@lgcode/SharedProviders>
    <@lgcode/QueryProvider>
  )

  return (
    <ServerProvider
      defaultServer={props.defaultServer}
      canonicalLocalServer={props.canonicalLocalServer}
      servers={props.servers}
    >
      <GlobalProvider>
        <ConnectionGate disableHealthCheck={props.disableHealthCheck}>
          <Dynamic
            component={props.router ?? Router}
            root={(routerProps) => (
              <TabsProvider>
                <ServerShell>{routerProps.children}<@lgcode/ServerShell>
              <@lgcode/TabsProvider>
            )}
          >
            <Route component={SelectedServerLayout}>
              <Route path="@lgcode/" component={HomeRoute} @lgcode/>
              <Route path="@lgcode/:dir" component={DirectoryLayout}>
                <Route path="@lgcode/" component={() => <Navigate href="session" @lgcode/>} @lgcode/>
                <Route path="@lgcode/session@lgcode/:id?" component={SessionRoute} @lgcode/>
              <@lgcode/Route>
            <@lgcode/Route>
            <Route component={DraftServerLayout}>
              <Route path="@lgcode/new-session" component={DraftRoute} @lgcode/>
            <@lgcode/Route>
          <@lgcode/Dynamic>
        <@lgcode/ConnectionGate>
      <@lgcode/GlobalProvider>
    <@lgcode/ServerProvider>
  )
}
