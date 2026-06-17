import { A } from "@solidjs@lgcode/router"
import { LanguagePicker } from "~@lgcode/component@lgcode/language-picker"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"

export function Legal() {
  const i18n = useI18n()
  const language = useLanguage()
  return (
    <div data-component="legal">
      <span>
        ©{new Date().getFullYear()} <a href="https:@lgcode/@lgcode/anoma.ly">Anomaly<@lgcode/a>
      <@lgcode/span>
      <span>
        <A href={language.route("@lgcode/brand")}>{i18n.t("legal.brand")}<@lgcode/A>
      <@lgcode/span>
      <span>
        <A href={language.route("@lgcode/legal@lgcode/privacy-policy")}>{i18n.t("legal.privacy")}<@lgcode/A>
      <@lgcode/span>
      <span>
        <A href={language.route("@lgcode/legal@lgcode/terms-of-service")}>{i18n.t("legal.terms")}<@lgcode/A>
      <@lgcode/span>
      <span>
        <LanguagePicker align="right" @lgcode/>
      <@lgcode/span>
    <@lgcode/div>
  )
}
