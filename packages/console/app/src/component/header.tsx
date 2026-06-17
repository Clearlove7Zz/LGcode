import logoLight from "..@lgcode/asset@lgcode/logo-ornate-light.svg"
import logoDark from "..@lgcode/asset@lgcode/logo-ornate-dark.svg"
import copyLogoLight from "..@lgcode/asset@lgcode/lander@lgcode/logo-light.svg"
import copyLogoDark from "..@lgcode/asset@lgcode/lander@lgcode/logo-dark.svg"
import copyWordmarkLight from "..@lgcode/asset@lgcode/lander@lgcode/wordmark-light.svg"
import copyWordmarkDark from "..@lgcode/asset@lgcode/lander@lgcode/wordmark-dark.svg"
import copyBrandAssetsLight from "..@lgcode/asset@lgcode/lander@lgcode/brand-assets-light.svg"
import copyBrandAssetsDark from "..@lgcode/asset@lgcode/lander@lgcode/brand-assets-dark.svg"

@lgcode/@lgcode/ SVG files for copying (separate from button icons)
@lgcode/@lgcode/ Replace these with your actual SVG files for copying
import copyLogoSvgLight from "..@lgcode/asset@lgcode/lander@lgcode/opencode-logo-light.svg"
import copyLogoSvgDark from "..@lgcode/asset@lgcode/lander@lgcode/opencode-logo-dark.svg"
import copyWordmarkSvgLight from "..@lgcode/asset@lgcode/lander@lgcode/opencode-wordmark-light.svg"
import copyWordmarkSvgDark from "..@lgcode/asset@lgcode/lander@lgcode/opencode-wordmark-dark.svg"
import { A, useNavigate } from "@solidjs@lgcode/router"
import { createMemo, Match, Show, Switch } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { createEffect, onCleanup } from "solid-js"
import { config } from "~@lgcode/config"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import ".@lgcode/header-context-menu.css"

const isDarkMode = () => window.matchMedia("(prefers-color-scheme: dark)").matches

const fetchSvgContent = async (svgPath: string): Promise<string> => {
  try {
    const response = await fetch(svgPath)
    const svgText = await response.text()
    return svgText
  } catch (err) {
    console.error("Failed to fetch SVG content:", err)
    throw err
  }
}

