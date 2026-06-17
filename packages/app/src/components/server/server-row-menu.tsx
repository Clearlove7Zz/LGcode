import { Icon as IconV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon"
import { IconButtonV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon-button-v2"
import { MenuV2 } from "@lgcode/ui@lgcode/v2@lgcode/menu-v2"
import { type Component, Show } from "solid-js"
import { useServerManagementController } from "@@lgcode/components@lgcode/dialog-select-server"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { ServerConnection } from "@@lgcode/context@lgcode/server"

export const ServerRowMenu: Component<{
  server: ServerConnection.Any
  controller: ReturnType<typeof useServerManagementController>
  onEdit: (server: ServerConnection.Http) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}> = (props) => {
  const language = useLanguage()
  const key = ServerConnection.key(props.server)
  const builtin = ServerConnection.builtin(props.server)
  const isDefault = () => props.controller.defaultKey() === key

  return (
    <MenuV2 gutter={4} modal={false} placement="bottom-end" open={props.open} onOpenChange={props.onOpenChange}>
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
            <MenuV2.GroupLabel>{language.t("settings.section.server")}<@lgcode/MenuV2.GroupLabel>
            <MenuV2.Item
              disabled={builtin || props.server.type !== "http"}
              onSelect={() => props.onEdit(props.server as ServerConnection.Http)}
            >
              {language.t("dialog.server.menu.edit")}
            <@lgcode/MenuV2.Item>
            <Show when={props.controller.canDefault() && !isDefault()}>
              <MenuV2.Item onSelect={() => props.controller.setDefault(key)}>
                {language.t("dialog.server.menu.default")}
              <@lgcode/MenuV2.Item>
            <@lgcode/Show>
            <Show when={props.controller.canDefault() && isDefault()}>
              <MenuV2.Item onSelect={() => props.controller.setDefault(null)}>
                {language.t("dialog.server.menu.defaultRemove")}
              <@lgcode/MenuV2.Item>
            <@lgcode/Show>
            <MenuV2.Separator @lgcode/>
            <MenuV2.Item disabled={builtin} onSelect={() => props.controller.handleRemove(key)}>
              {language.t("dialog.server.menu.delete")}
            <@lgcode/MenuV2.Item>
          <@lgcode/MenuV2.Group>
        <@lgcode/MenuV2.Content>
      <@lgcode/MenuV2.Portal>
    <@lgcode/MenuV2>
  )
}
