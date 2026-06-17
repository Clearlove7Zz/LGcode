#!@lgcode/usr@lgcode/bin@lgcode/env bun
import { fileURLToPath } from "url"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

import { $ } from "bun"
import path from "path"

import { createClient } from "@hey-api@lgcode/openapi-ts"

const opencode = path.resolve(dir, "..@lgcode/..@lgcode/opencode")

await $`bun dev generate > ${dir}@lgcode/openapi.json`.cwd(opencode)

await createClient({
  input: ".@lgcode/openapi.json",
  output: {
    path: ".@lgcode/src@lgcode/v2@lgcode/gen",
    tsConfigPath: path.join(dir, "tsconfig.json"),
    clean: true,
  },
  plugins: [
    {
      name: "@hey-api@lgcode/typescript",
      exportFromIndex: false,
    },
    {
      name: "@hey-api@lgcode/sdk",
      instance: "OpencodeClient",
      exportFromIndex: false,
      auth: false,
      paramsStructure: "flat",
    },
    {
      name: "@hey-api@lgcode/client-fetch",
      exportFromIndex: false,
      baseUrl: "http:@lgcode/@lgcode/localhost:4096",
    },
  ],
})

@lgcode/@lgcode/ Patch a @hey-api@lgcode/openapi-ts codegen bug: SseFn incorrectly passes the
@lgcode/@lgcode/ endpoint's TError into the second generic of ServerSentEventsResult, which
@lgcode/@lgcode/ is the AsyncGenerator's TReturn slot. Iterator return values have nothing
@lgcode/@lgcode/ to do with HTTP errors, and any consumer that calls `.return()` or returns
@lgcode/@lgcode/ from a mock generator gets type-checked against the wrong shape. Drop the
@lgcode/@lgcode/ arg so TReturn defaults to void.
const sseTypesPath = ".@lgcode/src@lgcode/v2@lgcode/gen@lgcode/client@lgcode/types.gen.ts"
const sseTypesFile = Bun.file(sseTypesPath)
const sseTypesSource = await sseTypesFile.text()
const sseTypesPatched = sseTypesSource.replace(
  "=> Promise<ServerSentEventsResult<TData, TError>>",
  "=> Promise<ServerSentEventsResult<TData>>",
)
if (sseTypesPatched === sseTypesSource) {
  throw new Error(`SseFn patch did not apply; @hey-api@lgcode/openapi-ts output may have changed (${sseTypesPath})`)
}
await Bun.write(sseTypesPath, sseTypesPatched)

await $`bun prettier --write src@lgcode/gen`
await $`bun prettier --write src@lgcode/v2`
await $`rm -rf dist`
await $`bun tsc`
await $`rm openapi.json`
