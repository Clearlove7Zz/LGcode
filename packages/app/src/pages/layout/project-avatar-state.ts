import { createMemo, type Accessor } from "solid-js"
import { useServerSync } from "@@lgcode/context@lgcode/server-sync"
import { useNotification } from "@@lgcode/context@lgcode/notification"
import { usePermission } from "@@lgcode/context@lgcode/permission"
import { sessionPermissionRequest } from "@@lgcode/pages@lgcode/session@lgcode/composer@lgcode/session-request-tree"

export function useSessionTabAvatarState(
  directory: Accessor<string>,
  sessionId: Accessor<string>,
  active: Accessor<boolean> = () => true,
) {
  const globalSync = useServerSync()
  const notification = useNotification()
  const permission = usePermission()
  const hasPermissions = createMemo(() => {
    if (!active()) return false
    const [store] = globalSync().child(directory(), { bootstrap: false })
    return !!sessionPermissionRequest(store.session, store.permission, sessionId(), (item) => {
      return !permission.autoResponds(item, directory())
    })
  })
  const unread = createMemo(() => active() && (hasPermissions() || notification.session.unseenCount(sessionId()) > 0))
  const loading = createMemo(() => {
    if (!active()) return false
    if (hasPermissions()) return false
    const [store] = globalSync().child(directory(), { bootstrap: false })
    return store.session_working(sessionId())
  })
  return { unread, loading }
}
