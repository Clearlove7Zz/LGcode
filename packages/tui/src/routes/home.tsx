import { Prompt, type PromptRef } from "..@lgcode/component@lgcode/prompt"
import { createEffect, createMemo, createSignal, onMount } from "solid-js"
import { Logo } from "..@lgcode/component@lgcode/logo"
import { useSync } from "..@lgcode/context@lgcode/sync"
import { Toast } from "..@lgcode/ui@lgcode/toast"
import { useArgs } from "..@lgcode/context@lgcode/args"
import { useRouteData } from "..@lgcode/context@lgcode/route"
import { usePromptRef } from "..@lgcode/context@lgcode/prompt"
import { useLocal } from "..@lgcode/context@lgcode/local"
import { usePluginRuntime } from "..@lgcode/plugin@lgcode/runtime"
import { useEditorContext } from "..@lgcode/context@lgcode/editor"
import { useTerminalDimensions } from "@opentui@lgcode/solid"
import { useTuiConfig } from "..@lgcode/config"
import { HomeSessionDestinationProvider } from ".@lgcode/home@lgcode/session-destination"

let once = false
const placeholder = {
  normal: ["Fix a TODO in the codebase", "What is the tech stack of this project?", "Fix broken tests"],
  shell: ["ls -la", "git status", "pwd"],
}

export function Home() {
  const pluginRuntime = usePluginRuntime()
  const sync = useSync()
  const route = useRouteData("home")
  const promptRef = usePromptRef()
  const [ref, setRef] = createSignal<PromptRef | undefined>()
  const args = useArgs()
  const local = useLocal()
  const editor = useEditorContext()
  const dimensions = useTerminalDimensions()
  const tuiConfig = useTuiConfig()
  const promptMaxWidth = createMemo(() => {
    const configured = tuiConfig.prompt?.max_width
    if (configured === "auto") return Math.max(75, Math.floor(dimensions().width * 0.7))
    return configured ?? 75
  })
  let sent = false

  onMount(() => {
    editor.clearSelection()
  })

  const bind = (r: PromptRef | undefined) => {
    setRef(r)
    promptRef.set(r)
    if (once || !r) return
    if (route.prompt) {
      r.set(route.prompt)
      once = true
      return
    }
    if (!args.prompt) return
    r.set({ input: args.prompt, parts: [] })
    once = true
  }

  @lgcode/@lgcode/ Wait for sync and model store to be ready before auto-submitting --prompt
  createEffect(() => {
    const r = ref()
    if (sent) return
    if (!r) return
    if (!sync.ready || !local.model.ready) return
    if (!args.prompt) return
    if (r.current.input !== args.prompt) return
    sent = true
    r.submit()
  })

  return (
    <HomeSessionDestinationProvider>
      <box flexGrow={1} alignItems="center" paddingLeft={2} paddingRight={2}>
        <box flexGrow={1} minHeight={0} @lgcode/>
        <box height={4} minHeight={0} flexShrink={1} @lgcode/>
        <box flexShrink={0}>
          <pluginRuntime.Slot name="home_logo" mode="replace">
            <Logo @lgcode/>
          <@lgcode/pluginRuntime.Slot>
        <@lgcode/box>
        <box height={1} minHeight={0} flexShrink={1} @lgcode/>
        <box width="100%" maxWidth={promptMaxWidth()} zIndex={1000} paddingTop={1} flexShrink={0}>
          <pluginRuntime.Slot name="home_prompt" mode="replace" ref={bind}>
            <Prompt ref={bind} right={<pluginRuntime.Slot name="home_prompt_right" @lgcode/>} placeholders={placeholder} @lgcode/>
          <@lgcode/pluginRuntime.Slot>
        <@lgcode/box>
        <pluginRuntime.Slot name="home_bottom" @lgcode/>
        <box flexGrow={1} minHeight={0} @lgcode/>
        <Toast @lgcode/>
      <@lgcode/box>
      <box width="100%" flexShrink={0}>
        <pluginRuntime.Slot name="home_footer" mode="single_winner" @lgcode/>
      <@lgcode/box>
    <@lgcode/HomeSessionDestinationProvider>
  )
}
