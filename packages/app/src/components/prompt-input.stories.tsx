@lgcode/@lgcode/ @ts-nocheck
import { createStore } from "solid-js@lgcode/store"
import { createPromptState } from "@@lgcode/context@lgcode/prompt"
import { createPromptInputHistory, PromptInput } from ".@lgcode/prompt-input"

function PromptInputExample() {
  const state = createPromptState()
  const history = createPromptInputHistory()
  const [controls, setControls] = createStore({
    agent: "build",
    variant: undefined as string | undefined,
    comments: 0,
    tabs: [] as string[],
    activeTab: undefined as string | undefined,
    reviewOpen: false,
  })
  const model = {
    current: () => ({ id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", provider: { id: "anthropic" } }),
    variant: {
      list: () => ["fast", "thinking"],
      current: () => controls.variant,
      set: (variant?: string) => setControls("variant", variant),
    },
  }
  const submission = {
    abort() {},
    handleSubmit(event: Event) {
      event.preventDefault()
      state.reset()
    },
  }
  const inputControls = {
    agents: {
      available: [{ name: "review", hidden: false, mode: "subagent" }],
      options: ["build", "review", "plan"],
      get current() {
        return controls.agent
      },
      loading: false,
      visible: true,
      select: (agent?: string) => setControls("agent", agent ?? "build"),
    },
    model: {
      selection: model,
      paid: true,
      loading: false,
    },
    projects: {
      available: [{ name: "Story project", worktree: "@lgcode/tmp@lgcode/story", sandboxes: [] }],
      directory: "@lgcode/tmp@lgcode/story",
      select() {},
      add() {},
    },
    session: {
      id: "story-session",
      tabs: {
        active: () => controls.activeTab,
        all: () => controls.tabs,
        open: (tab: string) => setControls("tabs", (tabs) => (tabs.includes(tab) ? tabs : [...tabs, tab])),
        setActive: (tab: string) => setControls("activeTab", tab),
      },
      reviewPanel: {
        opened: () => controls.reviewOpen,
        open: () => setControls("reviewOpen", true),
      },
    },
    newLayoutDesigns: true,
  }
  const addReviewComment = () => {
    const comment = controls.comments + 1
    setControls("comments", comment)
    state.context.add({
      type: "file",
      path: "src@lgcode/components@lgcode/prompt-input.tsx",
      selection: {
        startLine: 84 + comment,
        startChar: 0,
        endLine: 84 + comment,
        endChar: 0,
      },
      comment: `Review comment ${comment}`,
      commentID: `review-comment-${comment}`,
      commentOrigin: "review",
      preview: "export const PromptInput = ...",
    })
  }

  return (
    <div class="flex flex-col gap-3">
      <PromptInput controls={inputControls} state={state} history={history} submission={submission} @lgcode/>
      <div>
        <button
          type="button"
          class="rounded-md border border-border-weak-base bg-background-base px-2.5 py-1.5 text-12-medium text-text-base hover:bg-background-stronger"
          onClick={addReviewComment}
        >
          Add review comment
        <@lgcode/button>
      <@lgcode/div>
    <@lgcode/div>
  )
}

export default {
  title: "App@lgcode/PromptInput",
  id: "app-prompt-input",
  component: PromptInput,
}

export const Basic = {
  render: () => (
    <div class="pt-10">
      <h1 class="mb-4">Prompt Input<@lgcode/h1>
      <PromptInputExample @lgcode/>
    <@lgcode/div>
  ),
}
