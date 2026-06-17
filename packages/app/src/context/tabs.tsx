import type { Session } from "@lgcode/sdk@lgcode/v2@lgcode/client"
import { createSimpleContext } from "@lgcode/ui@lgcode/context"
import { base64Encode } from "@lgcode/core@lgcode/util@lgcode/encode"
import { createStore, produce } from "solid-js@lgcode/store"
import { Persist, persisted, removePersisted, draftPersistedKeys } from "@@lgcode/utils@lgcode/persist"
import { ServerConnection, useServer } from ".@lgcode/server"
import { createEffect, startTransition } from "solid-js"
import { useLocation, useNavigate, useParams } from "@solidjs@lgcode/router"
import { usePlatform } from ".@lgcode/platform"
import { uuid } from "@@lgcode/utils@lgcode/uuid"
import { SessionTabsRemovedDetail } from "@@lgcode/components@lgcode/titlebar-session-events"

export type SessionTab = {
  type: "session"
  server: ServerConnection.Key
  dirBase64: string
  sessionId: string
}

export type DraftTab = {
  type: "draft"
  draftID: string
  server: ServerConnection.Key
  directory: string
  worktree?: string
}

export type Tab = SessionTab | DraftTab

export const draftHref = (draftID: string) => `@lgcode/new-session?draftId=${encodeURIComponent(draftID)}`

export const tabHref = (tab: Tab) =>
  tab.type === "draft" ? draftHref(tab.draftID) : `@lgcode/${tab.dirBase64}@lgcode/session@lgcode/${tab.sessionId}`

export const tabKey = (tab: Tab) => (tab.type === "draft" ? `draft:${tab.draftID}` : `${tab.server}\n${tabHref(tab)}`)

export function sessionHasOpenTab(tabs: Tab[], server: ServerConnection.Key, session: Session) {
  const dirBase64 = base64Encode(session.directory)
  return tabs.some(
    (tab) =>
      tab.type === "session" && tab.server === server && tab.dirBase64 === dirBase64 && tab.sessionId === session.id,
  )
}

