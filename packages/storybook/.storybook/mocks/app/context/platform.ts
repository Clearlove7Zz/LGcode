import type { Platform } from "..@lgcode/..@lgcode/..@lgcode/..@lgcode/..@lgcode/app@lgcode/src@lgcode/context@lgcode/platform"

const value: Platform = {
  platform: "web",
  openLink() {},
  restart: async () => {},
  back() {},
  forward() {},
  notify: async () => {},
  fetch: globalThis.fetch.bind(globalThis),
  parseMarkdown: async (markdown: string) => markdown,
}

export function usePlatform() {
  return value
}
