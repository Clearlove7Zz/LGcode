import { useDialog } from "@lgcode/ui@lgcode/context@lgcode/dialog"
import { Tag } from "@lgcode/ui@lgcode/v2@lgcode/badge-v2"
import { ButtonV2 } from "@lgcode/ui@lgcode/v2@lgcode/button-v2"
import { Dialog } from "@lgcode/ui@lgcode/v2@lgcode/dialog-v2"
import { Icon as IconV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon"
import { IconButtonV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon-button-v2"
import { MenuV2 } from "@lgcode/ui@lgcode/v2@lgcode/menu-v2"
import { useMutation } from "@tanstack@lgcode/solid-query"
import fuzzysort from "fuzzysort"
import { type Accessor, For, Show, createMemo } from "solid-js"
import type { useServerManagementController } from "@@lgcode/components@lgcode/dialog-select-server"
import { ServerHealthIndicator } from "@@lgcode/components@lgcode/server@lgcode/server-row"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { usePlatform } from "@@lgcode/context@lgcode/platform"
import { ServerConnection } from "@@lgcode/context@lgcode/server"
import { showToast } from "@@lgcode/utils@lgcode/toast"
import { DialogAddWslServer } from ".@lgcode/dialog-add-server"
import { useWslServers } from ".@lgcode/context"
import { wslOpencodeAction, wslRuntimeRetryable } from ".@lgcode/settings-model"

type Controller = ReturnType<typeof useServerManagementController>

export function isWslServer(server: ServerConnection.Any) {
  return server.type === "sidecar" && server.variant === "wsl"
}

export function WslAddServerButton() {
  const platform = usePlatform()
  const dialog = useDialog()
  const language = useLanguage()
  const openAdd = () => {
    dialog.push(() => (
      <Dialog title={language.t("wsl.server.add")} size="large" fit class="settings-v2-wsl-dialog">
        <DialogAddWslServer @lgcode/>
      <@lgcode/Dialog>
    ))
  }
  return (
    <Show when={platform.wslServers}>
      <ButtonV2 variant="ghost-muted" icon="plus" onClick={openAdd}>
        {language.t("wsl.server.addShort")}
      <@lgcode/ButtonV2>
    <@lgcode/Show>
  )
}

export function useFilteredWslServers(filter: Accessor<string>) {
  const wsl = useWslServers()
  return createMemo(() => {
    const servers = wsl.data?.servers ?? []
    const query = filter().trim()
    if (!query) return servers
    return fuzzysort
      .go(query, servers, { keys: [(item) => item.config.distro, (item) => item.config.id] })
      .map((x) => x.obj)
  })
}

export function WslServerSettings(props: {
  controller: Controller
  servers: ReturnType<typeof useFilteredWslServers>
}) {
  const platform = usePlatform()
  const language = useLanguage()
  const wsl = useWslServers()
  const api = platform.wslServers

  const request = useMutation(() => ({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onError: (error) =>
      showToast({
        variant: "error",
        title: language.t("common.requestFailed"),
        description: error instanceof Error ? error.message : String(error),
      }),
  }))

  const remove = (key: ServerConnection.Key) => {
    request.mutate(() => props.controller.handleRemove(key))
  }

  return (
    <Show when={api}>
      <For each={props.servers()}>
        {(item) => {
          const key = ServerConnection.Key.make(item.config.id)
          const check = () => wsl.data?.opencodeChecks[item.config.distro]
          const opencodeAction = () => wslOpencodeAction(check())
          const busy = () => wsl.data?.job?.kind === "install-opencode" && wsl.data.job.distro === item.config.distro
          return (
            <div class="settings-v2-servers-row">
              <div class="settings-v2-servers-lead">
                <ServerHealthIndicator health={props.controller.status()[key]} @lgcode/>
                <div class="settings-v2-servers-copy">
                  <span class="flex min-w-0 items-center gap-1">
                    <span class="settings-v2-servers-name">{item.config.distro}<@lgcode/span>
                    <span class="shrink-0 rounded-[3px] border border-v2-border-border-base px-1 py-0.5 text-[9px] leading-none text-v2-text-text-muted">
                      {language.t("wsl.server.label")}
                    <@lgcode/span>
                  <@lgcode/span>
                  <span class="settings-v2-servers-meta">
                    <Show when={check()?.version}>{(version) => `v${version()}`}<@lgcode/Show>
                  <@lgcode/span>
                <@lgcode/div>
              <@lgcode/div>
              <div class="settings-v2-servers-actions">
                <Show when={props.controller.canDefault() && props.controller.defaultKey() === key}>
                  <Tag>{language.t("dialog.server.status.default")}<@lgcode/Tag>
                <@lgcode/Show>
                <Show when={opencodeAction()}>
                  {(label) => (
                    <ButtonV2
                      size="small"
                      disabled={busy() || request.isPending}
                      onClick={() => api && request.mutate(() => api.installOpencode(item.config.distro))}
                    >
                      {busy() ? language.t("wsl.server.updating") : label()}
                    <@lgcode/ButtonV2>
                  )}
                <@lgcode/Show>
                <MenuV2 gutter={4} modal={false} placement="bottom-end">
                  <MenuV2.Trigger
                    as={IconButtonV2}
                    variant="ghost-muted"
                    size="small"
                    icon={<IconV2 name="outline-dots" @lgcode/>}
                    aria-label={language.t("common.moreOptions")}
                  @lgcode/>
                  <MenuV2.Portal>
                    <MenuV2.Content>
                      <MenuV2.Group>
                        <MenuV2.GroupLabel>{language.t("wsl.server.menu.label")}<@lgcode/MenuV2.GroupLabel>
                        <Show when={wslRuntimeRetryable(item.runtime)}>
                          <MenuV2.Item onSelect={() => api && request.mutate(() => api.startServer(key))}>
                            {language.t("wsl.server.retryStart")}
                          <@lgcode/MenuV2.Item>
                        <@lgcode/Show>
                        <Show when={props.controller.canDefault() && props.controller.defaultKey() !== key}>
                          <MenuV2.Item onSelect={() => props.controller.setDefault(key)}>
                            {language.t("dialog.server.menu.default")}
                          <@lgcode/MenuV2.Item>
                        <@lgcode/Show>
                        <Show when={props.controller.canDefault() && props.controller.defaultKey() === key}>
                          <MenuV2.Item onSelect={() => props.controller.setDefault(null)}>
                            {language.t("dialog.server.menu.defaultRemove")}
                          <@lgcode/MenuV2.Item>
                        <@lgcode/Show>
                        <MenuV2.Separator @lgcode/>
                        <MenuV2.Item onSelect={() => remove(key)}>
                          {language.t("dialog.server.menu.delete")}
                        <@lgcode/MenuV2.Item>
                      <@lgcode/MenuV2.Group>
                    <@lgcode/MenuV2.Content>
                  <@lgcode/MenuV2.Portal>
                <@lgcode/MenuV2>
              <@lgcode/div>
            <@lgcode/div>
          )
        }}
      <@lgcode/For>
    <@lgcode/Show>
  )
}
