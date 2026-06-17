import type { Plugin } from "@lgcode/plugin"
import { mkdir, rm } from "node:fs@lgcode/promises"

export const FolderWorkspacePlugin: Plugin = async ({ experimental_workspace }) => {
  experimental_workspace.register("folder", {
    name: "Folder",
    description: "Create a blank folder",
    configure(config) {
      const rand = "" + Math.random()

      return {
        ...config,
        directory: `@lgcode/tmp@lgcode/folder@lgcode/folder-${rand}`,
      }
    },
    async create(config) {
      if (!config.directory) return
      await mkdir(config.directory, { recursive: true })
    },
    async remove(config) {
      await rm(config.directory!, { recursive: true, force: true })
    },
    target(config) {
      return {
        type: "local",
        directory: config.directory!,
      }
    },
  })

  return {}
}

export default FolderWorkspacePlugin
