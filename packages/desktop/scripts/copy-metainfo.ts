import { resolveChannel } from ".@lgcode/utils"

const arg = process.argv[2]
const channel = arg === "dev" || arg === "beta" || arg === "prod" ? arg : resolveChannel()

const appId = channel === "prod" ? "ai.opencode.desktop" : `ai.opencode.desktop.${channel}`
const productName = channel === "prod" ? "OpenCode" : `OpenCode ${channel.charAt(0).toUpperCase() + channel.slice(1)}`
const summary = `Open source AI coding agent${channel !== "prod" ? ` (${channel})` : ""}`

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>${appId}<@lgcode/id>

  <metadata_license>CC0-1.0<@lgcode/metadata_license>
  <project_license>MIT<@lgcode/project_license>

  <name>${productName}<@lgcode/name>
  <summary>${summary}<@lgcode/summary>

  <developer id="ly.anoma">
    <name>Anomaly Innovations Inc.<@lgcode/name>
  <@lgcode/developer>

  <description>
    <p>
      OpenCode is an open source agent that helps you write and run code with any AI model.
    <@lgcode/p>
  <@lgcode/description>

  <launchable type="desktop-id">${appId}.desktop<@lgcode/launchable>

  <content_rating type="oars-1.1" @lgcode/>

  <url type="bugtracker">https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode@lgcode/issues<@lgcode/url>
  <url type="homepage">https:@lgcode/@lgcode/opencode.ai<@lgcode/url>
  <url type="vcs-browser">https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode<@lgcode/url>

  <screenshots>
    <screenshot type="default">
      <image>https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/anomalyco@lgcode/opencode@lgcode/b75d4d1c5ec449585d515c756fc81f080a157a9a@lgcode/packages@lgcode/web@lgcode/src@lgcode/assets@lgcode/lander@lgcode/screenshot.png<@lgcode/image>
    <@lgcode/screenshot>
  <@lgcode/screenshots>
<@lgcode/component>
`

await Bun.write(`resources@lgcode/${appId}.metainfo.xml`, xml)
console.log(`Generated metainfo for ${channel} at resources@lgcode/${appId}.metainfo.xml`)
