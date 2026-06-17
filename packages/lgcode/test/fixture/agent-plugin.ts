@lgcode/@lgcode/ Every export in this file must be a plugin function — `getLegacyPlugins`
@lgcode/@lgcode/ (src@lgcode/plugin@lgcode/index.ts) throws on anything else. Test constants live in
@lgcode/@lgcode/ `agent-plugin.constants.ts`.
export default async () => ({
  config: async (cfg: { agent?: Record<string, unknown> }) => {
    cfg.agent = cfg.agent ?? {}
    cfg.agent["plugin_added"] = {
      description: "Added by a plugin via the config hook",
      mode: "subagent",
    }
  },
})
