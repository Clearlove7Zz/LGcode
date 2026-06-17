import { $ } from "bun"

await $`bun .@lgcode/scripts@lgcode/copy-icons.ts ${process.env.OPENCODE_CHANNEL ?? "dev"}`

await $`cd ..@lgcode/opencode && bun script@lgcode/build-node.ts`