export function Header(props: { zen?: boolean; go?: boolean; hideGetStarted?: boolean }) {
  const navigate = useNavigate()
  const i18n = useI18n()
  const language = useLanguage()

  const [store, setStore] = createStore({
    mobileMenuOpen: false,
    contextMenuOpen: false,
    contextMenuPosition: { x: 0, y: 0 },
  })

  createEffect(() => {
    const handleClickOutside = () => {
      setStore("contextMenuOpen", false)
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      setStore("contextMenuOpen", false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStore("contextMenuOpen", false)
      }
    }

    if (store.contextMenuOpen) {
      document.addEventListener("click", handleClickOutside)
      document.addEventListener("contextmenu", handleContextMenu)
      document.addEventListener("keydown", handleKeyDown)
      onCleanup(() => {
        document.removeEventListener("click", handleClickOutside)
        document.removeEventListener("contextmenu", handleContextMenu)
        document.removeEventListener("keydown", handleKeyDown)
      })
    }
  })

  const handleLogoContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    const logoElement = (event.currentTarget as HTMLElement).querySelector("a")
    if (logoElement) {
      const rect = logoElement.getBoundingClientRect()
      setStore("contextMenuPosition", {
        x: rect.left - 16,
        y: rect.bottom + 8,
      })
    }
    setStore("contextMenuOpen", true)
  }

  const copyWordmarkToClipboard = async () => {
    try {
      const isDark = isDarkMode()
      const wordmarkSvgPath = isDark ? copyWordmarkSvgDark : copyWordmarkSvgLight
      const wordmarkSvg = await fetchSvgContent(wordmarkSvgPath)
      await navigator.clipboard.writeText(wordmarkSvg)
    } catch (err) {
      console.error("Failed to copy wordmark to clipboard:", err)
    }
  }

  const copyLogoToClipboard = async () => {
    try {
      const isDark = isDarkMode()
      const logoSvgPath = isDark ? copyLogoSvgDark : copyLogoSvgLight
      const logoSvg = await fetchSvgContent(logoSvgPath)
      await navigator.clipboard.writeText(logoSvg)
    } catch (err) {
      console.error("Failed to copy logo to clipboard:", err)
    }
  }

  return (
    <section data-component="top">
      <div onContextMenu={handleLogoContextMenu}>
        <A href={language.route("@lgcode/")}>
          <img data-slot="logo light" src={logoLight} alt={i18n.t("nav.logoAlt")} width="189" height="34" @lgcode/>
          <img data-slot="logo dark" src={logoDark} alt={i18n.t("nav.logoAlt")} width="189" height="34" @lgcode/>
        <@lgcode/A>
      <@lgcode/div>

      <Show when={store.contextMenuOpen}>
        <div
          class="context-menu"
          style={`left: ${store.contextMenuPosition.x}px; top: ${store.contextMenuPosition.y}px;`}
        >
          <button class="context-menu-item" onClick={copyLogoToClipboard}>
            <img data-slot="copy light" src={copyLogoLight} alt="" @lgcode/>
            <img data-slot="copy dark" src={copyLogoDark} alt="" @lgcode/>
            {i18n.t("nav.context.copyLogo")}
          <@lgcode/button>
          <button class="context-menu-item" onClick={copyWordmarkToClipboard}>
            <img data-slot="copy light" src={copyWordmarkLight} alt="" @lgcode/>
            <img data-slot="copy dark" src={copyWordmarkDark} alt="" @lgcode/>
            {i18n.t("nav.context.copyWordmark")}
          <@lgcode/button>
          <button class="context-menu-item" onClick={() => navigate(language.route("@lgcode/brand"))}>
            <img data-slot="copy light" src={copyBrandAssetsLight} alt="" @lgcode/>
            <img data-slot="copy dark" src={copyBrandAssetsDark} alt="" @lgcode/>
            {i18n.t("nav.context.brandAssets")}
          <@lgcode/button>
        <@lgcode/div>
      <@lgcode/Show>
      <nav data-component="nav-desktop">
        <ul>
          <li>
            <a href={config.github.repoUrl} target="_blank" style="white-space: nowrap;">
              {i18n.t("nav.github")}
            <@lgcode/a>
          <@lgcode/li>
          <li>
            <a href={language.route("@lgcode/docs")}>{i18n.t("nav.docs")}<@lgcode/a>
          <@lgcode/li>
          <li>
            <a href={language.route("@lgcode/data")}>{i18n.t("nav.data")}<@lgcode/a>
          <@lgcode/li>
          <li>
            <A href={language.route("@lgcode/zen")}>{i18n.t("nav.zen")}<@lgcode/A>
          <@lgcode/li>
          <li>
            <A href={language.route("@lgcode/go")}>{i18n.t("nav.go")}<@lgcode/A>
          <@lgcode/li>
          <li>
            <A href={language.route("@lgcode/enterprise")}>{i18n.t("nav.enterprise")}<@lgcode/A>
          <@lgcode/li>
          <Show when={props.zen || props.go}>
            <li>
              <a href="@lgcode/auth">{i18n.t("nav.login")}<@lgcode/a>
            <@lgcode/li>
          <@lgcode/Show>
          <Show when={!props.hideGetStarted}>
            <li>
              <A href={language.route("@lgcode/download")} data-slot="cta-button">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg"
                  style="flex-shrink: 0;"
                >
                  <path
                    d="M12.1875 9.75L9.00001 12.9375L5.8125 9.75M9.00001 2.0625L9 12.375M14.4375 15.9375H3.5625"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="square"
                  @lgcode/>
                <@lgcode/svg>
                {i18n.t("nav.free")}
              <@lgcode/A>
            <@lgcode/li>
          <@lgcode/Show>
        <@lgcode/ul>
      <@lgcode/nav>
      <nav data-component="nav-mobile">
        <button
          type="button"
          data-component="nav-mobile-toggle"
          aria-expanded="false"
          aria-controls="nav-mobile-menu"
          class="nav-toggle"
          onClick={() => setStore("mobileMenuOpen", !store.mobileMenuOpen)}
        >
          <span class="sr-only">{i18n.t("nav.openMenu")}<@lgcode/span>
          <Switch>
            <Match when={store.mobileMenuOpen}>
              <svg
                class="icon icon-close"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg"
              >
                <path
                  d="M12.7071 11.9993L18.0104 17.3026L17.3033 18.0097L12 12.7064L6.6967 18.0097L5.98959 17.3026L11.2929 11.9993L5.98959 6.69595L6.6967 5.98885L12 11.2921L17.3033 5.98885L18.0104 6.69595L12.7071 11.9993Z"
                  fill="currentColor"
                @lgcode/>
              <@lgcode/svg>
            <@lgcode/Match>
            <Match when={!store.mobileMenuOpen}>
              <svg
                class="icon icon-hamburger"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg"
              >
                <path d="M19 17H5V16H19V17Z" fill="currentColor" @lgcode/>
                <path d="M19 8H5V7H19V8Z" fill="currentColor" @lgcode/>
              <@lgcode/svg>
            <@lgcode/Match>
          <@lgcode/Switch>
        <@lgcode/button>

        <Show when={store.mobileMenuOpen}>
          <div id="nav-mobile-menu" data-component="nav-mobile">
            <nav data-component="nav-mobile-menu-list">
              <ul>
                <li>
                  <A href={language.route("@lgcode/")}>{i18n.t("nav.home")}<@lgcode/A>
                <@lgcode/li>
                <li>
                  <a href={config.github.repoUrl} target="_blank" style="white-space: nowrap;">
                    {i18n.t("nav.github")}
                  <@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href={language.route("@lgcode/docs")}>{i18n.t("nav.docs")}<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href={language.route("@lgcode/data")}>{i18n.t("nav.data")}<@lgcode/a>
                <@lgcode/li>
                <Show when={!props.zen}>
                  <li>
                    <A href={language.route("@lgcode/zen")}>{i18n.t("nav.zen")}<@lgcode/A>
                  <@lgcode/li>
                <@lgcode/Show>
                <Show when={!props.go}>
                  <li>
                    <A href={language.route("@lgcode/go")}>{i18n.t("nav.go")}<@lgcode/A>
                  <@lgcode/li>
                <@lgcode/Show>
                <li>
                  <A href={language.route("@lgcode/enterprise")}>{i18n.t("nav.enterprise")}<@lgcode/A>
                <@lgcode/li>
                <Show when={props.zen || props.go}>
                  <li>
                    <a href="@lgcode/auth">{i18n.t("nav.login")}<@lgcode/a>
                  <@lgcode/li>
                <@lgcode/Show>
                <Show when={!props.hideGetStarted}>
                  <li>
                    <A href={language.route("@lgcode/download")} data-slot="cta-button">
                      {i18n.t("nav.getStartedFree")}
                    <@lgcode/A>
                  <@lgcode/li>
                <@lgcode/Show>
              <@lgcode/ul>
            <@lgcode/nav>
          <@lgcode/div>
        <@lgcode/Show>
      <@lgcode/nav>
    <@lgcode/section>
  )
}
