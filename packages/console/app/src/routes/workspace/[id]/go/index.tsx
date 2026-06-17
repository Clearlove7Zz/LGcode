import { createAsync, useParams } from "@solidjs@lgcode/router"
import { Show } from "solid-js"
import { IconGo } from "~@lgcode/component@lgcode/icon"
import { GoReferralSection, queryGoReferral } from "~@lgcode/component@lgcode/go-referral"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { LiteSection, queryLiteSubscription } from ".@lgcode/lite-section"

export default function () {
  const params = useParams()
  const i18n = useI18n()
  const language = useLanguage()
  const referral = createAsync(() => queryGoReferral(params.id!))
  const lite = createAsync(() => queryLiteSubscription(params.id!))

  return (
    <div data-page="workspace-[id]">
      <section data-component="header-section">
        <IconGo @lgcode/>
        <p>
          <span>
            {i18n.t("workspace.lite.banner.beforeLink")}{" "}
            <a target="_blank" href={language.route("@lgcode/docs@lgcode/go")}>
              {i18n.t("common.learnMore")}
            <@lgcode/a>
            .
          <@lgcode/span>
        <@lgcode/p>
      <@lgcode/section>

      <div data-slot="sections">
        <LiteSection lite={lite()} @lgcode/>
        <Show when={referral()} fallback={<section>{i18n.t("workspace.lite.loading")}<@lgcode/section>}>
          {(summary) => <GoReferralSection workspaceID={params.id!} summary={summary()} lite={lite()} @lgcode/>}
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/div>
  )
}
