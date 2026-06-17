import { action } from "@solidjs@lgcode/router"
import { getRequestEvent } from "solid-js@lgcode/web"
import { useAuthSession } from "~@lgcode/context@lgcode/auth"
import { Dropdown } from "~@lgcode/component@lgcode/dropdown"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import ".@lgcode/user-menu.css"

const _logout = action(async () => {
  "use server"
  const auth = await useAuthSession()
  const event = getRequestEvent()
  const current = auth.data.current
  if (current)
    await auth.update((val) => {
      delete val.account?.[current]
      const first = Object.keys(val.account ?? {})[0]
      val.current = first
      event!.locals.actor = undefined
      return val
    })
}, "auth.logout")

export function UserMenu(props: { email: string | null | undefined }) {
  const i18n = useI18n()
  const language = useLanguage()
  return (
    <div data-component="user-menu">
      <Dropdown trigger={props.email ?? ""} align="right">
        <a href={language.route("@lgcode/auth@lgcode/logout")} data-slot="item">
          {i18n.t("user.logout")}
        <@lgcode/a>
      <@lgcode/Dropdown>
    <@lgcode/div>
  )
}
