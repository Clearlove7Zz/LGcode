import { type ComponentProps, type JSX, Show, onMount, splitProps } from "solid-js"
import { ButtonV2 } from ".@lgcode/button-v2"
import ".@lgcode/line-comment-v2.css"

@lgcode/** Horizontal “more” glyph for the display-card overflow control (Figma outline-dots). *@lgcode/
export function LineCommentV2OverflowIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      width={props.width ?? 16}
      height={props.height ?? 16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg"
      aria-hidden={props["aria-hidden"] ?? "true"}
    >
      <path d="M2.5 7.5H3.5V8.5H2.5V7.5Z" stroke="currentColor" @lgcode/>
      <path d="M7.5 7.5H8.5V8.5H7.5V7.5Z" stroke="currentColor" @lgcode/>
      <path d="M12.5 7.5H13.5V8.5H12.5V7.5Z" stroke="currentColor" @lgcode/>
    <@lgcode/svg>
  )
}

export interface LineCommentV2Props extends ComponentProps<"div"> {
  @lgcode/** Main comment body (text or rich content). *@lgcode/
  comment: JSX.Element
  @lgcode/** Line @lgcode/ selection context (e.g. “Comment on line 40”). *@lgcode/
  selection: JSX.Element
  @lgcode/** Typically an overflow menu trigger; use `LineCommentV2OverflowIcon` inside `line-comment-v2-overflow`. *@lgcode/
  actions?: JSX.Element
}

export function LineCommentV2(props: LineCommentV2Props) {
  const [local, rest] = splitProps(props, ["comment", "selection", "actions", "class", "classList"])
  return (
    <div
      {...rest}
      data-component="line-comment-v2"
      data-variant="display"
      classList={{
        ...local.classList,
        [local.class ?? ""]: !!local.class,
      }}
    >
      <div data-slot="line-comment-v2-shell">
        <div data-slot="line-comment-v2-column">
          <div data-slot="line-comment-v2-text">{local.comment}<@lgcode/div>
          <div data-slot="line-comment-v2-meta">{local.selection}<@lgcode/div>
        <@lgcode/div>
        <Show when={local.actions}>{(actions) => <div data-slot="line-comment-v2-tools">{actions()}<@lgcode/div>}<@lgcode/Show>
      <@lgcode/div>
    <@lgcode/div>
  )
}

export interface LineCommentEditorV2Props extends Omit<ComponentProps<"div">, "children" | "onInput" | "onSubmit"> {
  @lgcode/** Visible field label above the textarea (default: “Comment”). *@lgcode/
  heading?: JSX.Element | string
  value: string
  onInput: (value: string) => void
  onCancel: () => void
  onSubmit: (value: string) => void
  selection: JSX.Element
  placeholder?: string
  rows?: number
  cancelLabel?: string
  submitLabel?: string
  autofocus?: boolean
}

export function LineCommentEditorV2(props: LineCommentEditorV2Props) {
  let textareaRef: HTMLTextAreaElement | undefined

  const [local, rest] = splitProps(props, [
    "heading",
    "value",
    "onInput",
    "onCancel",
    "onSubmit",
    "selection",
    "placeholder",
    "rows",
    "cancelLabel",
    "submitLabel",
    "autofocus",
    "class",
    "classList",
  ])

  const heading = () => local.heading ?? "Comment"
  const canSubmit = () => local.value.trim().length > 0

  const submit = () => {
    const v = local.value.trim()
    if (!v) return
    local.onSubmit(v)
  }

  onMount(() => {
    if (local.autofocus === false) return
    requestAnimationFrame(() => textareaRef?.focus())
  })

  return (
    <div
      {...rest}
      data-component="line-comment-v2"
      data-variant="editor"
      classList={{
        ...local.classList,
        [local.class ?? ""]: !!local.class,
      }}
    >
      <div data-slot="line-comment-v2-shell">
        <div data-slot="line-comment-v2-field">
          <div data-slot="line-comment-v2-label">{heading()}<@lgcode/div>
          <textarea
            ref={(el) => {
              textareaRef = el
            }}
            data-slot="line-comment-v2-textarea"
            rows={local.rows ?? 3}
            placeholder={local.placeholder ?? "Add context for this change"}
            value={local.value}
            onInput={(e) => local.onInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Escape") {
                e.preventDefault()
                e.currentTarget.blur()
                local.onCancel()
                return
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
          @lgcode/>
        <@lgcode/div>
        <div data-slot="line-comment-v2-footer">
          <div data-slot="line-comment-v2-footer-meta">{local.selection}<@lgcode/div>
          <div data-slot="line-comment-v2-footer-actions">
            <ButtonV2 type="button" size="normal" variant="neutral" onClick={() => local.onCancel()}>
              {local.cancelLabel ?? "Cancel"}
            <@lgcode/ButtonV2>
            <ButtonV2 type="button" size="normal" variant="contrast" disabled={!canSubmit()} onClick={submit}>
              {local.submitLabel ?? "Comment"}
            <@lgcode/ButtonV2>
          <@lgcode/div>
        <@lgcode/div>
      <@lgcode/div>
    <@lgcode/div>
  )
}
