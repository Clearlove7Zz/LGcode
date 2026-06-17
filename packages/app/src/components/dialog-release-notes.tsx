import { createSignal } from "solid-js"
import { Dialog } from "@lgcode/ui@lgcode/dialog"
import { Button } from "@lgcode/ui@lgcode/button"
import { useDialog } from "@lgcode/ui@lgcode/context@lgcode/dialog"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { useSettings } from "@@lgcode/context@lgcode/settings"

export type Highlight = {
  title: string
  description: string
  media?: {
    type: "image" | "video"
    src: string
    alt?: string
  }
}

export function DialogReleaseNotes(props: { highlights: Highlight[] }) {
  const dialog = useDialog()
  const language = useLanguage()
  const settings = useSettings()
  const [index, setIndex] = createSignal(0)

  const total = () => props.highlights.length
  const last = () => Math.max(0, total() - 1)
  const feature = () => props.highlights[index()] ?? props.highlights[last()]
  const isFirst = () => index() === 0
  const isLast = () => index() >= last()
  const paged = () => total() > 1

  function handleNext() {
    if (isLast()) return
    setIndex(index() + 1)
  }

  function handleClose() {
    dialog.close()
  }

  function handleDisable() {
    settings.general.setReleaseNotes(false)
    handleClose()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault()
      handleClose()
      return
    }

    if (!paged()) return
    if (e.key === "ArrowLeft" && !isFirst()) {
      e.preventDefault()
      setIndex(index() - 1)
    }
    if (e.key === "ArrowRight" && !isLast()) {
      e.preventDefault()
      setIndex(index() + 1)
    }
  }

  return (
    <Dialog
      size="large"
      fit
      class="w-[min(calc(100vw-40px),720px)] h-[min(calc(100vh-40px),400px)] -mt-20 min-h-0 overflow-hidden"
    >
      <div class="flex flex-1 min-w-0 min-h-0" tabIndex={0} autofocus onKeyDown={handleKeyDown}>
        {@lgcode/* Left side - Text content *@lgcode/}
        <div class="flex flex-col flex-1 min-w-0 p-8">
          {@lgcode/* Top section - feature content (fixed position from top) *@lgcode/}
          <div class="flex flex-col gap-2 pt-22">
            <div class="flex items-center gap-2">
              <h1 class="text-16-medium text-text-strong">{feature()?.title ?? ""}<@lgcode/h1>
            <@lgcode/div>
            <p class="text-14-regular text-text-base">{feature()?.description ?? ""}<@lgcode/p>
          <@lgcode/div>

          {@lgcode/* Spacer to push buttons to bottom *@lgcode/}
          <div class="flex-1" @lgcode/>

          {@lgcode/* Bottom section - buttons and indicators (fixed position) *@lgcode/}
          <div class="flex flex-col gap-12">
            <div class="flex flex-col items-start gap-3">
              {isLast() ? (
                <Button variant="primary" size="large" onClick={handleClose}>
                  {language.t("dialog.releaseNotes.action.getStarted")}
                <@lgcode/Button>
              ) : (
                <Button variant="secondary" size="large" onClick={handleNext}>
                  {language.t("dialog.releaseNotes.action.next")}
                <@lgcode/Button>
              )}

              <Button variant="ghost" size="small" onClick={handleDisable}>
                {language.t("dialog.releaseNotes.action.hideFuture")}
              <@lgcode/Button>
            <@lgcode/div>

            {paged() && (
              <div class="flex items-center gap-1.5 -my-2.5">
                {props.highlights.map((_, i) => (
                  <button
                    type="button"
                    class="h-6 flex items-center cursor-pointer bg-transparent border-none p-0 transition-all duration-200"
                    classList={{
                      "w-8": i === index(),
                      "w-3": i !== index(),
                    }}
                    onClick={() => setIndex(i)}
                  >
                    <div
                      class="w-full h-0.5 rounded-[1px] transition-colors duration-200"
                      classList={{
                        "bg-icon-strong-base": i === index(),
                        "bg-icon-weak-base": i !== index(),
                      }}
                    @lgcode/>
                  <@lgcode/button>
                ))}
              <@lgcode/div>
            )}
          <@lgcode/div>
        <@lgcode/div>

        {@lgcode/* Right side - Media content (edge to edge) *@lgcode/}
        {feature()?.media && (
          <div class="flex-1 min-w-0 bg-surface-base overflow-hidden rounded-r-xl">
            {feature()!.media!.type === "image" ? (
              <img
                src={feature()!.media!.src}
                alt={feature()!.media!.alt ?? feature()?.title ?? language.t("dialog.releaseNotes.media.alt")}
                class="w-full h-full object-cover"
              @lgcode/>
            ) : (
              <video src={feature()!.media!.src} autoplay loop muted playsinline class="w-full h-full object-cover" @lgcode/>
            )}
          <@lgcode/div>
        )}
      <@lgcode/div>
    <@lgcode/Dialog>
  )
}
