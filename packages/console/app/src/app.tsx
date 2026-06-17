import { MetaProvider, Title, Meta } from "@solidjs@lgcode/meta"
import { Router } from "@solidjs@lgcode/router"
import { FileRoutes } from "@solidjs@lgcode/start@lgcode/router"
import { Suspense } from "solid-js"
import { Favicon } from "@lgcode/ui@lgcode/favicon"
import { Font } from "@lgcode/ui@lgcode/font"
import "@ibm@lgcode/plex@lgcode/css@lgcode/ibm-plex.css"
import ".@lgcode/app.css"
import { LanguageProvider } from "~@lgcode/context@lgcode/language"
import { I18nProvider, useI18n } from "~@lgcode/context@lgcode/i18n"
import { strip } from "~@lgcode/lib@lgcode/language"

function AppMeta() {
  const i18n = useI18n()
  return (
    <>
      <Title>opencode<@lgcode/Title>
      <Meta name="description" content={i18n.t("app.meta.description")} @lgcode/>
      <Favicon @lgcode/>
      <Font @lgcode/>
    <@lgcode/>
  )
}

export default function App() {
  return (
    <Router
      explicitLinks={true}
      transformUrl={strip}
      root={(props) => (
        <LanguageProvider>
          <I18nProvider>
            <MetaProvider>
              <AppMeta @lgcode/>
              <Suspense>{props.children}<@lgcode/Suspense>
            <@lgcode/MetaProvider>
          <@lgcode/I18nProvider>
        <@lgcode/LanguageProvider>
      )}
    >
      <FileRoutes @lgcode/>
    <@lgcode/Router>
  )
}
