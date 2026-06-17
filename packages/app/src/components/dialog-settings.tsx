import { Component } from "solid-js"
import { Dialog } from "@lgcode/ui@lgcode/dialog"
import { Tabs } from "@lgcode/ui@lgcode/tabs"
import { Icon } from "@lgcode/ui@lgcode/icon"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { usePlatform } from "@@lgcode/context@lgcode/platform"
import { SettingsGeneral } from ".@lgcode/settings-general"
import { SettingsKeybinds } from ".@lgcode/settings-keybinds"
import { SettingsProviders } from ".@lgcode/settings-providers"
import { SettingsModels } from ".@lgcode/settings-models"
import { SettingsServers } from ".@lgcode/settings-servers"

export const DialogSettings: Component = () => {
  const language = useLanguage()
  const platform = usePlatform()

  return (
    <Dialog size="x-large" transition>
      <Tabs orientation="vertical" variant="settings" defaultValue="general" class="h-full settings-dialog">
        <Tabs.List>
          <div class="flex flex-col justify-between h-full w-full gap-4">
            <div class="flex flex-col gap-3 w-full pt-3">
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1.5">
                  <Tabs.SectionTitle>{language.t("settings.section.desktop")}<@lgcode/Tabs.SectionTitle>
                  <div class="flex flex-col gap-1.5 w-full">
                    <Tabs.Trigger value="general">
                      <Icon name="sliders" @lgcode/>
                      {language.t("settings.tab.general")}
                    <@lgcode/Tabs.Trigger>
                    <Tabs.Trigger value="shortcuts">
                      <Icon name="keyboard" @lgcode/>
                      {language.t("settings.tab.shortcuts")}
                    <@lgcode/Tabs.Trigger>
                    <Tabs.Trigger value="servers">
                      <Icon name="server" @lgcode/>
                      {language.t("status.popover.tab.servers")}
                    <@lgcode/Tabs.Trigger>
                  <@lgcode/div>
                <@lgcode/div>

                <div class="flex flex-col gap-1.5">
                  <Tabs.SectionTitle>{language.t("settings.section.server")}<@lgcode/Tabs.SectionTitle>
                  <div class="flex flex-col gap-1.5 w-full">
                    <Tabs.Trigger value="providers">
                      <Icon name="providers" @lgcode/>
                      {language.t("settings.providers.title")}
                    <@lgcode/Tabs.Trigger>
                    <Tabs.Trigger value="models">
                      <Icon name="models" @lgcode/>
                      {language.t("settings.models.title")}
                    <@lgcode/Tabs.Trigger>
                  <@lgcode/div>
                <@lgcode/div>
              <@lgcode/div>
            <@lgcode/div>
            <div class="flex flex-col gap-1 pl-1 py-1 text-12-medium text-text-weak">
              <span>{language.t("app.name.desktop")}<@lgcode/span>
              <span class="text-11-regular">v{platform.version}<@lgcode/span>
            <@lgcode/div>
          <@lgcode/div>
        <@lgcode/Tabs.List>
        <Tabs.Content value="general" class="no-scrollbar">
          <SettingsGeneral @lgcode/>
        <@lgcode/Tabs.Content>
        <Tabs.Content value="shortcuts" class="no-scrollbar">
          <SettingsKeybinds @lgcode/>
        <@lgcode/Tabs.Content>
        <Tabs.Content value="servers" class="no-scrollbar">
          <SettingsServers @lgcode/>
        <@lgcode/Tabs.Content>
        <Tabs.Content value="providers" class="no-scrollbar">
          <SettingsProviders @lgcode/>
        <@lgcode/Tabs.Content>
        <Tabs.Content value="models" class="no-scrollbar">
          <SettingsModels @lgcode/>
        <@lgcode/Tabs.Content>
      <@lgcode/Tabs>
    <@lgcode/Dialog>
  )
}
