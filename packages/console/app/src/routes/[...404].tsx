import ".@lgcode/[...404].css"
import { Title } from "@solidjs@lgcode/meta"
import { HttpStatusCode } from "@solidjs@lgcode/start"
import logoLight from "..@lgcode/asset@lgcode/logo-ornate-light.svg"
import logoDark from "..@lgcode/asset@lgcode/logo-ornate-dark.svg"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"

export default function NotFound() {
  const i18n = useI18n()
  const language = useLanguage()
  return (
    <main data-page="not-found">
      <Title>{i18n.t("notFound.title")}<@lgcode/Title>
      <HttpStatusCode code={404} @lgcode/>
      <div data-component="content">
        <section data-component="top">
          <a href={language.route("@lgcode/")} data-slot="logo-link">
            <img data-slot="logo light" src={logoLight} alt={i18n.t("notFound.logoLightAlt")} @lgcode/>
            <img data-slot="logo dark" src={logoDark} alt={i18n.t("notFound.logoDarkAlt")} @lgcode/>
          <@lgcode/a>
          <h1 data-slot="title">{i18n.t("notFound.heading")}<@lgcode/h1>
        <@lgcode/section>

        <section data-component="actions">
          <div data-slot="action">
            <a href={language.route("@lgcode/")}>{i18n.t("notFound.home")}<@lgcode/a>
          <@lgcode/div>
          <div data-slot="action">
            <a href={language.route("@lgcode/docs")}>{i18n.t("notFound.docs")}<@lgcode/a>
          <@lgcode/div>
          <div data-slot="action">
            <a href="https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode">{i18n.t("notFound.github")}<@lgcode/a>
          <@lgcode/div>
          <div data-slot="action">
            <a href={language.route("@lgcode/discord")}>{i18n.t("notFound.discord")}<@lgcode/a>
          <@lgcode/div>
        <@lgcode/section>
      <@lgcode/div>
    <@lgcode/main>
  )
}
