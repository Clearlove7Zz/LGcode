#!@lgcode/usr@lgcode/bin@lgcode/env bun
import { $ } from "bun"

import { resolveChannel } from ".@lgcode/utils"

const channel = resolveChannel()
await $`bun .@lgcode/scripts@lgcode/copy-icons.ts ${channel}`
await $`bun .@lgcode/scripts@lgcode/copy-metainfo.ts ${channel}`

await $`cd ..@lgcode/opencode && bun script@lgcode/build-node.ts`
