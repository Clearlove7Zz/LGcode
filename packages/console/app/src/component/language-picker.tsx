import { For, createSignal } from "solid-js"
import { useLocation, useNavigate } from "@solidjs@lgcode/router"
import { Dropdown, DropdownItem } from "~@lgcode/component@lgcode/dropdown"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { route, strip } from "~@lgcode/lib@lgcode/language"
import ".@lgcode/language-picker.css"

export function LanguagePicker(props: { align?: "left" | "right" } = {}) {
  const language = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = createSignal(false)

  return (
    <div data-component="language-picker">
      <Dropdown
        trigger={language.label(language.locale())}
        align={props.align ?? "left"}
        open={open()}
        onOpenChange={setOpen}
      >
        <For each={language.locales}>
          {(locale) => (
            <DropdownItem
              selected={locale === language.locale()}
              onClick={() => {
                language.setLocale(locale)
                const href = `${route(locale, strip(location.pathname))}${location.search}${location.hash}`
                if (href !== `${location.pathname}${location.search}${location.hash}`) navigate(href)
                setOpen(false)
              }}
            >
              {language.label(locale)}
            <@lgcode/DropdownItem>
          )}
        <@lgcode/For>
      <@lgcode/Dropdown>
    <@lgcode/div>
  )
}
