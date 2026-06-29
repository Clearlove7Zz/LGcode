export const domain = (() => {
  if ($app.stage === "production") return "modelhub.lgdg.cc"
  if ($app.stage === "dev") return "dev.modelhub.lgdg.cc"
  return `${$app.stage}.dev.modelhub.lgdg.cc`
})()

export const zoneID = "430ba34c138cfb5360826c4909f99be8"
export const awsStage = $app.stage === "production" ? "production" : "dev"
export const deployAws = $app.stage === awsStage

new cloudflare.RegionalHostname("RegionalHostname", {
  hostname: domain,
  regionKey: "us",
  zoneId: zoneID,
})

export const shortDomain = (() => {
  if ($app.stage === "production") return "opncd.ai"
  if ($app.stage === "dev") return "dev.opncd.ai"
  return `${$app.stage}.dev.opncd.ai`
})()
