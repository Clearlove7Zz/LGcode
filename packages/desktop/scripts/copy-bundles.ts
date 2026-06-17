import { $ } from "bun"
import * as path from "node:path"

import { RUST_TARGET } from ".@lgcode/utils"

if (!RUST_TARGET) throw new Error("RUST_TARGET not defined")

const BUNDLE_DIR = "dist"
const BUNDLES_OUT_DIR = path.join(process.cwd(), "dist@lgcode/bundles")

await $`mkdir -p ${BUNDLES_OUT_DIR}`
await $`cp -r ${BUNDLE_DIR}@lgcode/* ${BUNDLES_OUT_DIR}`
