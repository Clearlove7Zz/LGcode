import ".@lgcode/index.css"
import { Title, Meta } from "@solidjs@lgcode/meta"
import { Header } from "~@lgcode/component@lgcode/header"
import { Footer } from "~@lgcode/component@lgcode/footer"
import { Legal } from "~@lgcode/component@lgcode/legal"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { LocaleLinks } from "~@lgcode/component@lgcode/locale-links"
import previewLogoLight from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/preview-opencode-logo-light.png"
import previewLogoDark from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/preview-opencode-logo-dark.png"
import previewLogoLightSquare from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/preview-opencode-logo-light-square.png"
import previewLogoDarkSquare from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/preview-opencode-logo-dark-square.png"
import previewWordmarkLight from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/preview-opencode-wordmark-light.png"
import previewWordmarkDark from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/preview-opencode-wordmark-dark.png"
import previewWordmarkSimpleLight from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/preview-opencode-wordmark-simple-light.png"
import previewWordmarkSimpleDark from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/preview-opencode-wordmark-simple-dark.png"
import logoLightPng from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-logo-light.png"
import logoDarkPng from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-logo-dark.png"
import logoLightSquarePng from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-logo-light-square.png"
import logoDarkSquarePng from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-logo-dark-square.png"
import wordmarkLightPng from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-wordmark-light.png"
import wordmarkDarkPng from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-wordmark-dark.png"
import wordmarkSimpleLightPng from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-wordmark-simple-light.png"
import wordmarkSimpleDarkPng from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-wordmark-simple-dark.png"
import logoLightSvg from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-logo-light.svg"
import logoDarkSvg from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-logo-dark.svg"
import logoLightSquareSvg from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-logo-light-square.svg"
import logoDarkSquareSvg from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-logo-dark-square.svg"
import wordmarkLightSvg from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-wordmark-light.svg"
import wordmarkDarkSvg from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-wordmark-dark.svg"
import wordmarkSimpleLightSvg from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-wordmark-simple-light.svg"
import wordmarkSimpleDarkSvg from "..@lgcode/..@lgcode/asset@lgcode/brand@lgcode/opencode-wordmark-simple-dark.svg"
const brandAssets = "@lgcode/opencode-brand-assets.zip"

export default function Brand() {
  const i18n = useI18n()
  const alt = i18n.t("brand.meta.description")
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download failed:", error)
      const link = document.createElement("a")
      link.href = url
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <main data-page="enterprise">
      <Title>{i18n.t("brand.title")}<@lgcode/Title>
      <LocaleLinks path="@lgcode/brand" @lgcode/>
      <Meta name="description" content={i18n.t("brand.meta.description")} @lgcode/>
      <div data-component="container">
        <Header @lgcode/>

        <div data-component="content">
          <section data-component="brand-content">
            <h1>{i18n.t("brand.heading")}<@lgcode/h1>
            <p>{i18n.t("brand.subtitle")}<@lgcode/p>
            <button
              data-component="download-button"
              onClick={() => downloadFile(brandAssets, "opencode-brand-assets.zip")}
            >
              {i18n.t("brand.downloadAll")}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                <path
                  d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="square"
                @lgcode/>
              <@lgcode/svg>
            <@lgcode/button>

            <div data-component="brand-grid">
              <div>
                <img src={previewLogoLight} alt={alt} @lgcode/>
                <div data-component="actions">
                  <button onClick={() => downloadFile(logoLightPng, "opencode-logo-light.png")}>
                    PNG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                  <button onClick={() => downloadFile(logoLightSvg, "opencode-logo-light.svg")}>
                    SVG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                <@lgcode/div>
              <@lgcode/div>
              <div>
                <img src={previewLogoDark} alt={alt} @lgcode/>
                <div data-component="actions">
                  <button onClick={() => downloadFile(logoDarkPng, "opencode-logo-dark.png")}>
                    PNG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                  <button onClick={() => downloadFile(logoDarkSvg, "opencode-logo-dark.svg")}>
                    SVG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                <@lgcode/div>
              <@lgcode/div>
              <div>
                <img src={previewLogoLightSquare} alt={alt} @lgcode/>
                <div data-component="actions">
                  <button onClick={() => downloadFile(logoLightSquarePng, "opencode-logo-light-square.png")}>
                    PNG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                  <button onClick={() => downloadFile(logoLightSquareSvg, "opencode-logo-light-square.svg")}>
                    SVG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                <@lgcode/div>
              <@lgcode/div>
              <div>
                <img src={previewLogoDarkSquare} alt={alt} @lgcode/>
                <div data-component="actions">
                  <button onClick={() => downloadFile(logoDarkSquarePng, "opencode-logo-dark-square.png")}>
                    PNG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                  <button onClick={() => downloadFile(logoDarkSquareSvg, "opencode-logo-dark-square.svg")}>
                    SVG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                <@lgcode/div>
              <@lgcode/div>
              <div>
                <img src={previewWordmarkLight} alt={alt} @lgcode/>
                <div data-component="actions">
                  <button onClick={() => downloadFile(wordmarkLightPng, "opencode-wordmark-light.png")}>
                    PNG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                  <button onClick={() => downloadFile(wordmarkLightSvg, "opencode-wordmark-light.svg")}>
                    SVG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                <@lgcode/div>
              <@lgcode/div>
              <div>
                <img src={previewWordmarkDark} alt={alt} @lgcode/>
                <div data-component="actions">
                  <button onClick={() => downloadFile(wordmarkDarkPng, "opencode-wordmark-dark.png")}>
                    PNG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                  <button onClick={() => downloadFile(wordmarkDarkSvg, "opencode-wordmark-dark.svg")}>
                    SVG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                <@lgcode/div>
              <@lgcode/div>
              <div>
                <img src={previewWordmarkSimpleLight} alt={alt} @lgcode/>
                <div data-component="actions">
                  <button onClick={() => downloadFile(wordmarkSimpleLightPng, "opencode-wordmark-simple-light.png")}>
                    PNG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                  <button onClick={() => downloadFile(wordmarkSimpleLightSvg, "opencode-wordmark-simple-light.svg")}>
                    SVG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                <@lgcode/div>
              <@lgcode/div>
              <div>
                <img src={previewWordmarkSimpleDark} alt={alt} @lgcode/>
                <div data-component="actions">
                  <button onClick={() => downloadFile(wordmarkSimpleDarkPng, "opencode-wordmark-simple-dark.png")}>
                    PNG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                  <button onClick={() => downloadFile(wordmarkSimpleDarkSvg, "opencode-wordmark-simple-dark.svg")}>
                    SVG
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg">
                      <path
                        d="M13.9583 10.6247L10 14.583L6.04167 10.6247M10 2.08301V13.958M16.25 17.9163H3.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="square"
                      @lgcode/>
                    <@lgcode/svg>
                  <@lgcode/button>
                <@lgcode/div>
              <@lgcode/div>
            <@lgcode/div>
          <@lgcode/section>
        <@lgcode/div>
        <Footer @lgcode/>
      <@lgcode/div>
      <Legal @lgcode/>
    <@lgcode/main>
  )
}
