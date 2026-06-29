import { Config } from "effect"

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

const copy = process.env["LOONGCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["LOONGCODE_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("LOONGCODE_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  LOONGCODE_AUTO_HEAP_SNAPSHOT: truthy("LOONGCODE_AUTO_HEAP_SNAPSHOT"),
  LOONGCODE_GIT_BASH_PATH: process.env["LOONGCODE_GIT_BASH_PATH"],
  LOONGCODE_CONFIG: process.env["LOONGCODE_CONFIG"],
  LOONGCODE_CONFIG_CONTENT: process.env["LOONGCODE_CONFIG_CONTENT"],
  LOONGCODE_DISABLE_AUTOUPDATE: truthy("LOONGCODE_DISABLE_AUTOUPDATE"),
  LOONGCODE_ALWAYS_NOTIFY_UPDATE: truthy("LOONGCODE_ALWAYS_NOTIFY_UPDATE"),
  LOONGCODE_DISABLE_PRUNE: truthy("LOONGCODE_DISABLE_PRUNE"),
  LOONGCODE_DISABLE_TERMINAL_TITLE: truthy("LOONGCODE_DISABLE_TERMINAL_TITLE"),
  LOONGCODE_SHOW_TTFD: truthy("LOONGCODE_SHOW_TTFD"),
  LOONGCODE_DISABLE_AUTOCOMPACT: truthy("LOONGCODE_DISABLE_AUTOCOMPACT"),
  LOONGCODE_DISABLE_MODELS_FETCH: truthy("LOONGCODE_DISABLE_MODELS_FETCH"),
  LOONGCODE_DISABLE_MOUSE: truthy("LOONGCODE_DISABLE_MOUSE"),
  LOONGCODE_FAKE_VCS: process.env["LOONGCODE_FAKE_VCS"],
  LOONGCODE_SERVER_PASSWORD: process.env["LOONGCODE_SERVER_PASSWORD"],
  LOONGCODE_SERVER_USERNAME: process.env["LOONGCODE_SERVER_USERNAME"],
  LOONGCODE_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("LOONGCODE_DISABLE_FFF"),

  // Experimental
  LOONGCODE_EXPERIMENTAL_FILEWATCHER: Config.boolean("LOONGCODE_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  LOONGCODE_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("LOONGCODE_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  LOONGCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("LOONGCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  LOONGCODE_MODELS_URL: process.env["LOONGCODE_MODELS_URL"],
  LOONGCODE_MODELS_PATH: process.env["LOONGCODE_MODELS_PATH"],
  LOONGCODE_DB: process.env["LOONGCODE_DB"],

  LOONGCODE_WORKSPACE_ID: process.env["LOONGCODE_WORKSPACE_ID"],
  LOONGCODE_EXPERIMENTAL_WORKSPACES: enabledByExperimental("LOONGCODE_EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get LOONGCODE_DISABLE_PROJECT_CONFIG() {
    return truthy("LOONGCODE_DISABLE_PROJECT_CONFIG")
  },
  get LOONGCODE_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("LOONGCODE_EXPERIMENTAL_REFERENCES")
  },
  get LOONGCODE_TUI_CONFIG() {
    return process.env["LOONGCODE_TUI_CONFIG"]
  },
  get LOONGCODE_CONFIG_DIR() {
    return process.env["LOONGCODE_CONFIG_DIR"]
  },
  get LOONGCODE_PURE() {
    return truthy("LOONGCODE_PURE")
  },
  get LOONGCODE_PERMISSION() {
    return process.env["LOONGCODE_PERMISSION"]
  },
  get LOONGCODE_PLUGIN_META_FILE() {
    return process.env["LOONGCODE_PLUGIN_META_FILE"]
  },
  get LOONGCODE_CLIENT() {
    return process.env["LOONGCODE_CLIENT"] ?? "cli"
  },
}
