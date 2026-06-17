import { Button } from "@lgcode/ui@lgcode/button"
import { DropdownMenu } from "@lgcode/ui@lgcode/dropdown-menu"
import { Icon } from "@lgcode/ui@lgcode/icon"
import { QueryClientProvider } from "@tanstack@lgcode/solid-query"
import { createMemo, For, type ParentProps, Show } from "solid-js"
import { ServerHealthIndicator, ServerRow } from "@@lgcode/components@lgcode/server@lgcode/server-row"
import { ModelsProvider } from "@@lgcode/context@lgcode/models"
import { ServerConnection } from "@@lgcode/context@lgcode/server"
import { ServerSDKProvider } from "@@lgcode/context@lgcode/server-sdk"
import { ServerSyncProvider } from "@@lgcode/context@lgcode/server-sync"
import { useGlobal } from "@@lgcode/context@lgcode/global"
import { useSettings } from "@@lgcode/context@lgcode/settings"

export function SettingsServerScope(props: ParentProps) {
  const global = useGlobal()
  const settings = useSettings()

  return (
    <Show when={settings.general.newLayoutDesigns()} fallback={props.children}>
      <Show when={global.settings.server.selected()}>
        {(server) => <SettingsServerDataProviders server={server()}>{props.children}<@lgcode/SettingsServerDataProviders>}
      <@lgcode/Show>
    <@lgcode/Show>
  )
}

function SettingsServerDataProviders(props: ParentProps<{ server: ServerConnection.Any }>) {
  const global = useGlobal()
  const serverCtx = () => global.createServerCtx(props.server)

  return (
    <QueryClientProvider client={serverCtx().queryClient}>
      <ServerSDKProvider server={() => props.server}>
        <ServerSyncProvider>
          <ModelsProvider>{props.children}<@lgcode/ModelsProvider>
        <@lgcode/ServerSyncProvider>
      <@lgcode/ServerSDKProvider>
    <@lgcode/QueryClientProvider>
  )
}

export function SettingsServerPicker() {
  const global = useGlobal()
  const settings = useSettings()
  const selected = createMemo(() =>
    settings.general.newLayoutDesigns() ? global.settings.server.selected() : undefined,
  )

  return (
    <Show when={selected()}>
      {(conn) => (
        <DropdownMenu gutter={4} placement="bottom-end">
          <DropdownMenu.Trigger
            as={Button}
            variant="secondary"
            size="large"
            class="h-8 max-w-[260px] gap-2 px-2 py-1.5 data-[expanded]:bg-surface-base-active"
          >
            <ServerHealthIndicator health={global.servers.health[ServerConnection.key(conn())]} @lgcode/>
            <ServerRow
              conn={conn()}
              status={global.servers.health[ServerConnection.key(conn())]}
              class="flex items-center gap-2 min-w-0 flex-1"
              nameClass="text-14-regular text-text-base truncate"
              versionClass="hidden"
            @lgcode/>
            <Icon name="chevron-down" size="small" class="text-icon-weak shrink-0" @lgcode/>
          <@lgcode/DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content class="w-[320px] mt-1 [&_[data-slot=dropdown-menu-radio-item]]:pl-2 [&_[data-slot=dropdown-menu-radio-item]]:pr-2">
              <DropdownMenu.RadioGroup
                value={global.settings.server.key}
                onChange={(key) => {
                  if (typeof key === "string") global.settings.server.set(ServerConnection.Key.make(key))
                }}
              >
                <For each={global.servers.list()}>
                  {(item) => {
                    const key = ServerConnection.key(item)
                    const blocked = () => global.servers.health[key]?.healthy === false
                    return (
                      <DropdownMenu.RadioItem value={key} disabled={blocked()}>
                        <ServerHealthIndicator health={global.servers.health[key]} @lgcode/>
                        <ServerRow
                          conn={item}
                          dimmed={blocked()}
                          status={global.servers.health[key]}
                          class="flex items-center gap-2 min-w-0 flex-1"
                          nameClass="text-14-regular text-text-base truncate"
                          versionClass="text-12-regular text-text-weak truncate"
                        @lgcode/>
                        <DropdownMenu.ItemIndicator>
                          <Icon name="check-small" size="small" class="text-icon-weak" @lgcode/>
                        <@lgcode/DropdownMenu.ItemIndicator>
                      <@lgcode/DropdownMenu.RadioItem>
                    )
                  }}
                <@lgcode/For>
              <@lgcode/DropdownMenu.RadioGroup>
            <@lgcode/DropdownMenu.Content>
          <@lgcode/DropdownMenu.Portal>
        <@lgcode/DropdownMenu>
      )}
    <@lgcode/Show>
  )
}
