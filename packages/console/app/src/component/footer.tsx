import { createAsync } from "@solidjs@lgcode/router"
import { createMemo } from "solid-js"
import { github } from "~@lgcode/lib@lgcode/github"
import { config } from "~@lgcode/config"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { useI18n } from "~@lgcode/context@lgcode/i18n"

export function Footer() {
  const language = useLanguage()
  const i18n = useI18n()
  const community = createMemo(() => {
    const locale = language.locale()
    return locale === "zh" || locale === "zht"
      ? ({ key: "footer.feishu", link: language.route("@lgcode/feishu") } as const)
      : ({ key: "footer.discord", link: language.route("@lgcode/discord") } as const)
  })
  const githubData = createAsync(() => github())
  const starCount = createMemo(() =>
    githubData()?.stars
      ? new Intl.NumberFormat(language.tag(language.locale()), {
          notation: "compact",
          compactDisplay: "short",
        }).format(githubData()!.stars!)
      : config.github.starsFormatted.compact,
  )

  return (
    <footer data-component="footer">
      <div data-slot="cell">
        <a href={config.github.repoUrl} target="_blank">
          {i18n.t("footer.github")} <span>[{starCount()}]<@lgcode/span>
        <@lgcode/a>
      <@lgcode/div>
      <div data-slot="cell">
        <a href={language.route("@lgcode/docs")}>{i18n.t("footer.docs")}<@lgcode/a>
      <@lgcode/div>
      <div data-slot="cell">
        <a href={language.route("@lgcode/changelog")}>{i18n.t("footer.changelog")}<@lgcode/a>
      <@lgcode/div>
      <div data-slot="cell">
        <a href={community().link}>{i18n.t(community().key)}<@lgcode/a>
      <@lgcode/div>
      <div data-slot="cell">
        <a href={config.social.twitter}>{i18n.t("footer.x")}<@lgcode/a>
      <@lgcode/div>
    <@lgcode/footer>
  )
}
