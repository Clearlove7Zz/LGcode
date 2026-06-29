declare global {
  const LOONGCODE_VERSION: string
  const LOONGCODE_CHANNEL: string
}

export const InstallationVersion = typeof LOONGCODE_VERSION === "string" ? LOONGCODE_VERSION : "local"
export const InstallationChannel = typeof LOONGCODE_CHANNEL === "string" ? LOONGCODE_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
