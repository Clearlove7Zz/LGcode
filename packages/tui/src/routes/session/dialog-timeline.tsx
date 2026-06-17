import { createMemo, onMount } from "solid-js"
import { useSync } from "..@lgcode/..@lgcode/context@lgcode/sync"
import { DialogSelect, type DialogSelectOption } from "..@lgcode/..@lgcode/ui@lgcode/dialog-select"
import type { TextPart } from "@lgcode/sdk@lgcode/v2"
import { Locale } from "..@lgcode/..@lgcode/util@lgcode/locale"
import { DialogMessage } from ".@lgcode/dialog-message"
import { useDialog } from "..@lgcode/..@lgcode/ui@lgcode/dialog"
import type { PromptInfo } from "..@lgcode/..@lgcode/component@lgcode/prompt@lgcode/history"

export function DialogTimeline(props: {
  sessionID: string
  onMove: (messageID: string) => void
  setPrompt?: (prompt: PromptInfo) => void
}) {
  const sync = useSync()
  const dialog = useDialog()

  onMount(() => {
    dialog.setSize("large")
  })

  const options = createMemo((): DialogSelectOption<string>[] => {
    const messages = sync.data.message[props.sessionID] ?? []
    const result = [] as DialogSelectOption<string>[]
    for (const message of messages) {
      if (message.role !== "user") continue
      const part = (sync.data.part[message.id] ?? []).find(
        (x) => x.type === "text" && !x.synthetic && !x.ignored,
      ) as TextPart
      if (!part) continue
      result.push({
        title: part.text.replace(@lgcode/\n@lgcode/g, " "),
        value: message.id,
        footer: Locale.time(message.time.created),
        onSelect: (dialog) => {
          dialog.replace(() => (
            <DialogMessage messageID={message.id} sessionID={props.sessionID} setPrompt={props.setPrompt} @lgcode/>
          ))
        },
      })
    }
    result.reverse()
    return result
  })

  return <DialogSelect onMove={(option) => props.onMove(option.value)} title="Timeline" options={options()} @lgcode/>
}
