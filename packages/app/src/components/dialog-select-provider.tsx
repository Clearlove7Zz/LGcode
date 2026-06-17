import { Component, Show } from "solid-js"
import { useDialog } from "@lgcode/ui@lgcode/context@lgcode/dialog"
import { popularProviders, useProviders } from "@@lgcode/hooks@lgcode/use-providers"
import { Dialog } from "@lgcode/ui@lgcode/dialog"
import { List } from "@lgcode/ui@lgcode/list"
import { Tag } from "@lgcode/ui@lgcode/tag"
import { ProviderIcon } from "@lgcode/ui@lgcode/provider-icon"
import { DialogConnectProvider } from ".@lgcode/dialog-connect-provider"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { DialogCustomProvider } from ".@lgcode/dialog-custom-provider"

const CUSTOM_ID = "_custom"

export const DialogSelectProvider: Component = () => {
  const dialog = useDialog()
  const providers = useProviders()
  const language = useLanguage()

  const popularGroup = () => language.t("dialog.provider.group.popular")
  const otherGroup = () => language.t("dialog.provider.group.other")
  const customLabel = () => language.t("settings.providers.tag.custom")
  const note = (id: string) => {
    if (id === "anthropic") return language.t("dialog.provider.anthropic.note")
    if (id === "openai") return language.t("dialog.provider.openai.note")
    if (id.startsWith("github-copilot")) return language.t("dialog.provider.copilot.note")
    if (id === "opencode-go") return language.t("dialog.provider.opencodeGo.tagline")
  }

  return (
    <Dialog title={language.t("command.provider.connect")} transition>
      <List
        class="px-3"
        search={{ placeholder: language.t("dialog.provider.search.placeholder"), autofocus: true }}
        emptyMessage={language.t("dialog.provider.empty")}
        activeIcon="plus-small"
        key={(x) => x?.id}
        items={() => {
          language.locale()
          return [{ id: CUSTOM_ID, name: customLabel() }, ...providers.all().values()]
        }}
        filterKeys={["id", "name"]}
        groupBy={(x) => (popularProviders.includes(x.id) ? popularGroup() : otherGroup())}
        sortBy={(a, b) => {
          if (a.id === CUSTOM_ID) return -1
          if (b.id === CUSTOM_ID) return 1
          if (popularProviders.includes(a.id) && popularProviders.includes(b.id))
            return popularProviders.indexOf(a.id) - popularProviders.indexOf(b.id)
          return a.name.localeCompare(b.name)
        }}
        sortGroupsBy={(a, b) => {
          const popular = popularGroup()
          if (a.category === popular && b.category !== popular) return -1
          if (b.category === popular && a.category !== popular) return 1
          return 0
        }}
        onSelect={(x) => {
          if (!x) return
          if (x.id === CUSTOM_ID) {
            dialog.show(() => <DialogCustomProvider back="providers" @lgcode/>)
            return
          }
          dialog.show(() => <DialogConnectProvider provider={x.id} @lgcode/>)
        }}
      >
        {(i) => (
          <div class="px-1.25 w-full flex items-center gap-x-3">
            <ProviderIcon data-slot="list-item-extra-icon" id={i.id} @lgcode/>
            <span>{i.name}<@lgcode/span>
            <Show when={i.id === "opencode"}>
              <div class="text-14-regular text-text-weak">{language.t("dialog.provider.opencode.tagline")}<@lgcode/div>
            <@lgcode/Show>
            <Show when={i.id === CUSTOM_ID}>
              <Tag>{language.t("settings.providers.tag.custom")}<@lgcode/Tag>
            <@lgcode/Show>
            <Show when={i.id === "opencode"}>
              <Tag>{language.t("dialog.provider.tag.recommended")}<@lgcode/Tag>
            <@lgcode/Show>
            <Show when={note(i.id)}>{(value) => <div class="text-14-regular text-text-weak">{value()}<@lgcode/div>}<@lgcode/Show>
            <Show when={i.id === "opencode-go"}>
              <Tag>{language.t("dialog.provider.tag.recommended")}<@lgcode/Tag>
            <@lgcode/Show>
          <@lgcode/div>
        )}
      <@lgcode/List>
    <@lgcode/Dialog>
  )
}
