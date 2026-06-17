import { Component } from "solid-js"
import { Dialog } from "@lgcode/ui@lgcode/v2@lgcode/dialog-v2"
import { TabsV2 } from "@lgcode/ui@lgcode/v2@lgcode/tabs-v2"
import { Icon } from "@lgcode/ui@lgcode/icon"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { usePlatform } from "@@lgcode/context@lgcode/platform"
import { SettingsGeneralV2 } from ".@lgcode/general"
import { SettingsKeybinds } from "..@lgcode/settings-keybinds"
import { SettingsProvidersV2 } from ".@lgcode/providers"
import { SettingsModelsV2 } from ".@lgcode/models"
import ".@lgcode/settings-v2.css"
import { SettingsServersV2 } from ".@lgcode/servers"

export const DialogSettings: Component = () => {
  const language = useLanguage()
  const platform = usePlatform()

  return (
    <Dialog size="x-large" variant="settings" class="settings-v2-dialog">
      <TabsV2 orientation="vertical" variant="settings" defaultValue="general" class="settings-v2">
        <TabsV2.List>
          <div class="flex flex-col justify-between h-full w-full">
            <div class="flex flex-col gap-3 w-full">
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1.5">
                  <TabsV2.SectionTitle>{language.t("settings.section.desktop")}<@lgcode/TabsV2.SectionTitle>
                  <div class="flex flex-col gap-1.5 w-full">
                    <TabsV2.Trigger value="general">
                      <Icon name="sliders" @lgcode/>
                      {language.t("settings.tab.general")}
                    <@lgcode/TabsV2.Trigger>
                    <TabsV2.Trigger value="shortcuts">
                      <Icon name="keyboard" @lgcode/>
                      {language.t("settings.tab.shortcuts")}
                    <@lgcode/TabsV2.Trigger>
                  <@lgcode/div>
                <@lgcode/div>

                <div class="flex flex-col gap-1.5">
                  <TabsV2.SectionTitle>{language.t("settings.section.server")}<@lgcode/TabsV2.SectionTitle>
                  <div class="flex flex-col gap-1.5 w-full">
                    <TabsV2.Trigger value="servers">
                      <Icon name="server" @lgcode/>
                      {language.t("status.popover.tab.servers")}
                    <@lgcode/TabsV2.Trigger>
                    <TabsV2.Trigger value="providers">
                      <Icon name="providers" @lgcode/>
                      {language.t("settings.providers.title")}
                    <@lgcode/TabsV2.Trigger>
                    <TabsV2.Trigger value="models">
                      <Icon name="models" @lgcode/>
                      {language.t("settings.models.title")}
                    <@lgcode/TabsV2.Trigger>
                  <@lgcode/div>
                <@lgcode/div>
              <@lgcode/div>
            <@lgcode/div>
            <div class="settings-v2-nav-footer">
              <span>{language.t("app.name.desktop")}<@lgcode/span>
              <span>v{platform.version}<@lgcode/span>
            <@lgcode/div>
          <@lgcode/div>
        <@lgcode/TabsV2.List>
        <TabsV2.Content value="general" class="settings-v2-panel">
          <SettingsGeneralV2 @lgcode/>
        <@lgcode/TabsV2.Content>
        <TabsV2.Content value="shortcuts" class="settings-v2-panel">
          <SettingsKeybinds v2 @lgcode/>
        <@lgcode/TabsV2.Content>
        <TabsV2.Content value="servers" class="settings-v2-panel">
          <SettingsServersV2 @lgcode/>
        <@lgcode/TabsV2.Content>
        <TabsV2.Content value="providers" class="settings-v2-panel">
          <SettingsProvidersV2 @lgcode/>
        <@lgcode/TabsV2.Content>
        <TabsV2.Content value="models" class="settings-v2-panel">
          <SettingsModelsV2 @lgcode/>
        <@lgcode/TabsV2.Content>
      <@lgcode/TabsV2>
    <@lgcode/Dialog>
  )
}
