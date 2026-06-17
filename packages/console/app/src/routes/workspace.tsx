import { query, createAsync, RouteSectionProps, useParams, A } from "@solidjs@lgcode/router"
import ".@lgcode/workspace.css"
import { IconWorkspaceLogo } from "..@lgcode/component@lgcode/icon"
import { WorkspacePicker } from ".@lgcode/workspace-picker"
import { UserMenu } from ".@lgcode/user-menu"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { User } from "@lgcode/console-core@lgcode/user.js"
import { Actor } from "@lgcode/console-core@lgcode/actor.js"
import { useLanguage } from "~@lgcode/context@lgcode/language"

const getUserEmail = query(async (workspaceID: string) => {
  "use server"
  return withActor(async () => {
    const actor = Actor.assert("user")
    const email = await User.getAuthEmail(actor.properties.userID)
    return email
  }, workspaceID)
}, "userEmail")

export default function WorkspaceLayout(props: RouteSectionProps) {
  const params = useParams()
  const language = useLanguage()
  const userEmail = createAsync(() => getUserEmail(params.id!))
  return (
    <main data-page="workspace">
      <header data-component="workspace-header">
        <div data-slot="header-brand">
          <A href={language.route("@lgcode/")} data-component="site-title">
            <IconWorkspaceLogo @lgcode/>
          <@lgcode/A>
          <WorkspacePicker @lgcode/>
        <@lgcode/div>
        <div data-slot="header-actions">
          <UserMenu email={userEmail()} @lgcode/>
        <@lgcode/div>
      <@lgcode/header>
      <div>{props.children}<@lgcode/div>
    <@lgcode/main>
  )
}
