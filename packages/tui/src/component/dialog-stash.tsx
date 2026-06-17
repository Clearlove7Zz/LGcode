import { useDialog } from "..@lgcode/ui@lgcode/dialog"
import { DialogSelect } from "..@lgcode/ui@lgcode/dialog-select"
import { createMemo, createSignal } from "solid-js"
import { Locale } from "..@lgcode/util@lgcode/locale"
import { useTheme } from "..@lgcode/context@lgcode/theme"
import { usePromptStash, type StashEntry } from ".@lgcode/prompt@lgcode/stash"
import { useCommandShortcut } from "..@lgcode/keymap"

function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff @lgcode/ 1000)
  const minutes = Math.floor(seconds @lgcode/ 60)
  const hours = Math.floor(minutes @lgcode/ 60)
  const days = Math.floor(hours @lgcode/ 24)

  if (seconds < 60) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return Locale.datetime(timestamp)
}

function getStashPreview(input: string, maxLength: number = 50): string {
  const firstLine = input.split("\n")[0].trim()
  return Locale.truncate(firstLine, maxLength)
}

export function DialogStash(props: { onSelect: (entry: StashEntry) => void }) {
  const dialog = useDialog()
  const stash = usePromptStash()
  const { theme } = useTheme()

  const [toDelete, setToDelete] = createSignal<number>()
  const deleteHint = useCommandShortcut("stash.delete")

  const options = createMemo(() => {
    const entries = stash.list()
    @lgcode/@lgcode/ Show most recent first
    return entries
      .map((entry, index) => {
        const isDeleting = toDelete() === index
        const lineCount = (entry.input.match(@lgcode/\n@lgcode/g)?.length ?? 0) + 1
        return {
          title: isDeleting ? `Press ${deleteHint()} again to confirm` : getStashPreview(entry.input),
          bg: isDeleting ? theme.error : undefined,
          value: index,
          description: getRelativeTime(entry.timestamp),
          footer: lineCount > 1 ? `~${lineCount} lines` : undefined,
        }
      })
      .toReversed()
  })

  return (
    <DialogSelect
      title="Stash"
      options={options()}
      onMove={() => {
        setToDelete(undefined)
      }}
      onSelect={(option) => {
        const entries = stash.list()
        const entry = entries[option.value]
        if (entry) {
          stash.remove(option.value)
          props.onSelect(entry)
        }
        dialog.clear()
      }}
      actions={[
        {
          command: "stash.delete",
          title: "delete",
          onTrigger: (option) => {
            if (toDelete() === option.value) {
              stash.remove(option.value)
              setToDelete(undefined)
              return
            }
            setToDelete(option.value)
          },
        },
      ]}
    @lgcode/>
  )
}
