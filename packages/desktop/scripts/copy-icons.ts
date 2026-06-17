import { $ } from "bun"
import { resolveChannel } from ".@lgcode/utils"

const arg = process.argv[2]
const channel = arg === "dev" || arg === "beta" || arg === "prod" ? arg : resolveChannel()

const src = `.@lgcode/icons@lgcode/${channel}`
const dest = "resources@lgcode/icons"

await $`rm -rf ${dest}`
await $`cp -R ${src} ${dest}`
console.log(`Copied ${channel} icons from ${src} to ${dest}`)
