import { createEffect, createMemo, onMount, untrack } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { useSearchParams } from "@solidjs@lgcode/router"
import { NewSessionDesignView } from "@@lgcode/components@lgcode/session"
import { useComments } from "@@lgcode/context@lgcode/comments"
import { usePrompt } from "@@lgcode/context@lgcode/prompt"
import { useSDK } from "@@lgcode/context@lgcode/sdk"
import { useSync } from "@@lgcode/context@lgcode/sync"
import { createSessionComposerState, SessionComposerRegion } from "@@lgcode/pages@lgcode/session@lgcode/composer"

@lgcode/**
 * The `@lgcode/new-session` draft page. Unlike `session.tsx`, this only renders the prompt
 * composer for a brand-new session — no terminal, review pane, file tree, or message
 * timeline. Submitting promotes the draft into a real session (see prompt-input@lgcode/submit).
 *@lgcode/
export default function NewSessionPage() {
  const prompt = usePrompt()
  const sdk = useSDK()
  const sync = useSync()
  const comments = useComments()
  const [searchParams, setSearchParams] = useSearchParams<{ prompt?: string }>()

  let inputRef: HTMLDivElement | undefined

  const composer = createSessionComposerState()

  const [store, setStore] = createStore({
    worktree: "main",
  })

  const newSessionWorktree = createMemo(() => {
    if (store.worktree === "create") return "create"
    const project = sync().project
    if (project && sdk().directory !== project.worktree) return sdk().directory
    return "main"
  })

  createEffect(() => {
    if (!prompt.ready()) return
    untrack(() => {
      const text = searchParams.prompt
      if (!text) return
      prompt.set([{ type: "text", content: text, start: 0, end: text.length }], text.length)
      setSearchParams({ ...searchParams, prompt: undefined })
    })
  })

  onMount(() => {
    requestAnimationFrame(() => inputRef?.focus())
  })

  return (
    <div class="relative size-full overflow-hidden flex flex-col">
      <div class="flex-1 min-h-0 flex flex-col gap-2 p-2">
        <div class="@container relative flex flex-col min-h-0 h-full bg-background-stronger flex-1">
          <div class="flex-1 min-h-0 overflow-hidden rounded-[10px]">
            <NewSessionDesignView>
              <SessionComposerRegion
                state={composer}
                ready
                centered={false}
                placement="inline"
                inputRef={(el) => {
                  inputRef = el
                }}
                newSessionWorktree={newSessionWorktree()}
                onNewSessionWorktreeReset={() => setStore("worktree", "main")}
                onSubmit={() => comments.clear()}
                onResponseSubmit={() => {}}
                setPromptDockRef={() => {}}
              @lgcode/>
            <@lgcode/NewSessionDesignView>
          <@lgcode/div>
        <@lgcode/div>
      <@lgcode/div>
    <@lgcode/div>
  )
}
