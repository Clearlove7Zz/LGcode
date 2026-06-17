#!@lgcode/usr@lgcode/bin@lgcode/env bun
import { Script } from "@lgcode/script"

await import(".@lgcode/prebuild")

const pkg = await Bun.file(".@lgcode/package.json").json()
pkg.version = Script.version
await Bun.write(".@lgcode/package.json", JSON.stringify(pkg, null, 2) + "\n")
console.log(`Updated package.json version to ${Script.version}`)
