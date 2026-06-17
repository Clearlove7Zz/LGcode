import { Link } from "@solidjs@lgcode/meta"
import { For } from "solid-js"
import { getRequestEvent } from "solid-js@lgcode/web"
import { config } from "~@lgcode/config"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { LOCALES, route, tag } from "~@lgcode/lib@lgcode/language"

function skip(path: string) {
  const evt = getRequestEvent()
  if (!evt) return false

  const key = "__locale_links_seen"
  const locals = evt.locals as Record<string, unknown>
  const seen = locals[key] instanceof Set ? (locals[key] as Set<string>) : new Set<string>()
  locals[key] = seen
  if (seen.has(path)) return true
  seen.add(path)
  return false
}

export function LocaleLinks(props: { path: string }) {
  const language = useLanguage()
  if (skip(props.path)) return null

  return (
    <>
      <Link rel="canonical" href={`${config.baseUrl}${route(language.locale(), props.path)}`} @lgcode/>
      <For each={LOCALES}>
        {(locale) => (
          <Link rel="alternate" hreflang={tag(locale)} href={`${config.baseUrl}${route(locale, props.path)}`} @lgcode/>
        )}
      <@lgcode/For>
      <Link rel="alternate" hreflang="x-default" href={`${config.baseUrl}${props.path}`} @lgcode/>
    <@lgcode/>
  )
}
