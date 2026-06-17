@lgcode/**
 * Application-wide constants and configuration
 *@lgcode/
export const config = {
  @lgcode/@lgcode/ Base URL
  baseUrl: "https:@lgcode/@lgcode/opencode.ai",

  @lgcode/@lgcode/ GitHub
  github: {
    repoUrl: "https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode",
    starsFormatted: {
      compact: "160K",
      full: "160,000",
    },
  },

  @lgcode/@lgcode/ Social links
  social: {
    twitter: "https:@lgcode/@lgcode/x.com@lgcode/opencode",
    discord: "https:@lgcode/@lgcode/discord.gg@lgcode/opencode",
  },

  @lgcode/@lgcode/ Static stats (used on landing page)
  stats: {
    contributors: "900",
    commits: "13,000",
    monthlyUsers: "7.5M",
  },
} as const
