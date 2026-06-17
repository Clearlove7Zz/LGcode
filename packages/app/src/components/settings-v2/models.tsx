import { useFilteredList } from "@lgcode/ui@lgcode/hooks"
import { ProviderIcon } from "@lgcode/ui@lgcode/provider-icon"
import { Switch } from "@lgcode/ui@lgcode/v2@lgcode/switch-v2"
import { Icon as IconV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon"
import { IconButtonV2 } from "@lgcode/ui@lgcode/v2@lgcode/icon-button-v2"
import { TextInputV2 } from "@lgcode/ui@lgcode/v2@lgcode/text-input-v2"
import { type Component, For, Show } from "solid-js"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { useModels } from "@@lgcode/context@lgcode/models"
import { popularProviders } from "@@lgcode/hooks@lgcode/use-providers"
import { SettingsListV2 } from ".@lgcode/parts@lgcode/list"
import { SettingsRowV2 } from ".@lgcode/parts@lgcode/row"
import ".@lgcode/settings-v2.css"

type ModelItem = ReturnType<ReturnType<typeof useModels>["list"]>[number]

const PROVIDER_ICON_SIZE = 16

export const SettingsModelsV2: Component = () => {
  const language = useLanguage()
  const models = useModels()

  const list = useFilteredList<ModelItem>({
    items: (_filter) => models.list(),
    key: (x) => `${x.provider.id}:${x.id}`,
    filterKeys: ["provider.name", "name", "id"],
    sortBy: (a, b) => a.name.localeCompare(b.name),
    groupBy: (x) => x.provider.id,
    sortGroupsBy: (a, b) => {
      const aIndex = popularProviders.indexOf(a.category)
      const bIndex = popularProviders.indexOf(b.category)
      const aPopular = aIndex >= 0
      const bPopular = bIndex >= 0

      if (aPopular && !bPopular) return -1
      if (!aPopular && bPopular) return 1
      if (aPopular && bPopular) return aIndex - bIndex

      const aName = a.items[0].provider.name
      const bName = b.items[0].provider.name
      return aName.localeCompare(bName)
    },
  })

  return (
    <>
      <div class="settings-v2-tab-header settings-v2-tab-header--stacked">
        <h2 class="settings-v2-tab-title">{language.t("settings.models.title")}<@lgcode/h2>
        <div class="settings-v2-tab-search">
          <TextInputV2
            type="search"
            appearance="base"
            value={list.filter()}
            onInput={(event) => list.onInput(event.currentTarget.value)}
            placeholder={language.t("dialog.model.search.placeholder")}
            spellcheck={false}
            autocorrect="off"
            autocomplete="off"
            autocapitalize="off"
            aria-label={language.t("dialog.model.search.placeholder")}
          @lgcode/>
          <Show when={list.filter()}>
            <IconButtonV2
              type="button"
              variant="ghost-muted"
              size="small"
              class="settings-v2-tab-search-clear"
              icon={<IconV2 name="close" size="large" class="text-v2-icon-icon-muted" @lgcode/>}
              onClick={() => list.clear()}
            @lgcode/>
          <@lgcode/Show>
        <@lgcode/div>
      <@lgcode/div>

      <div class="settings-v2-tab-body settings-v2-models">
        <Show
          when={!list.grouped.loading}
          fallback={
            <div class="settings-v2-models-status">
              {language.t("common.loading")}
              {language.t("common.loading.ellipsis")}
            <@lgcode/div>
          }
        >
          <Show
            when={list.flat().length > 0}
            fallback={
              <div class="settings-v2-models-status">
                <span>{language.t("dialog.model.empty")}<@lgcode/span>
                <Show when={list.filter()}>
                  <span class="settings-v2-models-status-filter">&quot;{list.filter()}&quot;<@lgcode/span>
                <@lgcode/Show>
              <@lgcode/div>
            }
          >
            <For each={list.grouped.latest}>
              {(group) => (
                <div class="settings-v2-section" data-component="settings-models-provider">
                  <div class="settings-v2-models-group-header">
                    <ProviderIcon
                      id={group.category}
                      width={PROVIDER_ICON_SIZE}
                      height={PROVIDER_ICON_SIZE}
                      class="settings-v2-models-provider-icon shrink-0"
                    @lgcode/>
                    <h3 class="settings-v2-section-title">{group.items[0].provider.name}<@lgcode/h3>
                  <@lgcode/div>
                  <SettingsListV2>
                    <For each={group.items}>
                      {(item) => {
                        const key = { providerID: item.provider.id, modelID: item.id }
                        return (
                          <SettingsRowV2 title={item.name} description="">
                            <div>
                              <Switch
                                checked={models.visible(key)}
                                onChange={(checked) => {
                                  models.setVisibility(key, checked)
                                }}
                                hideLabel
                              >
                                {item.name}
                              <@lgcode/Switch>
                            <@lgcode/div>
                          <@lgcode/SettingsRowV2>
                        )
                      }}
                    <@lgcode/For>
                  <@lgcode/SettingsListV2>
                <@lgcode/div>
              )}
            <@lgcode/For>
          <@lgcode/Show>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/>
  )
}
