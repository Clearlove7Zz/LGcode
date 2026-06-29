import { $ } from "bun"

await $`bun ./scripts/copy-icons.ts ${process.env.LOONGCODE_CHANNEL ?? "dev"}`

await $`cd ../loongcode && bun script/build-node.ts`
