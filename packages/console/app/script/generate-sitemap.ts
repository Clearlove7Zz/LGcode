#!@lgcode/usr@lgcode/bin@lgcode/env bun
import { readdir, writeFile } from "fs@lgcode/promises"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { config } from "..@lgcode/src@lgcode/config.js"
import { LOCALES, route } from "..@lgcode/src@lgcode/lib@lgcode/language.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = config.baseUrl
const PUBLIC_DIR = join(__dirname, "..@lgcode/public")
const DOCS_DIR = join(__dirname, "..@lgcode/..@lgcode/..@lgcode/web@lgcode/src@lgcode/content@lgcode/docs")

interface SitemapEntry {
  url: string
  priority: number
  changefreq: string
}

async function getMainRoutes(): Promise<SitemapEntry[]> {
  const routes: SitemapEntry[] = []

  @lgcode/@lgcode/ Add main static routes
  const staticRoutes = [
    { path: "@lgcode/", priority: 1.0, changefreq: "daily" },
    { path: "@lgcode/enterprise", priority: 0.8, changefreq: "weekly" },
    { path: "@lgcode/brand", priority: 0.6, changefreq: "monthly" },
    { path: "@lgcode/zen", priority: 0.8, changefreq: "weekly" },
    { path: "@lgcode/go", priority: 0.8, changefreq: "weekly" },
  ]

  for (const item of staticRoutes) {
    for (const locale of LOCALES) {
      routes.push({
        url: `${BASE_URL}${route(locale, item.path)}`,
        priority: item.priority,
        changefreq: item.changefreq,
      })
    }
  }

  return routes
}

async function getDocsRoutes(): Promise<SitemapEntry[]> {
  const routes: SitemapEntry[] = []

  try {
    const files = await readdir(DOCS_DIR)

    for (const file of files) {
      if (!file.endsWith(".mdx")) continue

      const slug = file.replace(".mdx", "")
      const path = slug === "index" ? "@lgcode/docs@lgcode/" : `@lgcode/docs@lgcode/${slug}`

      for (const locale of LOCALES) {
        routes.push({
          url: `${BASE_URL}${route(locale, path)}`,
          priority: slug === "index" ? 0.9 : 0.7,
          changefreq: "weekly",
        })
      }
    }
  } catch (error) {
    console.error("Error reading docs directory:", error)
  }

  return routes
}

function generateSitemapXML(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}<@lgcode/loc>
    <changefreq>${entry.changefreq}<@lgcode/changefreq>
    <priority>${entry.priority}<@lgcode/priority>
  <@lgcode/url>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http:@lgcode/@lgcode/www.sitemaps.org@lgcode/schemas@lgcode/sitemap@lgcode/0.9">
${urls}
<@lgcode/urlset>`
}

async function main() {
  console.log("Generating sitemap...")

  const mainRoutes = await getMainRoutes()
  const docsRoutes = await getDocsRoutes()

  const allRoutes = [...mainRoutes, ...docsRoutes]

  console.log(`Found ${mainRoutes.length} main routes`)
  console.log(`Found ${docsRoutes.length} docs routes`)
  console.log(`Total: ${allRoutes.length} routes`)

  const xml = generateSitemapXML(allRoutes)

  const outputPath = join(PUBLIC_DIR, "sitemap.xml")
  await writeFile(outputPath, xml, "utf-8")

  console.log(`✓ Sitemap generated at ${outputPath}`)
}

void main()
