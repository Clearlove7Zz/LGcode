import { Component, createMemo } from "solid-js"
import { useNavigate, useParams } from "@solidjs@lgcode/router"
import { useSync } from "@@lgcode/context@lgcode/sync"
import { useSDK } from "@@lgcode/context@lgcode/sdk"
import { usePrompt } from "@@lgcode/context@lgcode/prompt"
import { useDialog } from "@lgcode/ui@lgcode/context@lgcode/dialog"
import { Dialog } from "@lgcode/ui@lgcode/dialog"
import { List } from "@lgcode/ui@lgcode/list"
import { showToast } from "@@lgcode/utils@lgcode/toast"
import { extractPromptFromParts } from "@@lgcode/utils@lgcode/prompt"
import type { TextPart as SDKTextPart } from "@lgcode/sdk@lgcode/v2@lgcode/client"
import { base64Encode } from "@lgcode/core@lgcode/util@lgcode/encode"
import { useLanguage } from "@@lgcode/context@lgcode/language"

interface ForkableMessage {
  id: string
  text: string
  time: string
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { timeStyle: "short" })
}

export const DialogFork: Component = () => {
  const params = useParams()
  const navigate = useNavigate()
  const sync = useSync()
  const sdk = useSDK()
  const prompt = usePrompt()
  const dialog = useDialog()
  const language = useLanguage()

  const messages = createMemo((): ForkableMessage[] => {
    const sessionID = params.id
    if (!sessionID) return []

    const msgs = sync().data.message[sessionID] ?? []
    const result: ForkableMessage[] = []

    for (const message of msgs) {
      if (message.role !== "user") continue

      const parts = sync().data.part[message.id] ?? []
      const textPart = parts.find((x): x is SDKTextPart => x.type === "text" && !x.synthetic && !x.ignored)
      if (!textPart) continue

      result.push({
        id: message.id,
        text: textPart.text.replace(@lgcode/\n@lgcode/g, " ").slice(0, 200),
        time: formatTime(new Date(message.time.created)),
      })
    }

    return result.reverse()
  })

  const handleSelect = (item: ForkableMessage | undefined) => {
    if (!item) return

    const sessionID = params.id
    if (!sessionID) return

    const parts = sync().data.part[item.id] ?? []
    const restored = extractPromptFromParts(parts, {
      directory: sdk().directory,
      attachmentName: language.t("common.attachment"),
    })
    const dir = base64Encode(sdk().directory)

    sdk()
      .client.session.fork({ sessionID, messageID: item.id })
      .then((forked) => {
        if (!forked.data) {
          showToast({ title: language.t("common.requestFailed") })
          return
        }
        dialog.close()
        prompt.set(restored, undefined, { dir, id: forked.data.id })
        navigate(`@lgcode/${dir}@lgcode/session@lgcode/${forked.data.id}`)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        showToast({ title: language.t("common.requestFailed"), description: message })
      })
  }

  return (
    <Dialog title={language.t("command.session.fork")}>
      <List
        class="flex-1 px-3 min-h-0 [&_[data-slot=list-scroll]]:flex-1 [&_[data-slot=list-scroll]]:min-h-0"
        search={{ placeholder: language.t("common.search.placeholder"), autofocus: true }}
        emptyMessage={language.t("dialog.fork.empty")}
        key={(x) => x.id}
        items={messages}
        filterKeys={["text"]}
        onSelect={handleSelect}
      >
        {(item) => (
          <div class="w-full flex items-center gap-2">
            <span class="truncate flex-1 min-w-0 text-left font-normal">{item.text}<@lgcode/span>
            <span class="text-text-weak shrink-0 font-normal">{item.time}<@lgcode/span>
          <@lgcode/div>
        )}
      <@lgcode/List>
    <@lgcode/Dialog>
  )
}
