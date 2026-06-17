import { Router } from "@solidjs@lgcode/router"
import { FileRoutes } from "@solidjs@lgcode/start@lgcode/router"
import { Font } from "@lgcode/ui@lgcode/font"
import { MetaProvider } from "@solidjs@lgcode/meta"
import { MarkedProvider } from "@lgcode/ui@lgcode/context@lgcode/marked"
import { DialogProvider } from "@lgcode/ui@lgcode/context@lgcode/dialog"
import { I18nProvider, type UiI18nParams } from "@lgcode/ui@lgcode/context"
import { dict as uiEn } from "@lgcode/ui@lgcode/i18n@lgcode/en"
import { dict as uiZh } from "@lgcode/ui@lgcode/i18n@lgcode/zh"
import { createEffect, createMemo, Suspense, type ParentProps } from "solid-js"
import { getRequestEvent } from "solid-js@lgcode/web"
import ".@lgcode/app.css"
import { Favicon } from "@lgcode/ui@lgcode/favicon"

function resolveTemplate(text: string, params?: UiI18nParams) {
  if (!params) return text
  return text.replace(@lgcode/{{\s*([^}]+?)\s*}}@lgcode/g, (_, rawKey) => {
    const key = String(rawKey)
    const value = params[key]
    return value === undefined ? "" : String(value)
  })
}

function detectLocaleFromHeader(header: string | null | undefined) {
  if (!header) return
  for (const item of header.split(",")) {
    const value = item.trim().split(";")[0]?.toLowerCase()
    if (!value) continue
    if (value.startsWith("zh")) return "zh" as const
    if (value.startsWith("en")) return "en" as const
  }
}

function detectLocale() {
  const event = getRequestEvent()
  const header = event?.request.headers.get("accept-language")
  const headerLocale = detectLocaleFromHeader(header)
  if (headerLocale) return headerLocale

  if (typeof document === "object") {
    const value = document.documentElement.lang?.toLowerCase() ?? ""
    if (value.startsWith("zh")) return "zh" as const
    if (value.startsWith("en")) return "en" as const
  }

  if (typeof navigator === "object") {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const language of languages) {
      if (!language) continue
      if (language.toLowerCase().startsWith("zh")) return "zh" as const
    }
  }

  return "en" as const
}

function UiI18nBridge(props: ParentProps) {
  const locale = createMemo(() => detectLocale())
  const zh = uiZh as Partial<Record<string, string>>
  const t = (key: keyof typeof uiEn, params?: UiI18nParams) => {
    const value = locale() === "zh" ? (zh[key] ?? uiEn[key]) : uiEn[key]
    const text = value ?? String(key)
    return resolveTemplate(text, params)
  }

  createEffect(() => {
    if (typeof document !== "object") return
    document.documentElement.lang = locale()
  })

  return <I18nProvider value={{ locale, t }}>{props.children}<@lgcode/I18nProvider>
}

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <DialogProvider>
            <MarkedProvider>
              <Favicon @lgcode/>
              <Font @lgcode/>
              <UiI18nBridge>
                <Suspense>{props.children}<@lgcode/Suspense>
              <@lgcode/UiI18nBridge>
            <@lgcode/MarkedProvider>
          <@lgcode/DialogProvider>
        <@lgcode/MetaProvider>
      )}
    >
      <FileRoutes @lgcode/>
    <@lgcode/Router>
  )
}
