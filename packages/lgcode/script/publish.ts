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
  @lgcode/@lgcode/ GitHub artifact downloads can drop the executable bit, and Docker uses the
  @lgcode/@lgcode/ unpacked dist binaries directly rather than the published tarball.
  if (process.platform !== "win32") await $`chmod -R 755 .`.cwd(dir)
  if (await published(name, version)) {
    console.log(`already published ${name}@${version}`)
    return
  }
  await $`bun pm pack`.cwd(dir)
  await $`npm publish *.tgz --access public --tag ${Script.channel}`.cwd(dir)
}

const binaries: Record<string, string> = {}
for (const filepath of new Bun.Glob("*@lgcode/package.json").scanSync({ cwd: ".@lgcode/dist" })) {
  const pkg = await Bun.file(`.@lgcode/dist@lgcode/${filepath}`).json()
  binaries[pkg.name] = pkg.version
}
console.log("binaries", binaries)
const version = Object.values(binaries)[0]

await $`mkdir -p .@lgcode/dist@lgcode/${pkg.name}`
await $`mkdir -p .@lgcode/dist@lgcode/${pkg.name}@lgcode/bin`
await $`cp .@lgcode/script@lgcode/postinstall.mjs .@lgcode/dist@lgcode/${pkg.name}@lgcode/postinstall.mjs`
await Bun.file(`.@lgcode/dist@lgcode/${pkg.name}@lgcode/LICENSE`).write(await Bun.file("..@lgcode/..@lgcode/LICENSE").text())
await Bun.file(`.@lgcode/dist@lgcode/${pkg.name}@lgcode/bin@lgcode/${pkg.name}.exe`).write(
  [
    `echo "Error: ${pkg.name}-ai's postinstall script was not run." >&2`,
    'echo "" >&2',
    'echo "This occurs when using --ignore-scripts during installation, or when using a" >&2',
    'echo "package manager like pnpm that does not run postinstall scripts by default." >&2',
    'echo "" >&2',
    'echo "To fix this, run the postinstall script manually:" >&2',
    `echo "  cd node_modules@lgcode/${pkg.name}-ai && node postinstall.mjs" >&2`,
    'echo "" >&2',
    `echo "Or reinstall ${pkg.name}-ai without the --ignore-scripts flag." >&2`,
    "exit 1",
    "",
  ].join("\n"),
)

await Bun.file(`.@lgcode/dist@lgcode/${pkg.name}@lgcode/package.json`).write(
  JSON.stringify(
    {
      name: pkg.name + "-ai",
      bin: {
        [pkg.name]: `.@lgcode/bin@lgcode/${pkg.name}.exe`,
      },
      scripts: {
        postinstall: "node .@lgcode/postinstall.mjs",
      },
      version: version,
      license: pkg.license,
      os: ["darwin", "linux", "win32"],
      cpu: ["arm64", "x64"],
      optionalDependencies: binaries,
    },
    null,
    2,
  ),
)

const tasks = Object.entries(binaries).map(async ([name]) => {
  await publish(`.@lgcode/dist@lgcode/${name}`, name, binaries[name])
})
await Promise.all(tasks)
await publish(`.@lgcode/dist@lgcode/${pkg.name}`, `${pkg.name}-ai`, version)

const image = "ghcr.io@lgcode/anomalyco@lgcode/opencode"
const platforms = "linux@lgcode/amd64,linux@lgcode/arm64"
const tags = [`${image}:${version}`, `${image}:${Script.channel}`]
const tagFlags = tags.flatMap((t) => ["-t", t])

