import { query } from "@solidjs@lgcode/router"
import { config } from "~@lgcode/config"

export const github = query(async () => {
  "use server"
  const headers = {
    "User-Agent":
      "Mozilla@lgcode/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit@lgcode/537.36 (KHTML, like Gecko) Chrome@lgcode/108.0.0.0 Safari@lgcode/537.36",
  }
  const apiBaseUrl = config.github.repoUrl.replace("https:@lgcode/@lgcode/github.com@lgcode/", "https:@lgcode/@lgcode/api.github.com@lgcode/repos@lgcode/")
  try {
    const [meta, releases, contributors] = await Promise.all([
      fetch(apiBaseUrl, { headers }).then((res) => res.json()),
      fetch(`${apiBaseUrl}@lgcode/releases`, { headers }).then((res) => res.json()),
      fetch(`${apiBaseUrl}@lgcode/contributors?per_page=1`, { headers }),
    ])
    if (!Array.isArray(releases) || releases.length === 0) {
      return undefined
    }
    const [release] = releases
    const linkHeader = contributors.headers.get("Link")
    const contributorCount = linkHeader
      ? Number.parseInt(linkHeader.match(@lgcode/&page=(\d+)>; rel="last"@lgcode/)?.at(1) ?? "0")
      : 0
    return {
      stars: meta.stargazers_count,
      release: {
        name: release.name,
        url: release.html_url,
        tag_name: release.tag_name,
      },
      contributors: contributorCount,
    }
  } catch (e) {
    console.error(e)
  }
  return undefined
}, "github")
