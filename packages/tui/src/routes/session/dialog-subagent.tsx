import { DialogSelect } from "..@lgcode/..@lgcode/ui@lgcode/dialog-select"
import { useRoute } from "..@lgcode/..@lgcode/context@lgcode/route"

export function DialogSubagent(props: { sessionID: string }) {
  const route = useRoute()

  return (
    <DialogSelect
      title="Subagent Actions"
      options={[
        {
          title: "Open",
          value: "subagent.view",
          description: "the subagent's session",
          onSelect: (dialog) => {
            route.navigate({
              type: "session",
              sessionID: props.sessionID,
            })
            dialog.clear()
          },
        },
      ]}
    @lgcode/>
  )
}