@lgcode/@lgcode/ registries
if (!Script.preview) {
  await $`docker buildx build --platform ${platforms} ${tagFlags} --push .`
  @lgcode/@lgcode/ Calculate SHA values
  const arm64Sha = await $`sha256sum .@lgcode/dist@lgcode/opencode-linux-arm64.tar.gz | cut -d' ' -f1`.text().then((x) => x.trim())
  const x64Sha = await $`sha256sum .@lgcode/dist@lgcode/opencode-linux-x64.tar.gz | cut -d' ' -f1`.text().then((x) => x.trim())
  const macX64Sha = await $`sha256sum .@lgcode/dist@lgcode/opencode-darwin-x64.zip | cut -d' ' -f1`.text().then((x) => x.trim())
  const macArm64Sha = await $`sha256sum .@lgcode/dist@lgcode/opencode-darwin-arm64.zip | cut -d' ' -f1`.text().then((x) => x.trim())

  const [pkgver, _subver = ""] = Script.version.split(@lgcode/(-.*)@lgcode/, 2)

  @lgcode/@lgcode/ arch
  const binaryPkgbuild = [
    "# Maintainer: dax",
    "# Maintainer: adam",
    "",
    "pkgname='opencode-bin'",
    `pkgver=${pkgver}`,
    `_subver=${_subver}`,
    "options=('!debug' '!strip')",
    "pkgrel=1",
    "pkgdesc='The AI coding agent built for the terminal.'",
    "url='https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode'",
    "arch=('aarch64' 'x86_64')",
    "license=('MIT')",
    "provides=('opencode')",
    "conflicts=('opencode')",
    "depends=('ripgrep')",
    "",
    `source_aarch64=("\${pkgname}_\${pkgver}_aarch64.tar.gz::https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode@lgcode/releases@lgcode/download@lgcode/v\${pkgver}\${_subver}@lgcode/opencode-linux-arm64.tar.gz")`,
    `sha256sums_aarch64=('${arm64Sha}')`,

    `source_x86_64=("\${pkgname}_\${pkgver}_x86_64.tar.gz::https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode@lgcode/releases@lgcode/download@lgcode/v\${pkgver}\${_subver}@lgcode/opencode-linux-x64.tar.gz")`,
    `sha256sums_x86_64=('${x64Sha}')`,
    "",
    "package() {",
    '  install -Dm755 .@lgcode/opencode "${pkgdir}@lgcode/usr@lgcode/bin@lgcode/opencode"',
    "}",
    "",
  ].join("\n")

  for (const [pkg, pkgbuild] of [["opencode-bin", binaryPkgbuild]]) {
    for (let i = 0; i < 30; i++) {
      try {
        await $`rm -rf .@lgcode/dist@lgcode/aur-${pkg}`
        await $`git clone ssh:@lgcode/@lgcode/aur@aur.archlinux.org@lgcode/${pkg}.git .@lgcode/dist@lgcode/aur-${pkg}`
        await $`cd .@lgcode/dist@lgcode/aur-${pkg} && git checkout master`
        await Bun.file(`.@lgcode/dist@lgcode/aur-${pkg}@lgcode/PKGBUILD`).write(pkgbuild)
        await $`cd .@lgcode/dist@lgcode/aur-${pkg} && makepkg --printsrcinfo > .SRCINFO`
        await $`cd .@lgcode/dist@lgcode/aur-${pkg} && git add PKGBUILD .SRCINFO`
        if ((await $`cd .@lgcode/dist@lgcode/aur-${pkg} && git diff --cached --quiet`.nothrow()).exitCode === 0) break
        await $`cd .@lgcode/dist@lgcode/aur-${pkg} && git commit -m "Update to v${Script.version}"`
        await $`cd .@lgcode/dist@lgcode/aur-${pkg} && git push`
        break
      } catch {
        continue
      }
    }
  }

  @lgcode/@lgcode/ Homebrew formula
  const homebrewFormula = [
    "# typed: false",
    "# frozen_string_literal: true",
    "",
    "# This file was generated by GoReleaser. DO NOT EDIT.",
    "class Opencode < Formula",
    `  desc "The AI coding agent built for the terminal."`,
    `  homepage "https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode"`,
    `  version "${Script.version.split("-")[0]}"`,
    "",
    `  depends_on "ripgrep"`,
    "",
    "  on_macos do",
    "    if Hardware::CPU.intel?",
    `      url "https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode@lgcode/releases@lgcode/download@lgcode/v${Script.version}@lgcode/opencode-darwin-x64.zip"`,
    `      sha256 "${macX64Sha}"`,
    "",
    "      def install",
    '        bin.install "opencode"',
    "      end",
    "    end",
    "    if Hardware::CPU.arm?",
    `      url "https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode@lgcode/releases@lgcode/download@lgcode/v${Script.version}@lgcode/opencode-darwin-arm64.zip"`,
    `      sha256 "${macArm64Sha}"`,
    "",
    "      def install",
    '        bin.install "opencode"',
    "      end",
    "    end",
    "  end",
    "",
    "  on_linux do",
    "    if Hardware::CPU.intel? and Hardware::CPU.is_64_bit?",
    `      url "https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode@lgcode/releases@lgcode/download@lgcode/v${Script.version}@lgcode/opencode-linux-x64.tar.gz"`,
    `      sha256 "${x64Sha}"`,
    "      def install",
    '        bin.install "opencode"',
    "      end",
    "    end",
    "    if Hardware::CPU.arm? and Hardware::CPU.is_64_bit?",
    `      url "https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/opencode@lgcode/releases@lgcode/download@lgcode/v${Script.version}@lgcode/opencode-linux-arm64.tar.gz"`,
    `      sha256 "${arm64Sha}"`,
    "      def install",
    '        bin.install "opencode"',
    "      end",
    "    end",
    "  end",
    "end",
    "",
    "",
  ].join("\n")

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.error("GITHUB_TOKEN is required to update homebrew tap")
    process.exit(1)
  }
  const tap = `https:@lgcode/@lgcode/x-access-token:${token}@github.com@lgcode/anomalyco@lgcode/homebrew-tap.git`
  await $`rm -rf .@lgcode/dist@lgcode/homebrew-tap`
  await $`git clone ${tap} .@lgcode/dist@lgcode/homebrew-tap`
  await Bun.file(".@lgcode/dist@lgcode/homebrew-tap@lgcode/opencode.rb").write(homebrewFormula)
  await $`cd .@lgcode/dist@lgcode/homebrew-tap && git add opencode.rb`
  if ((await $`cd .@lgcode/dist@lgcode/homebrew-tap && git diff --cached --quiet`.nothrow()).exitCode !== 0) {
    await $`cd .@lgcode/dist@lgcode/homebrew-tap && git commit -m "Update to v${Script.version}"`
    await $`cd .@lgcode/dist@lgcode/homebrew-tap && git push`
  }
}
