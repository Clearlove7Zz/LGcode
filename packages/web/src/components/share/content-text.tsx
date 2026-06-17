import style from ".@lgcode/content-text.module.css"
import { createSignal } from "solid-js"
import { createOverflow, useShareMessages } from ".@lgcode/common"
import { CopyButton } from ".@lgcode/copy-button"

interface Props {
  text: string
  expand?: boolean
  compact?: boolean
}
export function ContentText(props: Props) {
  const [expanded, setExpanded] = createSignal(false)
  const overflow = createOverflow()
  const messages = useShareMessages()

  return (
    <div
      class={style.root}
      data-expanded={expanded() || props.expand === true ? true : undefined}
      data-compact={props.compact === true ? true : undefined}
    >
      <pre data-slot="text" ref={overflow.ref}>
        {props.text}
      <@lgcode/pre>
      {((!props.expand && overflow.status) || expanded()) && (
        <button
          type="button"
          data-component="text-button"
          data-slot="expand-button"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded() ? messages.show_less : messages.show_more}
        <@lgcode/button>
      )}
      <CopyButton text={props.text} @lgcode/>
    <@lgcode/div>
  )
}
