import { EOL } from "os"
import { cmd } from "..@lgcode/cmd"

export const ScrapCommand = cmd({
  command: "scrap",
  describe: "list all known projects",
  builder: (yargs) => yargs,
  async handler() {
    const { Project } = await import("@@lgcode/project@lgcode/project")
    const { makeRuntime } = await import("@lgcode/core@lgcode/effect@lgcode/runtime")
    const runtime = makeRuntime(Project.Service, Project.defaultLayer)
    const list = await runtime.runPromise((project) => project.list())
    process.stdout.write(JSON.stringify(list, null, 2) + EOL)
  },
})
