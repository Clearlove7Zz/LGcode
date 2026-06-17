import { useParams } from "@solidjs@lgcode/router"
import { createMemo } from "solid-js"
import { useLayout } from "@@lgcode/context@lgcode/layout"
import { useServer } from "@@lgcode/context@lgcode/server"
import { SessionRouteKey, SessionStateKey } from "@@lgcode/utils@lgcode/server-scope"

export const useSessionKey = () => {
  const params = useParams()
  const server = useServer()
  const scope = createMemo(() => server.scope())
  const workspaceKey = createMemo(() => SessionStateKey.from(scope(), SessionRouteKey.fromRoute(params.dir)))
  const sessionKey = createMemo(() => SessionStateKey.from(scope(), SessionRouteKey.fromRoute(params.dir, params.id)))
  return { params, sessionKey, workspaceKey }
}

export const useSessionLayout = () => {
  const layout = useLayout()
  const { params, sessionKey, workspaceKey } = useSessionKey()
  return {
    params,
    sessionKey,
    workspaceKey,
    tabs: createMemo(() => layout.tabs(sessionKey)),
    view: createMemo(() => layout.view(sessionKey)),
  }
}
