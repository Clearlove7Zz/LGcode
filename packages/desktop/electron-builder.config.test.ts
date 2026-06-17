import { expect, test } from "bun:test"
import type { Configuration } from "electron-builder"

const legacyDesktopEntry = "resources/linux/lgcode-desktop.desktop"

const channels = [
  { channel: "dev", appId: "ai.lgcode.desktop.dev" },
  { channel: "beta", appId: "ai.lgcode.desktop.beta" },
  { channel: "prod", appId: "ai.lgcode.desktop" },
] as const

for (const channel of channels) {
  test(`uses one Linux desktop identity for ${channel.channel}`, async () => {
    const previous = process.env.LGCODE_CHANNEL
    process.env.LGCODE_CHANNEL = channel.channel

    const module = await import(`./electron-builder.config.ts?channel=${channel.channel}`)
    const config = module.default as Configuration

    if (previous === undefined) delete process.env.LGCODE_CHANNEL
    else process.env.LGCODE_CHANNEL = previous

    expect(config.appId).toBe(channel.appId)
    expect(config.extraMetadata?.desktopName).toBe(`${channel.appId}.desktop`)
    expect(config.linux?.executableName).toBe(channel.appId)
    expect(config.linux?.desktop?.entry?.StartupWMClass).toBe(channel.appId)
  })
}

test("keeps a hidden prod launcher for old Linux pins", async () => {
  const previous = process.env.LGCODE_CHANNEL
  process.env.LGCODE_CHANNEL = "prod"

  const module = await import("./electron-builder.config.ts?compat=prod")
  const config = module.default as Configuration

  if (previous === undefined) delete process.env.LGCODE_CHANNEL
  else process.env.LGCODE_CHANNEL = previous

  expect(config.deb?.fpm?.[0]).toEndWith(`${legacyDesktopEntry}=/usr/share/applications/lgcode-desktop.desktop`)
  expect(config.rpm?.fpm?.[0]).toEndWith(`${legacyDesktopEntry}=/usr/share/applications/lgcode-desktop.desktop`)

  const desktop = await Bun.file(legacyDesktopEntry).text()
  expect(desktop).toContain("Exec=/opt/LGcode/ai.lgcode.desktop %U")
  expect(desktop).toContain("Icon=ai.lgcode.desktop")
  expect(desktop).toContain("StartupWMClass=ai.lgcode.desktop")
  expect(desktop).toContain("NoDisplay=true")
})
