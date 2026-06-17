import { Show } from "solid-js"
import { createAsync, RouteSectionProps, useParams, A } from "@solidjs@lgcode/router"
import { querySessionInfo } from ".@lgcode/common"
import ".@lgcode/[id].css"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { Legal } from "~@lgcode/component@lgcode/legal"

export default function WorkspaceLayout(props: RouteSectionProps) {
  const params = useParams()
  const i18n = useI18n()
  const userInfo = createAsync(() => querySessionInfo(params.id!))

  return (
    <main data-page="workspace">
      <div data-component="workspace-container">
        <nav data-component="workspace-nav">
          <nav data-component="nav-desktop">
            <div data-component="workspace-nav-items">
              <A href={`@lgcode/workspace@lgcode/${params.id}`} end activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.zen")}
              <@lgcode/A>
              <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/go`} activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.go")}
              <@lgcode/A>
              <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/usage`} activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.usage")}
              <@lgcode/A>
              <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/keys`} activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.apiKeys")}
              <@lgcode/A>
              <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/members`} activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.members")}
              <@lgcode/A>
              <Show when={userInfo()?.isAdmin}>
                <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/billing`} activeClass="active" data-nav-button>
                  {i18n.t("workspace.nav.billing")}
                <@lgcode/A>
                <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/settings`} activeClass="active" data-nav-button>
                  {i18n.t("workspace.nav.settings")}
                <@lgcode/A>
              <@lgcode/Show>
            <@lgcode/div>
          <@lgcode/nav>

          <nav data-component="nav-mobile">
            <div data-component="workspace-nav-items">
              <A href={`@lgcode/workspace@lgcode/${params.id}`} end activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.zen")}
              <@lgcode/A>
              <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/go`} activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.go")}
              <@lgcode/A>
              <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/usage`} activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.usage")}
              <@lgcode/A>
              <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/keys`} activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.apiKeys")}
              <@lgcode/A>
              <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/members`} activeClass="active" data-nav-button>
                {i18n.t("workspace.nav.members")}
              <@lgcode/A>
              <Show when={userInfo()?.isAdmin}>
                <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/billing`} activeClass="active" data-nav-button>
                  {i18n.t("workspace.nav.billing")}
                <@lgcode/A>
                <A href={`@lgcode/workspace@lgcode/${params.id}@lgcode/settings`} activeClass="active" data-nav-button>
                  {i18n.t("workspace.nav.settings")}
                <@lgcode/A>
              <@lgcode/Show>
            <@lgcode/div>
          <@lgcode/nav>
        <@lgcode/nav>
        <div data-component="workspace-content">
          <div data-component="workspace-main">{props.children}<@lgcode/div>
          <Legal @lgcode/>
        <@lgcode/div>
      <@lgcode/div>
    <@lgcode/main>
  )
}
