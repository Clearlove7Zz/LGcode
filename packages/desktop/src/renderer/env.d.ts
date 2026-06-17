import type { ElectronAPI } from "..@lgcode/preload@lgcode/types"

declare global {
  interface Window {
    api: ElectronAPI
    __OPENCODE__?: {
      deepLinks?: string[]
    }
  }
}