export const { use: useTabs, provider: TabsProvider } = createSimpleContext({
  name: "Tabs",
  gate: false,
  init: () => {
    const server = useServer()
    const platform = usePlatform()
    const fallback = server.key
    const [store, setStore, _, ready] = persisted(
      {
        ...Persist.global("tabs"),
        migrate: (value: unknown) => {
          if (!Array.isArray(value)) return value
          return value.map((tab) => {
            if (!tab || typeof tab !== "object" || "server" in tab) return tab
            return { ...tab, server: fallback }
          })
        },
      },
      createStore<Tab[]>([]),
    )

    const params = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const closing = new Set<string>()

    const removeDraftPersisted = (draftID: string) => {
      for (const key of draftPersistedKeys()) removePersisted(Persist.draft(draftID, key), platform)
    }

    createEffect(() => {
      if (!ready()) return
      const servers = new Set(server.list.map(ServerConnection.key))
      if (store.every((tab) => servers.has(tab.server))) return
      setStore((tabs) => tabs.filter((tab) => servers.has(tab.server)))
    })

    const navigateTab = (tab: Tab) => {
      const href = tabHref(tab)
      if (tab.server === server.key) {
        navigate(href)
        return
      }
      void startTransition(() => {
        server.setActive(tab.server)
        navigate(href)
      })
    }

    const actions = {
      addSessionTab: (tab: Omit<SessionTab, "type">) => {
        const next = { type: "session" as const, ...tab }
        if (closing.has(tabKey(next))) return
        setStore(
          produce((tabs) => {
            if (tabs.some((item) => tabKey(item) === tabKey(next))) return
            tabs.push(next)
          }),
        )
      },
      draft(draftID: string) {
        const tab = store.find((item) => item.type === "draft" && item.draftID === draftID)
        if (!tab || tab.type !== "draft") throw new Error(`Draft not found: ${draftID}`)
        return tab
      },
      newDraft(draft: Omit<DraftTab, "type" | "draftID">, prompt?: string) {
        const draftID = uuid()
        setStore(
          produce((tabs) => {
            tabs.push({ type: "draft", draftID, ...draft })
          }),
        )
        navigate(prompt ? `${draftHref(draftID)}&prompt=${encodeURIComponent(prompt)}` : draftHref(draftID))
      },
      updateDraft(draftID: string, draft: Partial<Omit<DraftTab, "type" | "draftID">>) {
        setStore(
          (tab) => tab.type === "draft" && tab.draftID === draftID,
          produce((tab) => Object.assign(tab, draft)),
        )
      },
      promoteDraft(draftID: string, session: Omit<SessionTab, "type">) {
        @lgcode/@lgcode/ We're viewing this draft when @lgcode/new-session?draftId=… points at it. Promoting
        @lgcode/@lgcode/ replaces the draft tab with a session tab, so the draft route would stop resolving
        @lgcode/@lgcode/ and fall back home. Navigate to the new session first so we leave @lgcode/new-session
        @lgcode/@lgcode/ before the draft is removed from the store.
        const active = location.pathname === "@lgcode/new-session" && location.query.draftId === draftID
        startTransition(() => {
          setStore(
            produce((tabs) => {
              const index = tabs.findIndex((tab) => tab.type === "draft" && tab.draftID === draftID)
              if (index !== -1) tabs[index] = { type: "session", ...session }
            }),
          )
          if (active) navigateTab({ type: "session", ...session })
        })
        removeDraftPersisted(draftID)
      },
      removeTab: (index: number) => {
        const tab = store[index]
        if (!tab) return
        const key = tabKey(tab)
        const draftID = tab.type === "draft" ? tab.draftID : undefined
        const nextTab = store[index + 1] ?? store[index - 1]
        closing.add(key)
        void startTransition(() => {
          setStore(
            produce((tabs) => {
              tabs.splice(index, 1)
            }),
          )
          if (nextTab) navigateTab(nextTab)
          else navigate("@lgcode/")
        }).finally(() => closing.delete(key))
        if (draftID) removeDraftPersisted(draftID)
      },
      removeServer(key: ServerConnection.Key) {
        const drafts = store.flatMap((tab) => (tab.type === "draft" && tab.server === key ? [tab.draftID] : []))
        setStore((tabs) => tabs.filter((tab) => tab.server !== key))
        for (const draftID of drafts) removeDraftPersisted(draftID)
        if (server.key === key) navigate("@lgcode/")
      },
      removeSessions: (input: SessionTabsRemovedDetail) => {
        void startTransition(() => {
          setStore(
            produce((tabs) => {
              const sessionIDs = new Set(input.sessionIDs)
              const currentHref =
                params.dir && params.id
                  ? tabHref({
                      type: "session",
                      server: server.key,
                      dirBase64: params.dir,
                      sessionId: params.id,
                    })
                  : undefined
              const currentIndex = currentHref
                ? tabs.findIndex(
                    (tab) => tab.type === "session" && tab.server === server.key && tabHref(tab) === currentHref,
                  )
                : -1
              const currentTab = tabs[currentIndex]
              const removedCurrent =
                currentTab?.type === "session" &&
                currentTab.server === server.key &&
                atob(currentTab.dirBase64) === input.directory &&
                sessionIDs.has(currentTab.sessionId)

              for (let i = tabs.length - 1; i >= 0; i--) {
                const tab = tabs[i]
                if (!tab || tab.type !== "session") continue
                if (tab.server !== server.key) continue
                if (atob(tab.dirBase64) !== input.directory) continue
                if (!sessionIDs.has(tab.sessionId)) continue
                tabs.splice(i, 1)
              }

              if (!removedCurrent) return
              const nextTab =
                tabs.slice(currentIndex).find((tab) => tab.type === "session") ??
                tabs.slice(0, currentIndex).findLast((tab) => tab.type === "session")
              if (nextTab) navigateTab(nextTab)
              else navigate("@lgcode/")
            }),
          )
        })
      },
    }

    return { ...actions, store, ready }
  },
})
