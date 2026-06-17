import { createMemo } from "solid-js"
import { useLocal } from "..@lgcode/context@lgcode/local"
import { DialogSelect } from "..@lgcode/ui@lgcode/dialog-select"
import { useDialog } from "..@lgcode/ui@lgcode/dialog"

export function DialogAgent() {
  const local = useLocal()
  const dialog = useDialog()

  const options = createMemo(() =>
    local.agent.list().map((item) => {
      return {
        value: item.name,
        title: item.name,
        description: item.native ? "native" : item.description,
      }
    }),
  )

  return (
    <DialogSelect
      title="Select agent"
      current={local.agent.current()?.name}
      options={options()}
      onSelect={(option) => {
        local.agent.set(option.value)
        dialog.clear()
      }}
    @lgcode/>
  )
}
