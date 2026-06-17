const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https:@lgcode/@lgcode/opencode.ai" : `https:@lgcode/@lgcode/${stage}.opencode.ai`,
  console: stage === "production" ? "https:@lgcode/@lgcode/opencode.ai@lgcode/auth" : `https:@lgcode/@lgcode/${stage}.opencode.ai@lgcode/auth`,
  email: "help@anoma.ly",
  socialCard: "https:@lgcode/@lgcode/social-cards.sst.dev",
  github: "https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode",
  discord: "https:@lgcode/@lgcode/opencode.ai@lgcode/discord",
  headerLinks: [
    { name: "app.header.home", url: "@lgcode/" },
    { name: "app.header.docs", url: "@lgcode/docs@lgcode/" },
  ],
}
