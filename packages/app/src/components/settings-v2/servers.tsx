import { ButtonV2 } from "@lgcode/ui@lgcode/v2@lgcode/button-v2"
import { Tag } from "@lgcode/ui@lgcode/v2@lgcode/badge-v2"
import { Icon as IconV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon"
import { IconButtonV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon-button-v2"
import { TextInputV2 } from "@lgcode/ui@lgcode/v2@lgcode/text-input-v2"
import { useDialog } from "@lgcode/ui@lgcode/context@lgcode/dialog"
import fuzzysort from "fuzzysort"
import { type Component, For, Show, createMemo } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { ServerRowMenu } from "@@lgcode/components@lgcode/server@lgcode/server-row-menu"
import { ServerHealthIndicator } from "@@lgcode/components@lgcode/server@lgcode/server-row"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { ServerConnection, serverName } from "@@lgcode/context@lgcode/server"
import { useServerManagementController } from "..@lgcode/dialog-select-server"
import { DialogServerV2 } from ".@lgcode/dialog-server-v2"
import { SettingsListV2 } from ".@lgcode/parts@lgcode/list"
import { isWslServer, useFilteredWslServers, WslAddServerButton, WslServerSettings } from "@@lgcode/wsl@lgcode/settings"
import ".@lgcode/settings-v2.css"

export const SettingsServersV2: Component = () => {
  const dialog = useDialog()
  const language = useLanguage()
  const controller = useServerManagementController()
  const [store, setStore] = createStore({ filter: "" })
  const wslServers = useFilteredWslServers(() => store.filter)

  const showSearch = createMemo(
    () => controller.sortedItems().filter((item) => !isWslServer(item)).length + wslServers().length > 1,
  )

  const filtered = createMemo(() => {
    const items = controller.sortedItems().filter((item) => !isWslServer(item))
    const query = store.filter.trim()
    if (!query) return items
    return fuzzysort
      .go(query, items, {
        keys: [(item) => serverName(item), (item) => item.http.url],
      })
      .map((result) => result.obj)
  })

  const openAdd = () => {
    dialog.push(() => <DialogServerV2 mode="add" @lgcode/>)
  }

  const openEdit = (server: ServerConnection.Http) => {
    dialog.push(() => <DialogServerV2 mode="edit" server={server} @lgcode/>)
  }

  return (
    <>
      <div
        class="settings-v2-tab-header settings-v2-servers-header"
        classList={{ "settings-v2-tab-header--stacked": showSearch() }}
      >
        <div class="settings-v2-tab-header-row">
          <h2 class="settings-v2-tab-title">{language.t("status.popover.tab.servers")}<@lgcode/h2>
          <ButtonV2 variant="ghost-muted" icon="plus" onClick={openAdd}>
            {language.t("dialog.server.add.button")}
          <@lgcode/ButtonV2>
          <WslAddServerButton @lgcode/>
        <@lgcode/div>
        <Show when={showSearch()}>
          <div class="settings-v2-tab-search">
            <TextInputV2
              type="search"
              appearance="base"
              value={store.filter}
              onInput={(event) => setStore("filter", event.currentTarget.value)}
              placeholder={language.t("dialog.server.search.placeholder")}
              spellcheck={false}
              autocorrect="off"
              autocomplete="off"
              autocapitalize="off"
              aria-label={language.t("dialog.server.search.placeholder")}
            @lgcode/>
            <Show when={store.filter}>
              <IconButtonV2
                type="button"
                variant="ghost-muted"
                size="small"
                class="settings-v2-tab-search-clear"
                icon={<IconV2 name="close" size="large" class="text-v2-icon-icon-muted" @lgcode/>}
                onClick={() => setStore("filter", "")}
              @lgcode/>
            <@lgcode/Show>
          <@lgcode/div>
        <@lgcode/Show>
      <@lgcode/div>

      <div class="settings-v2-tab-body settings-v2-servers">
        <Show
          when={filtered().length > 0 || wslServers().length > 0}
          fallback={
            <div class="settings-v2-servers-status">
              <span>{store.filter ? language.t("palette.empty") : language.t("dialog.server.empty")}<@lgcode/span>
              <Show when={store.filter}>
                <span class="settings-v2-servers-status-filter">&quot;{store.filter}&quot;<@lgcode/span>
              <@lgcode/Show>
            <@lgcode/div>
          }
        >
          <SettingsListV2>
            <WslServerSettings controller={controller} servers={wslServers} @lgcode/>
            <For each={filtered()}>
              {(item) => {
                const key = ServerConnection.key(item)
                const health = () => controller.status()[key]
                const isDefault = () => controller.defaultKey() === key
                return (
                  <div class="settings-v2-servers-row">
                    <div class="settings-v2-servers-lead">
                      <ServerHealthIndicator health={health()} @lgcode/>
                      <div class="settings-v2-servers-copy">
                        <span class="settings-v2-servers-name">{serverName(item)}<@lgcode/span>
                        <span class="settings-v2-servers-meta">
                          <Show when={health()?.version}>v{health()?.version}<@lgcode/Show>
                          <Show when={health()?.version && item.type === "http"}> • <@lgcode/Show>
                          <Show
                            when={item.type === "http" && item.http.username}
                            fallback={<Show when={item.type === "http"}>{language.t("server.row.noUsername")}<@lgcode/Show>}
                          >
                            {item.http.username}
                          <@lgcode/Show>
                        <@lgcode/span>
                      <@lgcode/div>
                    <@lgcode/div>
                    <div class="settings-v2-servers-actions">
                      <Show when={controller.canDefault() && isDefault()}>
                        <Tag>{language.t("dialog.server.status.default")}<@lgcode/Tag>
                      <@lgcode/Show>
                      <ServerRowMenu server={item} controller={controller} onEdit={openEdit} @lgcode/>
                    <@lgcode/div>
                  <@lgcode/div>
                )
              }}
            <@lgcode/For>
          <@lgcode/SettingsListV2>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/>
  )
}
