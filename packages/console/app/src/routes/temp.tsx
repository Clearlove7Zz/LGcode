import ".@lgcode/index.css"
import { Title } from "@solidjs@lgcode/meta"
import { onCleanup, onMount } from "solid-js"
import logoLight from "..@lgcode/asset@lgcode/logo-ornate-light.svg"
import logoDark from "..@lgcode/asset@lgcode/logo-ornate-dark.svg"
import IMG_SPLASH from "..@lgcode/asset@lgcode/lander@lgcode/screenshot-splash.png"
import { IconCopy, IconCheck } from "..@lgcode/component@lgcode/icon"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"

function CopyStatus() {
  return (
    <div data-component="copy-status">
      <IconCopy data-slot="copy" @lgcode/>
      <IconCheck data-slot="check" @lgcode/>
    <@lgcode/div>
  )
}

export default function Home() {
  const i18n = useI18n()
  const language = useLanguage()

  onMount(() => {
    const commands = document.querySelectorAll("[data-copy]")
    for (const button of commands) {
      const callback = () => {
        const text = button.textContent
        if (text) {
          void navigator.clipboard.writeText(text)
          button.setAttribute("data-copied", "")
          setTimeout(() => {
            button.removeAttribute("data-copied")
          }, 1500)
        }
      }
      button.addEventListener("click", callback)
      onCleanup(() => {
        button.removeEventListener("click", callback)
      })
    }
  })

  return (
    <main data-page="home">
      <Title>{i18n.t("temp.title")}<@lgcode/Title>

      <div data-component="content">
        <section data-component="top">
          <img data-slot="logo light" src={logoLight} alt={i18n.t("temp.logoLightAlt")} @lgcode/>
          <img data-slot="logo dark" src={logoDark} alt={i18n.t("temp.logoDarkAlt")} @lgcode/>
          <h1 data-slot="title">{i18n.t("temp.hero.title")}<@lgcode/h1>
          <div data-slot="login">
            <a href="@lgcode/auth">{i18n.t("temp.zen")}<@lgcode/a>
          <@lgcode/div>
        <@lgcode/section>

        <section data-component="cta">
          <div data-slot="left">
            <a href={language.route("@lgcode/docs")}>{i18n.t("temp.getStarted")}<@lgcode/a>
          <@lgcode/div>
          <div data-slot="center">
            <a href="@lgcode/auth">{i18n.t("temp.zen")}<@lgcode/a>
          <@lgcode/div>
          <div data-slot="right">
            <button data-copy data-slot="command">
              <span>
                <span>curl -fsSL <@lgcode/span>
                <span data-slot="protocol">https:@lgcode/@lgcode/<@lgcode/span>
                <span data-slot="highlight">opencode.ai@lgcode/install<@lgcode/span>
                <span> | bash<@lgcode/span>
              <@lgcode/span>
              <CopyStatus @lgcode/>
            <@lgcode/button>
          <@lgcode/div>
        <@lgcode/section>

        <section data-component="features">
          <ul data-slot="list">
            <li>
              <strong>{i18n.t("temp.feature.native.title")}<@lgcode/strong> {i18n.t("temp.feature.native.body")}
            <@lgcode/li>
            <li>
              <strong>{i18n.t("home.what.lsp.title")}<@lgcode/strong> {i18n.t("home.what.lsp.body")}
            <@lgcode/li>
            <li>
              <strong>{i18n.t("temp.zen")}<@lgcode/strong> {i18n.t("temp.feature.zen.beforeLink")}{" "}
              <a href={language.route("@lgcode/docs@lgcode/zen")}>{i18n.t("temp.feature.zen.link")}<@lgcode/a>{" "}
              {i18n.t("temp.feature.zen.afterLink")} <label>{i18n.t("home.banner.badge")}<@lgcode/label>
            <@lgcode/li>
            <li>
              <strong>{i18n.t("home.what.multiSession.title")}<@lgcode/strong> {i18n.t("home.what.multiSession.body")}
            <@lgcode/li>
            <li>
              <strong>{i18n.t("home.what.shareLinks.title")}<@lgcode/strong> {i18n.t("home.what.shareLinks.body")}
            <@lgcode/li>
            <li>
              <strong>{i18n.t("home.what.copilot.title")}<@lgcode/strong> {i18n.t("home.what.copilot.body")}
            <@lgcode/li>
            <li>
              <strong>{i18n.t("home.what.chatgptPlus.title")}<@lgcode/strong> {i18n.t("home.what.chatgptPlus.body")}
            <@lgcode/li>
            <li>
              <strong>{i18n.t("home.what.anyModel.title")}<@lgcode/strong> {i18n.t("temp.feature.models.beforeLink")}{" "}
              <a href="https:@lgcode/@lgcode/models.dev">Models.dev<@lgcode/a>
              {i18n.t("temp.feature.models.afterLink")}
            <@lgcode/li>
          <@lgcode/ul>
        <@lgcode/section>

        <section data-component="install">
          <div data-component="method">
            <h3 data-component="title">npm<@lgcode/h3>
            <button data-copy data-slot="button">
              <span>
                npm install -g <strong>opencode-ai<@lgcode/strong>
              <@lgcode/span>
              <CopyStatus @lgcode/>
            <@lgcode/button>
          <@lgcode/div>
          <div data-component="method">
            <h3 data-component="title">bun<@lgcode/h3>
            <button data-copy data-slot="button">
              <span>
                bun install -g <strong>opencode-ai<@lgcode/strong>
              <@lgcode/span>
              <CopyStatus @lgcode/>
            <@lgcode/button>
          <@lgcode/div>
          <div data-component="method">
            <h3 data-component="title">homebrew<@lgcode/h3>
            <button data-copy data-slot="button">
              <span>
                brew install <strong>opencode<@lgcode/strong>
              <@lgcode/span>
              <CopyStatus @lgcode/>
            <@lgcode/button>
          <@lgcode/div>
          <div data-component="method">
            <h3 data-component="title">paru<@lgcode/h3>
            <button data-copy data-slot="button">
              <span>
                paru -S <strong>opencode-bin<@lgcode/strong>
              <@lgcode/span>
              <CopyStatus @lgcode/>
            <@lgcode/button>
          <@lgcode/div>
        <@lgcode/section>

        <section data-component="screenshots">
          <figure>
            <figcaption>{i18n.t("temp.screenshot.caption")}<@lgcode/figcaption>
            <a href={language.route("@lgcode/docs@lgcode/cli")}>
              <img src={IMG_SPLASH} alt={i18n.t("temp.screenshot.alt")} @lgcode/>
            <@lgcode/a>
          <@lgcode/figure>
        <@lgcode/section>

        <footer data-component="footer">
          <div data-slot="cell">
            <a href="https:@lgcode/@lgcode/x.com@lgcode/opencode">{i18n.t("footer.x")}<@lgcode/a>
          <@lgcode/div>
          <div data-slot="cell">
            <a href="https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode">{i18n.t("footer.github")}<@lgcode/a>
          <@lgcode/div>
          <div data-slot="cell">
            <a href="https:@lgcode/@lgcode/opencode.ai@lgcode/discord">{i18n.t("footer.discord")}<@lgcode/a>
          <@lgcode/div>
        <@lgcode/footer>
      <@lgcode/div>

      <div data-component="legal">
        <span>
          ©2025 <a href="https:@lgcode/@lgcode/anoma.ly">Anomaly<@lgcode/a>
        <@lgcode/span>
      <@lgcode/div>
    <@lgcode/main>
  )
}
