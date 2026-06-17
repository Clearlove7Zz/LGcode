import { Button } from "@lgcode/ui@lgcode/button"
import { useDialog } from "@lgcode/ui@lgcode/context@lgcode/dialog"
import { Dialog } from "@lgcode/ui@lgcode/dialog"
import { TextField } from "@lgcode/ui@lgcode/text-field"
import { useMutation } from "@tanstack@lgcode/solid-query"
import { Icon } from "@lgcode/ui@lgcode/icon"
import { createMemo, For, Show } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { type LocalProject, getAvatarColors } from "@@lgcode/context@lgcode/layout"
import { getFilename } from "@lgcode/core@lgcode/util@lgcode/path"
import { Avatar } from "@lgcode/ui@lgcode/avatar"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { getProjectAvatarSource } from "@@lgcode/pages@lgcode/layout@lgcode/helpers"
import { ServerConnection } from "@@lgcode/context@lgcode/server"
import { useGlobal } from "@@lgcode/context@lgcode/global"

const AVATAR_COLOR_KEYS = ["pink", "mint", "orange", "purple", "cyan", "lime"] as const

export function DialogEditProject(props: { project: LocalProject; server: ServerConnection.Any }) {
  const dialog = useDialog()
  const global = useGlobal()
  const language = useLanguage()
  const serverCtx = createMemo(() => global.createServerCtx(props.server))
  const serverSDK = () => serverCtx().sdk
  const serverSync = () => serverCtx().sync

  const folderName = createMemo(() => getFilename(props.project.worktree))
  const defaultName = createMemo(() => props.project.name || folderName())

  const [store, setStore] = createStore({
    name: defaultName(),
    color: props.project.icon?.color,
    iconOverride: props.project.icon?.override,
    startup: props.project.commands?.start ?? "",
    dragOver: false,
    iconHover: false,
  })

  let iconInput: HTMLInputElement | undefined

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image@lgcode/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setStore("iconOverride", e.target?.result as string)
      setStore("iconHover", false)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setStore("dragOver", false)
    const file = e.dataTransfer?.files[0]
    if (file) handleFileSelect(file)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setStore("dragOver", true)
  }

  function handleDragLeave() {
    setStore("dragOver", false)
  }

  function handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) handleFileSelect(file)
  }

  function clearIcon() {
    setStore("iconOverride", "")
  }

  const saveMutation = useMutation(() => ({
    mutationFn: async () => {
      const name = store.name.trim() === folderName() ? "" : store.name.trim()
      const start = store.startup.trim()

      if (props.project.id && props.project.id !== "global") {
        await serverSDK().client.project.update({
          projectID: props.project.id,
          directory: props.project.worktree,
          name,
          icon: { color: store.color || "", override: store.iconOverride || "" },
          commands: { start },
        })
        serverSync().project.icon(props.project.worktree, store.iconOverride || undefined)
        dialog.close()
        return
      }

      serverSync().project.meta(props.project.worktree, {
        name,
        icon: { color: store.color || undefined, override: store.iconOverride || undefined },
        commands: { start: start || undefined },
      })
      dialog.close()
    },
  }))

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (saveMutation.isPending) return
    saveMutation.mutate()
  }

  return (
    <Dialog title={language.t("dialog.project.edit.title")} class="w-full max-w-[480px] mx-auto">
      <form onSubmit={handleSubmit} class="flex flex-col gap-6 p-6 pt-0">
        <div class="flex flex-col gap-4">
          <TextField
            autofocus
            type="text"
            label={language.t("dialog.project.edit.name")}
            placeholder={folderName()}
            value={store.name}
            onChange={(v) => setStore("name", v)}
          @lgcode/>

          <div class="flex flex-col gap-2">
            <label class="text-12-medium text-text-weak">{language.t("dialog.project.edit.icon")}<@lgcode/label>
            <div class="flex gap-3 items-start">
              <div
                class="relative"
                onMouseEnter={() => setStore("iconHover", true)}
                onMouseLeave={() => setStore("iconHover", false)}
              >
                <div
                  class="relative size-16 rounded-md transition-colors cursor-pointer"
                  classList={{
                    "border-text-interactive-base bg-surface-info-base@lgcode/20": store.dragOver,
                    "border-border-base hover:border-border-strong": !store.dragOver,
                    "overflow-hidden": !!store.iconOverride,
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => {
                    if (store.iconOverride && store.iconHover) {
                      clearIcon()
                    } else {
                      iconInput?.click()
                    }
                  }}
                >
                  <Show
                    when={getProjectAvatarSource(props.project.id, {
                      color: store.color,
                      url: props.project.icon?.url,
                      override: store.iconOverride,
                    })}
                    fallback={
                      <div class="size-full flex items-center justify-center">
                        <Avatar
                          fallback={store.name || defaultName()}
                          {...getAvatarColors(store.color)}
                          class="size-full text-[32px]"
                        @lgcode/>
                      <@lgcode/div>
                    }
                  >
                    {(src) => (
                      <img
                        src={src()}
                        alt={language.t("dialog.project.edit.icon.alt")}
                        class="size-full object-cover"
                      @lgcode/>
                    )}
                  <@lgcode/Show>
                <@lgcode/div>
                <div
                  class="absolute inset-0 size-16 bg-surface-raised-stronger-non-alpha@lgcode/90 rounded-[6px] z-10 pointer-events-none flex items-center justify-center transition-opacity"
                  classList={{
                    "opacity-100": store.iconHover && !store.iconOverride,
                    "opacity-0": !(store.iconHover && !store.iconOverride),
                  }}
                >
                  <Icon name="cloud-upload" size="large" class="text-icon-on-interactive-base drop-shadow-sm" @lgcode/>
                <@lgcode/div>
                <div
                  class="absolute inset-0 size-16 bg-surface-raised-stronger-non-alpha@lgcode/90 rounded-[6px] z-10 pointer-events-none flex items-center justify-center transition-opacity"
                  classList={{
                    "opacity-100": store.iconHover && !!store.iconOverride,
                    "opacity-0": !(store.iconHover && !!store.iconOverride),
                  }}
                >
                  <Icon name="trash" size="large" class="text-icon-on-interactive-base drop-shadow-sm" @lgcode/>
                <@lgcode/div>
              <@lgcode/div>
              <input
                id="icon-upload"
                ref={(el) => {
                  iconInput = el
                }}
                type="file"
                accept="image@lgcode/*"
                class="hidden"
                onChange={handleInputChange}
              @lgcode/>
              <div class="flex flex-col gap-1.5 text-12-regular text-text-weak self-center">
                <span>{language.t("dialog.project.edit.icon.hint")}<@lgcode/span>
                <span>{language.t("dialog.project.edit.icon.recommended")}<@lgcode/span>
              <@lgcode/div>
            <@lgcode/div>
          <@lgcode/div>

          <Show when={!store.iconOverride}>
            <div class="flex flex-col gap-2">
              <label class="text-12-medium text-text-weak">{language.t("dialog.project.edit.color")}<@lgcode/label>
              <div class="flex gap-1.5">
                <For each={AVATAR_COLOR_KEYS}>
                  {(color) => (
                    <button
                      type="button"
                      aria-label={language.t("dialog.project.edit.color.select", { color })}
                      aria-pressed={store.color === color}
                      classList={{
                        "flex items-center justify-center size-10 p-0.5 rounded-lg overflow-hidden transition-colors cursor-default": true,
                        "bg-transparent border-2 border-icon-strong-base hover:bg-surface-base-hover":
                          store.color === color,
                        "bg-transparent border border-transparent hover:bg-surface-base-hover hover:border-border-weak-base":
                          store.color !== color,
                      }}
                      onClick={() => {
                        if (store.color === color && !props.project.icon?.url) return
                        setStore("color", store.color === color ? undefined : color)
                      }}
                    >
                      <Avatar
                        fallback={store.name || defaultName()}
                        {...getAvatarColors(color)}
                        class="size-full rounded"
                      @lgcode/>
                    <@lgcode/button>
                  )}
                <@lgcode/For>
              <@lgcode/div>
            <@lgcode/div>
          <@lgcode/Show>

          <TextField
            multiline
            label={language.t("dialog.project.edit.worktree.startup")}
            description={language.t("dialog.project.edit.worktree.startup.description")}
            placeholder={language.t("dialog.project.edit.worktree.startup.placeholder")}
            value={store.startup}
            onChange={(v) => setStore("startup", v)}
            spellcheck={false}
            class="max-h-14 w-full overflow-y-auto font-mono text-xs"
          @lgcode/>
        <@lgcode/div>

        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="large" onClick={() => dialog.close()}>
            {language.t("common.cancel")}
          <@lgcode/Button>
          <Button type="submit" variant="primary" size="large" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? language.t("common.saving") : language.t("common.save")}
          <@lgcode/Button>
        <@lgcode/div>
      <@lgcode/form>
    <@lgcode/Dialog>
  )
}
