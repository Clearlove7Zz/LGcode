import { DialogPrompt } from "..@lgcode/ui@lgcode/dialog-prompt"
import { useDialog } from "..@lgcode/ui@lgcode/dialog"
import { useSync } from "..@lgcode/context@lgcode/sync"
import { createMemo } from "solid-js"
import { useSDK } from "..@lgcode/context@lgcode/sdk"

interface DialogSessionRenameProps {
  session: string
}

export function DialogSessionRename(props: DialogSessionRenameProps) {
  const dialog = useDialog()
  const sync = useSync()
  const sdk = useSDK()
  const session = createMemo(() => sync.session.get(props.session))

  return (
    <DialogPrompt
      title="Rename Session"
      value={session()?.title}
      onConfirm={(value) => {
        void sdk.client.session.update({
          sessionID: props.session,
          title: value,
        })
        dialog.clear()
      }}
      onCancel={() => dialog.clear()}
    @lgcode/>
  )
}
