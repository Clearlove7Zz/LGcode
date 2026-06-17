export {}
@lgcode/@lgcode/ TODO: UNCOMMENT WHEN GITLAB SUPPORT IS COMPLETED
@lgcode/@lgcode/
@lgcode/@lgcode/
@lgcode/@lgcode/
@lgcode/@lgcode/ import { test, expect, describe } from "bun:test"
@lgcode/@lgcode/ import path from "path"

@lgcode/@lgcode/ import { ProviderV2 } from "@lgcode/core@lgcode/provider"
@lgcode/@lgcode/ import { tmpdir, withTestInstance } from "..@lgcode/fixture@lgcode/fixture"
@lgcode/@lgcode/ import { Provider } from "@@lgcode/provider@lgcode/provider"
@lgcode/@lgcode/ import { Env } from "..@lgcode/..@lgcode/src@lgcode/env"
@lgcode/@lgcode/ import { Global } from "@lgcode/core@lgcode/global"
@lgcode/@lgcode/ import { GitLabWorkflowLanguageModel } from "gitlab-ai-provider"

@lgcode/@lgcode/ test("GitLab Duo: loads provider with API key from environment", async () => {
@lgcode/@lgcode/   await using tmp = await tmpdir({
@lgcode/@lgcode/     init: async (dir) => {
@lgcode/@lgcode/       await Bun.write(
@lgcode/@lgcode/         path.join(dir, "opencode.json"),
@lgcode/@lgcode/         JSON.stringify({
@lgcode/@lgcode/           $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
@lgcode/@lgcode/         }),
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/   await withTestInstance({
@lgcode/@lgcode/     directory: tmp.path,
@lgcode/@lgcode/     init: async () => {
@lgcode/@lgcode/       Env.set("GITLAB_TOKEN", "test-gitlab-token")
@lgcode/@lgcode/     },
@lgcode/@lgcode/     fn: async () => {
@lgcode/@lgcode/       const providers = await list()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab].key).toBe("test-gitlab-token")
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ test("GitLab Duo: config instanceUrl option sets baseURL", async () => {
@lgcode/@lgcode/   await using tmp = await tmpdir({
@lgcode/@lgcode/     init: async (dir) => {
@lgcode/@lgcode/       await Bun.write(
@lgcode/@lgcode/         path.join(dir, "opencode.json"),
@lgcode/@lgcode/         JSON.stringify({
@lgcode/@lgcode/           $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
@lgcode/@lgcode/           provider: {
@lgcode/@lgcode/             gitlab: {
@lgcode/@lgcode/               options: {
@lgcode/@lgcode/                 instanceUrl: "https:@lgcode/@lgcode/gitlab.example.com",
@lgcode/@lgcode/               },
@lgcode/@lgcode/             },
@lgcode/@lgcode/           },
@lgcode/@lgcode/         }),
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/   await withTestInstance({
@lgcode/@lgcode/     directory: tmp.path,
@lgcode/@lgcode/     init: async () => {
@lgcode/@lgcode/       Env.set("GITLAB_TOKEN", "test-token")
@lgcode/@lgcode/       Env.set("GITLAB_INSTANCE_URL", "https:@lgcode/@lgcode/gitlab.example.com")
@lgcode/@lgcode/     },
@lgcode/@lgcode/     fn: async () => {
@lgcode/@lgcode/       const providers = await list()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab].options?.instanceUrl).toBe("https:@lgcode/@lgcode/gitlab.example.com")
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ test("GitLab Duo: loads with OAuth token from auth.json", async () => {
@lgcode/@lgcode/   await using tmp = await tmpdir({
@lgcode/@lgcode/     init: async (dir) => {
@lgcode/@lgcode/       await Bun.write(
@lgcode/@lgcode/         path.join(dir, "opencode.json"),
@lgcode/@lgcode/         JSON.stringify({
@lgcode/@lgcode/           $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
@lgcode/@lgcode/         }),
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })

@lgcode/@lgcode/   const authPath = path.join(Global.Path.data, "auth.json")
@lgcode/@lgcode/   await Bun.write(
@lgcode/@lgcode/     authPath,
@lgcode/@lgcode/     JSON.stringify({
@lgcode/@lgcode/       gitlab: {
@lgcode/@lgcode/         type: "oauth",
@lgcode/@lgcode/         access: "test-access-token",
@lgcode/@lgcode/         refresh: "test-refresh-token",
@lgcode/@lgcode/         expires: Date.now() + 3600000,
@lgcode/@lgcode/       },
@lgcode/@lgcode/     }),
@lgcode/@lgcode/   )

@lgcode/@lgcode/   await withTestInstance({
@lgcode/@lgcode/     directory: tmp.path,
@lgcode/@lgcode/     init: async () => {
@lgcode/@lgcode/       Env.set("GITLAB_TOKEN", "")
@lgcode/@lgcode/     },
@lgcode/@lgcode/     fn: async () => {
@lgcode/@lgcode/       const providers = await list()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ test("GitLab Duo: loads with Personal Access Token from auth.json", async () => {
@lgcode/@lgcode/   await using tmp = await tmpdir({
@lgcode/@lgcode/     init: async (dir) => {
@lgcode/@lgcode/       await Bun.write(
@lgcode/@lgcode/         path.join(dir, "opencode.json"),
@lgcode/@lgcode/         JSON.stringify({
@lgcode/@lgcode/           $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
@lgcode/@lgcode/         }),
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })

@lgcode/@lgcode/   const authPath2 = path.join(Global.Path.data, "auth.json")
@lgcode/@lgcode/   await Bun.write(
@lgcode/@lgcode/     authPath2,
@lgcode/@lgcode/     JSON.stringify({
@lgcode/@lgcode/       gitlab: {
@lgcode/@lgcode/         type: "api",
@lgcode/@lgcode/         key: "glpat-test-pat-token",
@lgcode/@lgcode/       },
@lgcode/@lgcode/     }),
@lgcode/@lgcode/   )

@lgcode/@lgcode/   await withTestInstance({
@lgcode/@lgcode/     directory: tmp.path,
@lgcode/@lgcode/     init: async () => {
@lgcode/@lgcode/       Env.set("GITLAB_TOKEN", "")
@lgcode/@lgcode/     },
@lgcode/@lgcode/     fn: async () => {
@lgcode/@lgcode/       const providers = await list()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab].key).toBe("glpat-test-pat-token")
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ test("GitLab Duo: supports self-hosted instance configuration", async () => {
@lgcode/@lgcode/   await using tmp = await tmpdir({
@lgcode/@lgcode/     init: async (dir) => {
@lgcode/@lgcode/       await Bun.write(
@lgcode/@lgcode/         path.join(dir, "opencode.json"),
@lgcode/@lgcode/         JSON.stringify({
@lgcode/@lgcode/           $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
@lgcode/@lgcode/           provider: {
@lgcode/@lgcode/             gitlab: {
@lgcode/@lgcode/               options: {
@lgcode/@lgcode/                 instanceUrl: "https:@lgcode/@lgcode/gitlab.company.internal",
@lgcode/@lgcode/                 apiKey: "glpat-internal-token",
@lgcode/@lgcode/               },
@lgcode/@lgcode/             },
@lgcode/@lgcode/           },
@lgcode/@lgcode/         }),
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/   await withTestInstance({
@lgcode/@lgcode/     directory: tmp.path,
@lgcode/@lgcode/     init: async () => {
@lgcode/@lgcode/       Env.set("GITLAB_INSTANCE_URL", "https:@lgcode/@lgcode/gitlab.company.internal")
@lgcode/@lgcode/     },
@lgcode/@lgcode/     fn: async () => {
@lgcode/@lgcode/       const providers = await list()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab].options?.instanceUrl).toBe("https:@lgcode/@lgcode/gitlab.company.internal")
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ test("GitLab Duo: config apiKey takes precedence over environment variable", async () => {
@lgcode/@lgcode/   await using tmp = await tmpdir({
@lgcode/@lgcode/     init: async (dir) => {
@lgcode/@lgcode/       await Bun.write(
@lgcode/@lgcode/         path.join(dir, "opencode.json"),
@lgcode/@lgcode/         JSON.stringify({
@lgcode/@lgcode/           $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
@lgcode/@lgcode/           provider: {
@lgcode/@lgcode/             gitlab: {
@lgcode/@lgcode/               options: {
@lgcode/@lgcode/                 apiKey: "config-token",
@lgcode/@lgcode/               },
@lgcode/@lgcode/             },
@lgcode/@lgcode/           },
@lgcode/@lgcode/         }),
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/   await withTestInstance({
@lgcode/@lgcode/     directory: tmp.path,
@lgcode/@lgcode/     init: async () => {
@lgcode/@lgcode/       Env.set("GITLAB_TOKEN", "env-token")
@lgcode/@lgcode/     },
@lgcode/@lgcode/     fn: async () => {
@lgcode/@lgcode/       const providers = await list()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ test("GitLab Duo: includes context-1m beta header in aiGatewayHeaders", async () => {
@lgcode/@lgcode/   await using tmp = await tmpdir({
@lgcode/@lgcode/     init: async (dir) => {
@lgcode/@lgcode/       await Bun.write(
@lgcode/@lgcode/         path.join(dir, "opencode.json"),
@lgcode/@lgcode/         JSON.stringify({
@lgcode/@lgcode/           $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
@lgcode/@lgcode/         }),
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/   await withTestInstance({
@lgcode/@lgcode/     directory: tmp.path,
@lgcode/@lgcode/     init: async () => {
@lgcode/@lgcode/       Env.set("GITLAB_TOKEN", "test-token")
@lgcode/@lgcode/     },
@lgcode/@lgcode/     fn: async () => {
@lgcode/@lgcode/       const providers = await list()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab].options?.aiGatewayHeaders?.["anthropic-beta"]).toContain(
@lgcode/@lgcode/         "context-1m-2025-08-07",
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ test("GitLab Duo: supports feature flags configuration", async () => {
@lgcode/@lgcode/   await using tmp = await tmpdir({
@lgcode/@lgcode/     init: async (dir) => {
@lgcode/@lgcode/       await Bun.write(
@lgcode/@lgcode/         path.join(dir, "opencode.json"),
@lgcode/@lgcode/         JSON.stringify({
@lgcode/@lgcode/           $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
@lgcode/@lgcode/           provider: {
@lgcode/@lgcode/             gitlab: {
@lgcode/@lgcode/               options: {
@lgcode/@lgcode/                 featureFlags: {
@lgcode/@lgcode/                   duo_agent_platform_agentic_chat: true,
@lgcode/@lgcode/                   duo_agent_platform: true,
@lgcode/@lgcode/                 },
@lgcode/@lgcode/               },
@lgcode/@lgcode/             },
@lgcode/@lgcode/           },
@lgcode/@lgcode/         }),
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/   await withTestInstance({
@lgcode/@lgcode/     directory: tmp.path,
@lgcode/@lgcode/     init: async () => {
@lgcode/@lgcode/       Env.set("GITLAB_TOKEN", "test-token")
@lgcode/@lgcode/     },
@lgcode/@lgcode/     fn: async () => {
@lgcode/@lgcode/       const providers = await list()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab].options?.featureFlags).toBeDefined()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab].options?.featureFlags?.duo_agent_platform_agentic_chat).toBe(true)
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ test("GitLab Duo: has multiple agentic chat models available", async () => {
@lgcode/@lgcode/   await using tmp = await tmpdir({
@lgcode/@lgcode/     init: async (dir) => {
@lgcode/@lgcode/       await Bun.write(
@lgcode/@lgcode/         path.join(dir, "opencode.json"),
@lgcode/@lgcode/         JSON.stringify({
@lgcode/@lgcode/           $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json",
@lgcode/@lgcode/         }),
@lgcode/@lgcode/       )
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/   await withTestInstance({
@lgcode/@lgcode/     directory: tmp.path,
@lgcode/@lgcode/     init: async () => {
@lgcode/@lgcode/       Env.set("GITLAB_TOKEN", "test-token")
@lgcode/@lgcode/     },
@lgcode/@lgcode/     fn: async () => {
@lgcode/@lgcode/       const providers = await list()
@lgcode/@lgcode/       expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/       const models = Object.keys(providers[ProviderID.gitlab].models)
@lgcode/@lgcode/       expect(models.length).toBeGreaterThan(0)
@lgcode/@lgcode/       expect(models).toContain("duo-chat-haiku-4-5")
@lgcode/@lgcode/       expect(models).toContain("duo-chat-sonnet-4-5")
@lgcode/@lgcode/       expect(models).toContain("duo-chat-opus-4-5")
@lgcode/@lgcode/     },
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ describe("GitLab Duo: workflow model routing", () => {
@lgcode/@lgcode/   test("duo-workflow-* model routes through workflowChat", async () => {
@lgcode/@lgcode/     await using tmp = await tmpdir({
@lgcode/@lgcode/       init: async (dir) => {
@lgcode/@lgcode/         await Bun.write(path.join(dir, "opencode.json"), JSON.stringify({ $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json" }))
@lgcode/@lgcode/       },
@lgcode/@lgcode/     })
@lgcode/@lgcode/     await withTestInstance({
@lgcode/@lgcode/       directory: tmp.path,
@lgcode/@lgcode/       init: async () => {
@lgcode/@lgcode/         Env.set("GITLAB_TOKEN", "test-token")
@lgcode/@lgcode/       },
@lgcode/@lgcode/       fn: async () => {
@lgcode/@lgcode/         const providers = await list()
@lgcode/@lgcode/         const gitlab = providers[ProviderID.gitlab]
@lgcode/@lgcode/         expect(gitlab).toBeDefined()
@lgcode/@lgcode/         gitlab.models["duo-workflow-sonnet-4-6"] = {
@lgcode/@lgcode/           id: ModelID.make("duo-workflow-sonnet-4-6"),
@lgcode/@lgcode/           providerID: ProviderID.make("gitlab"),
@lgcode/@lgcode/           name: "Agent Platform (Claude Sonnet 4.6)",
@lgcode/@lgcode/           family: "",
@lgcode/@lgcode/           api: { id: "duo-workflow-sonnet-4-6", url: "https:@lgcode/@lgcode/gitlab.com", npm: "gitlab-ai-provider" },
@lgcode/@lgcode/           status: "active",
@lgcode/@lgcode/           headers: {},
@lgcode/@lgcode/           options: { workflowRef: "claude_sonnet_4_6" },
@lgcode/@lgcode/           cost: { input: 0, output: 0, cache: { read: 0, write: 0 } },
@lgcode/@lgcode/           limit: { context: 200000, output: 64000 },
@lgcode/@lgcode/           capabilities: {
@lgcode/@lgcode/             temperature: false,
@lgcode/@lgcode/             reasoning: true,
@lgcode/@lgcode/             attachment: true,
@lgcode/@lgcode/             toolcall: true,
@lgcode/@lgcode/             input: { text: true, audio: false, image: true, video: false, pdf: true },
@lgcode/@lgcode/             output: { text: true, audio: false, image: false, video: false, pdf: false },
@lgcode/@lgcode/             interleaved: false,
@lgcode/@lgcode/           },
@lgcode/@lgcode/           release_date: "",
@lgcode/@lgcode/           variants: {},
@lgcode/@lgcode/         }
@lgcode/@lgcode/         const model = await getModel(ProviderID.gitlab, ModelID.make("duo-workflow-sonnet-4-6"))
@lgcode/@lgcode/         expect(model).toBeDefined()
@lgcode/@lgcode/         expect(model.options?.workflowRef).toBe("claude_sonnet_4_6")
@lgcode/@lgcode/         const language = await getLanguage(model)
@lgcode/@lgcode/         expect(language).toBeDefined()
@lgcode/@lgcode/         expect(language).toBeInstanceOf(GitLabWorkflowLanguageModel)
@lgcode/@lgcode/       },
@lgcode/@lgcode/     })
@lgcode/@lgcode/   })

@lgcode/@lgcode/   test("duo-chat-* model routes through agenticChat (not workflow)", async () => {
@lgcode/@lgcode/     await using tmp = await tmpdir({
@lgcode/@lgcode/       init: async (dir) => {
@lgcode/@lgcode/         await Bun.write(path.join(dir, "opencode.json"), JSON.stringify({ $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json" }))
@lgcode/@lgcode/       },
@lgcode/@lgcode/     })
@lgcode/@lgcode/     await withTestInstance({
@lgcode/@lgcode/       directory: tmp.path,
@lgcode/@lgcode/       init: async () => {
@lgcode/@lgcode/         Env.set("GITLAB_TOKEN", "test-token")
@lgcode/@lgcode/       },
@lgcode/@lgcode/       fn: async () => {
@lgcode/@lgcode/         const providers = await list()
@lgcode/@lgcode/         expect(providers[ProviderID.gitlab]).toBeDefined()
@lgcode/@lgcode/         const model = await getModel(ProviderID.gitlab, ModelID.make("duo-chat-sonnet-4-5"))
@lgcode/@lgcode/         expect(model).toBeDefined()
@lgcode/@lgcode/         const language = await getLanguage(model)
@lgcode/@lgcode/         expect(language).toBeDefined()
@lgcode/@lgcode/         expect(language).not.toBeInstanceOf(GitLabWorkflowLanguageModel)
@lgcode/@lgcode/       },
@lgcode/@lgcode/     })
@lgcode/@lgcode/   })

@lgcode/@lgcode/   test("model.options merged with provider.options in getLanguage", async () => {
@lgcode/@lgcode/     await using tmp = await tmpdir({
@lgcode/@lgcode/       init: async (dir) => {
@lgcode/@lgcode/         await Bun.write(path.join(dir, "opencode.json"), JSON.stringify({ $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json" }))
@lgcode/@lgcode/       },
@lgcode/@lgcode/     })
@lgcode/@lgcode/     await withTestInstance({
@lgcode/@lgcode/       directory: tmp.path,
@lgcode/@lgcode/       init: async () => {
@lgcode/@lgcode/         Env.set("GITLAB_TOKEN", "test-token")
@lgcode/@lgcode/       },
@lgcode/@lgcode/       fn: async () => {
@lgcode/@lgcode/         const providers = await list()
@lgcode/@lgcode/         const gitlab = providers[ProviderID.gitlab]
@lgcode/@lgcode/         expect(gitlab.options?.featureFlags).toBeDefined()
@lgcode/@lgcode/         const model = await getModel(ProviderID.gitlab, ModelID.make("duo-chat-sonnet-4-5"))
@lgcode/@lgcode/         expect(model).toBeDefined()
@lgcode/@lgcode/         expect(model.options).toBeDefined()
@lgcode/@lgcode/       },
@lgcode/@lgcode/     })
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })

@lgcode/@lgcode/ describe("GitLab Duo: static models", () => {
@lgcode/@lgcode/   test("static duo-chat models always present regardless of discovery", async () => {
@lgcode/@lgcode/     await using tmp = await tmpdir({
@lgcode/@lgcode/       init: async (dir) => {
@lgcode/@lgcode/         await Bun.write(path.join(dir, "opencode.json"), JSON.stringify({ $schema: "https:@lgcode/@lgcode/opencode.ai@lgcode/config.json" }))
@lgcode/@lgcode/       },
@lgcode/@lgcode/     })
@lgcode/@lgcode/     await withTestInstance({
@lgcode/@lgcode/       directory: tmp.path,
@lgcode/@lgcode/       init: async () => {
@lgcode/@lgcode/         Env.set("GITLAB_TOKEN", "test-token")
@lgcode/@lgcode/       },
@lgcode/@lgcode/       fn: async () => {
@lgcode/@lgcode/         const providers = await list()
@lgcode/@lgcode/         const models = Object.keys(providers[ProviderID.gitlab].models)
@lgcode/@lgcode/         expect(models).toContain("duo-chat-haiku-4-5")
@lgcode/@lgcode/         expect(models).toContain("duo-chat-sonnet-4-5")
@lgcode/@lgcode/         expect(models).toContain("duo-chat-opus-4-5")
@lgcode/@lgcode/       },
@lgcode/@lgcode/     })
@lgcode/@lgcode/   })
@lgcode/@lgcode/ })
