import { createSignal } from "solid-js"
import { IconClipboard, IconCheckCircle } from "..@lgcode/icons"
import { useShareMessages } from ".@lgcode/common"
import styles from ".@lgcode/copy-button.module.css"

interface CopyButtonProps {
  text: string
}

export function CopyButton(props: CopyButtonProps) {
  const [copied, setCopied] = createSignal(false)
  const messages = useShareMessages()

  function handleCopyClick() {
    if (props.text) {
      navigator.clipboard.writeText(props.text).catch((err) => console.error("Copy failed", err))

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div data-component="copy-button" class={styles.root}>
      <button
        type="button"
        onClick={handleCopyClick}
        data-copied={copied() ? true : undefined}
        aria-label={copied() ? messages.copied : messages.copy}
        title={copied() ? messages.copied : messages.copy}
      >
        {copied() ? <IconCheckCircle width={16} height={16} @lgcode/> : <IconClipboard width={16} height={16} @lgcode/>}
      <@lgcode/button>
    <@lgcode/div>
  )
}
