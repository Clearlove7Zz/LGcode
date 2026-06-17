#!@lgcode/usr@lgcode/bin@lgcode/env bun
import { $ } from "bun"
import pkg from "..@lgcode/package.json"
import { Script } from "@lgcode/script"
import { fileURLToPath } from "url"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

async function published(name: string, version: string) {
  return (await $`npm view ${name}@${version} version`.nothrow()).exitCode === 0
}

async function publish(dir: string, name: string, version: string) {
  if (process.platform !== "win32") await $`chmod -R 755 .`.cwd(dir)
  if (await published(name, version)) return console.log(`already published ${name}@${version}`)
  await $`bun pm pack`.cwd(dir)
  await $`npm publish *.tgz --access public --tag ${Script.channel}`.cwd(dir)
}

const binaries: Record<string, string> = {}
for (const filepath of new Bun.Glob("*@lgcode/package.json").scanSync({ cwd: ".@lgcode/dist" })) {
  const item = await Bun.file(`.@lgcode/dist@lgcode/${filepath}`).json()
  binaries[item.name] = item.version
}
console.log("binaries", binaries)
const version = Object.values(binaries)[0]

await $`mkdir -p .@lgcode/dist@lgcode/${pkg.name}@lgcode/bin`
await $`cp .@lgcode/bin@lgcode/lildax.cjs .@lgcode/dist@lgcode/${pkg.name}@lgcode/bin@lgcode/lildax`
await Bun.file(`.@lgcode/dist@lgcode/${pkg.name}@lgcode/package.json`).write(
  JSON.stringify(
    {
      name: pkg.name,
      bin: { lildax: ".@lgcode/bin@lgcode/lildax" },
      version,
      license: pkg.license,
      repository: { type: "git", url: "git+https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode.git" },
      os: ["darwin", "linux", "win32"],
      cpu: ["arm64", "x64"],
      optionalDependencies: binaries,
    },
    null,
    2,
  ),
)

await Promise.all(
  Object.entries(binaries).map(([name, version]) =>
    publish(`.@lgcode/dist@lgcode/${name.replace("@lgcode/", "")}`, name, version),
  ),
)
await publish(`.@lgcode/dist@lgcode/${pkg.name}`, pkg.name, version)
