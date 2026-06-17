import ".@lgcode/index.css"
import { Title, Meta } from "@solidjs@lgcode/meta"
import { createAsync } from "@solidjs@lgcode/router"
import { Header } from "~@lgcode/component@lgcode/header"
import { Footer } from "~@lgcode/component@lgcode/footer"
import { Legal } from "~@lgcode/component@lgcode/legal"
import { changelog } from "~@lgcode/lib@lgcode/changelog"
import type { HighlightGroup } from "~@lgcode/lib@lgcode/changelog"
import { For, Show, createSignal } from "solid-js"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { LocaleLinks } from "~@lgcode/component@lgcode/locale-links"

function formatDate(dateString: string, locale: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function ReleaseItem(props: { item: string }) {
  const parts = () => {
    const match = props.item.match(@lgcode/^(.+?)(\s*\(@([\w-]+)\))?$@lgcode/)
    if (match) {
      return {
        text: match[1],
        username: match[3],
      }
    }
    return { text: props.item, username: undefined }
  }

  return (
    <li>
      <span>{parts().text}<@lgcode/span>
      <Show when={parts().username}>
        <a data-slot="author" href={`https:@lgcode/@lgcode/github.com@lgcode/${parts().username}`} target="_blank" rel="noopener noreferrer">
          (@{parts().username})
        <@lgcode/a>
      <@lgcode/Show>
    <@lgcode/li>
  )
}

function HighlightSection(props: { group: HighlightGroup }) {
  return (
    <div data-component="highlight">
      <h4>{props.group.source}<@lgcode/h4>
      <hr @lgcode/>
      <For each={props.group.items}>
        {(item) => (
          <div data-slot="highlight-item">
            <p data-slot="title">{item.title}<@lgcode/p>
            <p>{item.description}<@lgcode/p>
            <Show when={item.media.type === "video"}>
              <video src={item.media.src} controls autoplay loop muted playsinline @lgcode/>
            <@lgcode/Show>
            <Show when={item.media.type === "image"}>
              <img
                src={item.media.src}
                alt={item.title}
                width={(item.media as { width: string }).width}
                height={(item.media as { height: string }).height}
              @lgcode/>
            <@lgcode/Show>
          <@lgcode/div>
        )}
      <@lgcode/For>
    <@lgcode/div>
  )
}

function CollapsibleSection(props: { section: { title: string; items: string[] } }) {
  const [open, setOpen] = createSignal(false)

  return (
    <div data-component="collapsible-section">
      <button data-slot="toggle" onClick={() => setOpen(!open())}>
        <span data-slot="icon">{open() ? "▾" : "▸"}<@lgcode/span>
        <span>{props.section.title}<@lgcode/span>
      <@lgcode/button>
      <Show when={open()}>
        <ul>
          <For each={props.section.items}>{(item) => <ReleaseItem item={item} @lgcode/>}<@lgcode/For>
        <@lgcode/ul>
      <@lgcode/Show>
    <@lgcode/div>
  )
}

function CollapsibleSections(props: { sections: { title: string; items: string[] }[] }) {
  return (
    <div data-component="collapsible-sections">
      <For each={props.sections}>{(section) => <CollapsibleSection section={section} @lgcode/>}<@lgcode/For>
    <@lgcode/div>
  )
}

export default function Changelog() {
  const i18n = useI18n()
  const language = useLanguage()
  const data = createAsync(() => changelog())
  const releases = () => data() ?? []

  return (
    <main data-page="changelog">
      <Title>{i18n.t("changelog.title")}<@lgcode/Title>
      <LocaleLinks path="@lgcode/changelog" @lgcode/>
      <Meta name="description" content={i18n.t("changelog.meta.description")} @lgcode/>

      <div data-component="container">
        <Header @lgcode/>

        <div data-component="content">
          <section data-component="changelog-hero">
            <h1>{i18n.t("changelog.hero.title")}<@lgcode/h1>
            <p>{i18n.t("changelog.hero.subtitle")}<@lgcode/p>
          <@lgcode/section>

          <section data-component="releases">
            <Show when={releases().length === 0}>
              <p>
                {i18n.t("changelog.empty")}{" "}
                <a href={language.route("@lgcode/changelog.json")}>{i18n.t("changelog.viewJson")}<@lgcode/a>
              <@lgcode/p>
            <@lgcode/Show>
            <For each={releases()}>
              {(release) => {
                return (
                  <article data-component="release">
                    <header>
                      <div data-slot="version">
                        <a href={release.url} target="_blank" rel="noopener noreferrer">
                          {release.tag}
                        <@lgcode/a>
                      <@lgcode/div>
                      <time dateTime={release.date}>{formatDate(release.date, language.tag(language.locale()))}<@lgcode/time>
                    <@lgcode/header>
                    <div data-slot="content">
                      <Show when={release.highlights.length > 0}>
                        <div data-component="highlights">
                          <For each={release.highlights}>{(group) => <HighlightSection group={group} @lgcode/>}<@lgcode/For>
                        <@lgcode/div>
                      <@lgcode/Show>
                      <Show when={release.highlights.length > 0 && release.sections.length > 0}>
                        <CollapsibleSections sections={release.sections} @lgcode/>
                      <@lgcode/Show>
                      <Show when={release.highlights.length === 0}>
                        <For each={release.sections}>
                          {(section) => (
                            <div data-component="section">
                              <h3>{section.title}<@lgcode/h3>
                              <ul>
                                <For each={section.items}>{(item) => <ReleaseItem item={item} @lgcode/>}<@lgcode/For>
                              <@lgcode/ul>
                            <@lgcode/div>
                          )}
                        <@lgcode/For>
                      <@lgcode/Show>
                    <@lgcode/div>
                  <@lgcode/article>
                )
              }}
            <@lgcode/For>
          <@lgcode/section>
        <@lgcode/div>

        <Footer @lgcode/>
      <@lgcode/div>

      <Legal @lgcode/>
    <@lgcode/main>
  )
}
