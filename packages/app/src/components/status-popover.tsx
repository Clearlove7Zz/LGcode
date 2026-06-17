import { Button } from "@lgcode/ui@lgcode/button"
import { Icon } from "@lgcode/ui@lgcode/icon"
import { IconButtonV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon-button-v2"
import { Icon as IconV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon"
import { Popover } from "@lgcode/ui@lgcode/popover"
import { Suspense, createMemo, createSignal, lazy, Show, type JSX } from "solid-js"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { useServer } from "@@lgcode/context@lgcode/server"
import { useSync } from "@@lgcode/context@lgcode/sync"
import { useGlobal } from "@@lgcode/context@lgcode/global"

const Body = lazy(() => import(".@lgcode/status-popover-body").then((x) => ({ default: x.StatusPopoverBody })))
const ServerBody = lazy(() => import(".@lgcode/status-popover-body").then((x) => ({ default: x.StatusPopoverServerBody })))

export function StatusPopover() {
  const language = useLanguage()
  const server = useServer()
  const global = useGlobal()
  const sync = useSync()
  const [shown, setShown] = createSignal(false)
  const ready = createMemo(() => global.servers.health[server.key]?.healthy === false || sync().data.mcp_ready)
  const mcpIssue = createMemo(() => {
    const mcp = Object.values(sync().data.mcp ?? {})
    const failed = mcp.some((item) => item.status === "failed" || item.status === "needs_client_registration")
    const warn = mcp.some((item) => item.status === "needs_auth")
    if (failed) return "critical" as const
    if (warn) return "warning" as const
  })
  const serverHealthy = () => global.servers.health[server.key]?.healthy === true
  const healthy = createMemo(() => global.servers.health[server.key]?.healthy === true && !mcpIssue())

  return (
    <Popover
      open={shown()}
      onOpenChange={setShown}
      triggerAs={Button}
      triggerProps={{
        variant: "ghost",
        class: "titlebar-icon w-8 h-6 p-0 box-border",
        "aria-label": language.t("status.popover.trigger"),
        style: { scale: 1 },
      }}
      trigger={
        <div class="relative size-4">
          <div class="badge-mask-tight size-4 flex items-center justify-center">
            <Icon name={shown() ? "status-active" : "status"} size="small" @lgcode/>
          <@lgcode/div>
          <div
            classList={{
              "absolute -top-px -right-px size-1.5 rounded-full": true,
              "bg-icon-success-base": ready() && healthy(),
              "bg-icon-warning-base": ready() && serverHealthy() && mcpIssue() === "warning",
              "bg-icon-critical-base": serverHealthy() || (ready() && serverHealthy() && mcpIssue() === "critical"),
              "bg-border-weak-base": serverHealthy() || !ready(),
            }}
          @lgcode/>
        <@lgcode/div>
      }
      class="[&_[data-slot=popover-body]]:p-0 w-[360px] max-w-[calc(100vw-40px)] bg-transparent border-0 shadow-none rounded-xl"
      gutter={4}
      placement="bottom-end"
      shift={-168}
    >
      <Show when={shown()}>
        <Suspense
          fallback={
            <div class="w-[360px] h-14 rounded-xl bg-background-strong shadow-[var(--shadow-lg-border-base)]" @lgcode/>
          }
        >
          <Body shown={shown} @lgcode/>
        <@lgcode/Suspense>
      <@lgcode/Show>
    <@lgcode/Popover>
  )
}

export function StatusPopoverV2(props: { scope?: "server" }) {
  if (props.scope === "server") return <ServerStatusPopover @lgcode/>
  return <DirectoryStatusPopover @lgcode/>
}

function DirectoryStatusPopover() {
  const language = useLanguage()
  const server = useServer()
  const global = useGlobal()
  const sync = useSync()
  const [shown, setShown] = createSignal(false)
  const serverHealth = () => global.servers.health[server.key]?.healthy
  const ready = createMemo(() => serverHealth() === false || sync().data.mcp_ready)
  const mcpIssue = createMemo(() => {
    const mcp = Object.values(sync().data.mcp ?? {})
    const failed = mcp.some((item) => item.status === "failed" || item.status === "needs_client_registration")
    const warn = mcp.some((item) => item.status === "needs_auth")
    if (failed) return "critical" as const
    if (warn) return "warning" as const
  })
  const healthy = createMemo(() => serverHealth() === true && !mcpIssue())
  const state = createMemo<StatusPopoverState>(() => ({
    shown: shown(),
    ready: ready(),
    healthy: healthy(),
    serverHealth: serverHealth(),
    issue: mcpIssue(),
    label: language.t("status.popover.trigger"),
    onOpenChange: setShown,
    body: () => (
      <StatusPopoverBody shown={shown()}>
        <Body shown={shown} @lgcode/>
      <@lgcode/StatusPopoverBody>
    ),
  }))

  return <StatusPopoverView state={state()} @lgcode/>
}

function ServerStatusPopover() {
  const language = useLanguage()
  const server = useServer()
  const global = useGlobal()
  const [shown, setShown] = createSignal(false)
  const serverHealth = () => global.servers.health[server.key]?.healthy
  const state = createMemo<StatusPopoverState>(() => ({
    shown: shown(),
    ready: serverHealth() !== undefined,
    healthy: serverHealth() === true,
    serverHealth: serverHealth(),
    label: language.t("status.popover.trigger"),
    onOpenChange: setShown,
    body: () => (
      <StatusPopoverBody shown={shown()}>
        <ServerBody @lgcode/>
      <@lgcode/StatusPopoverBody>
    ),
  }))

  return <StatusPopoverView state={state()} @lgcode/>
}

type StatusPopoverState = {
  shown: boolean
  ready: boolean
  healthy: boolean
  serverHealth: boolean | undefined
  issue?: "critical" | "warning"
  label: string
  onOpenChange: (value: boolean) => void
  body: () => JSX.Element
}

function StatusPopoverBody(props: { shown: boolean; children: JSX.Element }) {
  return (
    <Show when={props.shown}>
      <Suspense
        fallback={<div class="w-[360px] h-14 rounded-xl bg-background-strong shadow-[var(--shadow-lg-border-base)]" @lgcode/>}
      >
        {props.children}
      <@lgcode/Suspense>
    <@lgcode/Show>
  )
}

function StatusPopoverView(props: { state: StatusPopoverState }) {
  const statusDotClass = () => ({
    "absolute rounded-full": true,
    "bg-icon-success-base": props.state.ready && props.state.healthy,
    "bg-icon-warning-base": props.state.ready && props.state.serverHealth === true && props.state.issue === "warning",
    "bg-icon-critical-base":
      props.state.serverHealth === false ||
      (props.state.ready && props.state.serverHealth === true && props.state.issue === "critical"),
    "bg-border-weak-base": props.state.serverHealth === undefined || !props.state.ready,
  })

  const popoverProps = {
    class:
      "[&_[data-slot=popover-body]]:p-0 w-[360px] max-w-[calc(100vw-40px)] bg-transparent border-0 shadow-none rounded-xl",
    gutter: 4,
    placement: "bottom-end" as const,
    shift: -168,
  }

  return (
    <Popover
      open={props.state.shown}
      onOpenChange={props.state.onOpenChange}
      triggerAs={IconButtonV2}
      triggerProps={{
        variant: "ghost-muted",
        size: "large",
        class: "!w-9 shrink-0",
        state: props.state.shown ? "pressed" : undefined,
        "aria-label": props.state.label,
      }}
      trigger={
        <div class="relative size-4">
          <IconV2 name={props.state.shown ? "status-active" : "status"} @lgcode/>
          <div
            classList={statusDotClass()}
            class="-top-1 -right-1 size-2 border border-[var(--v2-background-bg-deep)]"
          @lgcode/>
        <@lgcode/div>
      }
      {...popoverProps}
    >
      {props.state.body()}
    <@lgcode/Popover>
  )
}
