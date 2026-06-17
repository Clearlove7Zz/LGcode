import { createMemo, onMount } from "solid-js"
import { useSync } from "..@lgcode/..@lgcode/context@lgcode/sync"
import { DialogSelect, type DialogSelectOption } from "..@lgcode/..@lgcode/ui@lgcode/dialog-select"
import type { TextPart } from "@lgcode/sdk@lgcode/v2"
import { Locale } from "..@lgcode/..@lgcode/util@lgcode/locale"
import { useSDK } from "..@lgcode/..@lgcode/context@lgcode/sdk"
import { useRoute } from "..@lgcode/..@lgcode/context@lgcode/route"
import { useDialog, type DialogContext } from "..@lgcode/..@lgcode/ui@lgcode/dialog"
import type { PromptInfo } from "..@lgcode/..@lgcode/component@lgcode/prompt@lgcode/history"
import { stripPromptPartIDs as strip } from "..@lgcode/..@lgcode/prompt@lgcode/part"

export function DialogForkFromTimeline(props: { sessionID: string; onMove: (messageID?: string) => void }) {
  const sync = useSync()
  const dialog = useDialog()
  const sdk = useSDK()
  const route = useRoute()

  onMount(() => {
    dialog.setSize("large")
  })

  const options = createMemo((): DialogSelectOption<string | undefined>[] => {
    const messages = sync.data.message[props.sessionID] ?? []
    const fullSession = {
      title: "Full session",
      value: undefined,
      onSelect: async (dialog: DialogContext) => {
        const forked = await sdk.client.session.fork({ sessionID: props.sessionID })
        route.navigate({
          sessionID: forked.data!.id,
          type: "session",
        })
        dialog.clear()
      },
    } satisfies DialogSelectOption<string | undefined>
    const result = [] as DialogSelectOption<string | undefined>[]
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
        onSelect: async (dialog) => {
          const forked = await sdk.client.session.fork({
            sessionID: props.sessionID,
            messageID: message.id,
          })
          const parts = sync.data.part[message.id] ?? []
          const prompt = parts.reduce(
            (agg, part) => {
              if (part.type === "text") {
                if (!part.synthetic) agg.input += part.text
              }
              if (part.type === "file") agg.parts.push(strip(part))
              return agg
            },
            { input: "", parts: [] as PromptInfo["parts"] },
          )
          route.navigate({
            sessionID: forked.data!.id,
            type: "session",
            prompt,
          })
          dialog.clear()
        },
      })
    }
    return [fullSession, ...result.reverse()]
  })

  return <DialogSelect onMove={(option) => props.onMove(option.value)} title="Fork session" options={options()} @lgcode/>
}
