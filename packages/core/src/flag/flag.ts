import { Config } from "effect"

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

const copy = process.env["LGCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["LGCODE_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("LGCODE_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  LGCODE_AUTO_HEAP_SNAPSHOT: truthy("LGCODE_AUTO_HEAP_SNAPSHOT"),
  LGCODE_GIT_BASH_PATH: process.env["LGCODE_GIT_BASH_PATH"],
  LGCODE_CONFIG: process.env["LGCODE_CONFIG"],
  LGCODE_CONFIG_CONTENT: process.env["LGCODE_CONFIG_CONTENT"],
  LGCODE_DISABLE_AUTOUPDATE: truthy("LGCODE_DISABLE_AUTOUPDATE"),
  LGCODE_ALWAYS_NOTIFY_UPDATE: truthy("LGCODE_ALWAYS_NOTIFY_UPDATE"),
  LGCODE_DISABLE_PRUNE: truthy("LGCODE_DISABLE_PRUNE"),
  LGCODE_DISABLE_TERMINAL_TITLE: truthy("LGCODE_DISABLE_TERMINAL_TITLE"),
  LGCODE_SHOW_TTFD: truthy("LGCODE_SHOW_TTFD"),
  LGCODE_DISABLE_AUTOCOMPACT: truthy("LGCODE_DISABLE_AUTOCOMPACT"),
  LGCODE_DISABLE_MODELS_FETCH: truthy("LGCODE_DISABLE_MODELS_FETCH"),
  LGCODE_DISABLE_MOUSE: truthy("LGCODE_DISABLE_MOUSE"),
  LGCODE_FAKE_VCS: process.env["LGCODE_FAKE_VCS"],
  LGCODE_SERVER_PASSWORD: process.env["LGCODE_SERVER_PASSWORD"],
  LGCODE_SERVER_USERNAME: process.env["LGCODE_SERVER_USERNAME"],
  LGCODE_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("LGCODE_DISABLE_FFF"),

  // Experimental
  LGCODE_EXPERIMENTAL_FILEWATCHER: Config.boolean("LGCODE_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  LGCODE_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("LGCODE_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  LGCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("LGCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  LGCODE_MODELS_URL: process.env["LGCODE_MODELS_URL"],
  LGCODE_MODELS_PATH: process.env["LGCODE_MODELS_PATH"],
  LGCODE_DB: process.env["LGCODE_DB"],

  LGCODE_WORKSPACE_ID: process.env["LGCODE_WORKSPACE_ID"],
  LGCODE_EXPERIMENTAL_WORKSPACES: enabledByExperimental("LGCODE_EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get LGCODE_DISABLE_PROJECT_CONFIG() {
    return truthy("LGCODE_DISABLE_PROJECT_CONFIG")
  },
  get LGCODE_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("LGCODE_EXPERIMENTAL_REFERENCES")
  },
  get LGCODE_TUI_CONFIG() {
    return process.env["LGCODE_TUI_CONFIG"]
  },
  get LGCODE_CONFIG_DIR() {
    return process.env["LGCODE_CONFIG_DIR"]
  },
  get LGCODE_PURE() {
    return truthy("LGCODE_PURE")
  },
  get LGCODE_PERMISSION() {
    return process.env["LGCODE_PERMISSION"]
  },
  get LGCODE_PLUGIN_META_FILE() {
    return process.env["LGCODE_PLUGIN_META_FILE"]
  },
  get LGCODE_CLIENT() {
    return process.env["LGCODE_CLIENT"] ?? "cli"
  },
}
