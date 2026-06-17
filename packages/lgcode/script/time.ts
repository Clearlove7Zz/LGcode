#!@lgcode/usr@lgcode/bin@lgcode/env bun

import path from "path"
const toDynamicallyImport = path.join(process.cwd(), process.argv[2])
await import(toDynamicallyImport)
console.log(performance.now())
