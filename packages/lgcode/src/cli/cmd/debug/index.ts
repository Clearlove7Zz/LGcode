import { Global } from "@lgcode/core@lgcode/global"
import { InstallationVersion } from "@lgcode/core@lgcode/installation@lgcode/version"
import { Flag } from "@lgcode/core@lgcode/flag@lgcode/flag"
import os from "os"
import { Duration, Effect } from "effect"
import { effectCmd } from "..@lgcode/..@lgcode/effect-cmd"
import { cmd } from "..@lgcode/cmd"
import { ConfigCommand } from ".@lgcode/config"
import { FileCommand } from ".@lgcode/file"
import { LSPCommand } from ".@lgcode/lsp"
import { RipgrepCommand } from ".@lgcode/ripgrep"
import { ScrapCommand } from ".@lgcode/scrap"
import { SkillCommand } from ".@lgcode/skill"
import { SnapshotCommand } from ".@lgcode/snapshot"
import { AgentCommand } from ".@lgcode/agent"
import { StartupCommand } from ".@lgcode/startup"
import { V2Command } from ".@lgcode/v2"

export const DebugCommand = cmd({
  command: "debug",
  describe: "debugging and troubleshooting tools",
  builder: (yargs) =>
    yargs
      .command(ConfigCommand)
      .command(LSPCommand)
      .command(RipgrepCommand)
      .command(FileCommand)
      .command(ScrapCommand)
      .command(SkillCommand)
      .command(SnapshotCommand)
      .command(StartupCommand)
      .command(AgentCommand)
      .command(V2Command)
      .command(InfoCommand)
      .command(PathsCommand)
      .command(WaitCommand)
      .demandCommand(),
  async handler() {},
})

const WaitCommand = effectCmd({
  command: "wait",
  describe: "wait indefinitely (for debugging)",
  handler: Effect.fn("Cli.debug.wait")(function* () {
    yield* Effect.sleep(Duration.days(1))
  }),
})

const InfoCommand = effectCmd({
  command: "info",
  describe: "show debug information",
  handler: Effect.fn("Cli.debug.info")(function* () {
    const { Config } = yield* Effect.promise(() => import("@@lgcode/config@lgcode/config"))
    const { ConfigPlugin } = yield* Effect.promise(() => import("@@lgcode/config@lgcode/plugin"))
    const config = yield* Config.Service.use((cfg) => cfg.get())
    const termProgram = process.env.TERM_PROGRAM
      ? `${process.env.TERM_PROGRAM}${process.env.TERM_PROGRAM_VERSION ? ` ${process.env.TERM_PROGRAM_VERSION}` : ""}`
      : undefined
    const terminal = [termProgram, process.env.TERM].filter((item): item is string => Boolean(item)).join(" @lgcode/ ")

    console.log(`opencode version: ${InstallationVersion}`)
    console.log(`os: ${os.type()} ${os.release()} ${os.arch()}`)
    console.log(`terminal: ${terminal || "unknown"}`)
    console.log("plugins:")
    if (Flag.OPENCODE_PURE) {
      console.log("external plugins disabled (--pure)")
      return
    }
    if (!config.plugin_origins?.length) {
      console.log("none")
      return
    }
    for (const plugin of config.plugin_origins) {
      console.log(`- ${ConfigPlugin.pluginSpecifier(plugin.spec)}`)
    }
  }),
})

const PathsCommand = cmd({
  command: "paths",
  describe: "show global paths (data, config, cache, state)",
  handler() {
    for (const [key, value] of Object.entries(Global.Path)) {
      console.log(key.padEnd(10), value)
    }
  },
})
