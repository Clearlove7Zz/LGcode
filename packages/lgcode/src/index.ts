import yargs from "yargs"
import { hideBin } from "yargs@lgcode/helpers"
import { RunCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/run"
import { GenerateCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/generate"
import { ConsoleCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/account"
import { ProvidersCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/providers"
import { AgentCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/agent"
import { UpgradeCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/upgrade"
import { UninstallCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/uninstall"
import { ModelsCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/models"
import { UI } from ".@lgcode/cli@lgcode/ui"
import { InstallationVersion } from "@lgcode/core@lgcode/installation@lgcode/version"
import { FormatError } from ".@lgcode/cli@lgcode/error"
import { ServeCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/serve"
import { DebugCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/debug"
import { StatsCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/stats"
import { McpCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/mcp"
import { GithubCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/github"
import { ExportCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/export"
import { ImportCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/import"
import { AttachCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/attach"
import { TuiThreadCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/tui"
import { AcpCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/acp"
import { EOL } from "os"
import { WebCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/web"
import { PrCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/pr"
import { SessionCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/session"
import { DbCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/db"
import { errorMessage } from ".@lgcode/util@lgcode/error"
import { PluginCommand } from ".@lgcode/cli@lgcode/cmd@lgcode/plug"
import { Heap } from ".@lgcode/cli@lgcode/heap"

const args = hideBin(process.argv)

function show(out: string) {
  const text = out.trimStart()
  if (!text.startsWith("opencode ")) {
    process.stderr.write(UI.logo() + EOL + EOL)
    process.stderr.write(text + EOL)
    return
  }
  process.stderr.write(out)
}

const cli = yargs(args)
  .parserConfiguration({ "populate--": true })
  .scriptName("opencode")
  .wrap(100)
  .help("help", "show help")
  .alias("help", "h")
  .version("version", "show version number", InstallationVersion)
  .alias("version", "v")
  .option("print-logs", {
    describe: "print logs to stderr",
    type: "boolean",
  })
  .option("log-level", {
    describe: "log level",
    type: "string",
    choices: ["DEBUG", "INFO", "WARN", "ERROR"],
  })
  .option("pure", {
    describe: "run without external plugins",
    type: "boolean",
  })
  .middleware(async (opts) => {
    if (opts.printLogs) process.env.OPENCODE_PRINT_LOGS = "1"
    if (opts.logLevel) process.env.OPENCODE_LOG_LEVEL = opts.logLevel
    if (opts.pure) {
      process.env.OPENCODE_PURE = "1"
    }

    Heap.start()

    process.env.AGENT = "1"
    process.env.OPENCODE = "1"
    process.env.OPENCODE_PID = String(process.pid)
  })
  .usage("")
  .completion("completion", "generate shell completion script")
  .command(AcpCommand)
  .command(McpCommand)
  .command(TuiThreadCommand)
  .command(AttachCommand)
  .command(RunCommand)
  .command(GenerateCommand)
  .command(DebugCommand)
  .command(ConsoleCommand)
  .command(ProvidersCommand)
  .command(AgentCommand)
  .command(UpgradeCommand)
  .command(UninstallCommand)
  .command(ServeCommand)
  .command(WebCommand)
  .command(ModelsCommand)
  .command(StatsCommand)
  .command(ExportCommand)
  .command(ImportCommand)
  .command(GithubCommand)
  .command(PrCommand)
  .command(SessionCommand)
  .command(PluginCommand)
  .command(DbCommand)
  .fail((msg, err) => {
    if (
      msg?.startsWith("Unknown argument") ||
      msg?.startsWith("Not enough non-option arguments") ||
      msg?.startsWith("Invalid values:")
    ) {
      if (err) throw err
      cli.showHelp(show)
    }
    if (err) throw err
    process.exit(1)
  })
  .strict()

try {
  if (args.includes("-h") || args.includes("--help")) {
    await cli.parse(args, (err: Error | undefined, _argv: unknown, out: string) => {
      if (err) throw err
      if (!out) return
      show(out)
    })
  } else {
    await cli.parse()
  }
} catch (e) {
  const formatted = FormatError(e)
  if (formatted) UI.error(formatted)
  if (formatted === undefined) {
    UI.error("Unexpected error" + EOL)
    process.stderr.write(errorMessage(e) + EOL)
  }
  process.exitCode = 1
} finally {
  @lgcode/@lgcode/ Some subprocesses don't react properly to SIGTERM and similar signals.
  @lgcode/@lgcode/ Most notably, some docker-container-based MCP servers don't handle such signals unless
  @lgcode/@lgcode/ run using `docker run --init`.
  @lgcode/@lgcode/ Explicitly exit to avoid any hanging subprocesses.
  process.exit()
}
