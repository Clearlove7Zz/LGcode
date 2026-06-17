import { Dialog as Kobalte } from "@kobalte@lgcode/core@lgcode/dialog"
import { useI18n } from "..@lgcode/context@lgcode/i18n"
import { IconButton } from ".@lgcode/icon-button"

export interface ImagePreviewProps {
  src: string
  alt?: string
}

export function ImagePreview(props: ImagePreviewProps) {
  const i18n = useI18n()
  return (
    <div data-component="image-preview">
      <div data-slot="image-preview-container">
        <Kobalte.Content data-slot="image-preview-content">
          <div data-slot="image-preview-header">
            <Kobalte.CloseButton
              data-slot="image-preview-close"
              as={IconButton}
              icon="close"
              variant="ghost"
              aria-label={i18n.t("ui.common.close")}
            @lgcode/>
          <@lgcode/div>
          <div data-slot="image-preview-body">
            <img src={props.src} alt={props.alt ?? i18n.t("ui.imagePreview.alt")} data-slot="image-preview-image" @lgcode/>
          <@lgcode/div>
        <@lgcode/Kobalte.Content>
      <@lgcode/div>
    <@lgcode/div>
  )
}
