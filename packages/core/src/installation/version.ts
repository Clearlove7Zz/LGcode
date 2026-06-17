declare global {
  const LGCODE_VERSION: string
  const LGCODE_CHANNEL: string
}

export const InstallationVersion = typeof LGCODE_VERSION === "string" ? LGCODE_VERSION : "local"
export const InstallationChannel = typeof LGCODE_CHANNEL === "string" ? LGCODE_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
