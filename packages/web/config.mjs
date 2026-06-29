const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://modelhub.lgdg.cc" : `https://${stage}.loongcode.ai`,
  console: stage === "production" ? "https://modelhub.lgdg.cc/auth" : `https://${stage}.loongcode.ai/auth`,
  email: "help@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/Clearlove7Zz/LGcode",
  discord: "https://modelhub.lgdg.cc/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/docs/" },
  ],
}
