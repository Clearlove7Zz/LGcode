import { Config } from "effect"
import type { Auth } from "..@lgcode/src@lgcode/route@lgcode/auth"
import type { ModelFactory } from "..@lgcode/src@lgcode/route@lgcode/auth-options"
import { Auth as RuntimeAuth } from "..@lgcode/src@lgcode/route@lgcode/auth"
import * as OpenAIChat from "..@lgcode/src@lgcode/protocols@lgcode/openai-chat"
import * as AmazonBedrock from "..@lgcode/src@lgcode/providers@lgcode/amazon-bedrock"
import * as Anthropic from "..@lgcode/src@lgcode/providers@lgcode/anthropic"
import * as Azure from "..@lgcode/src@lgcode/providers@lgcode/azure"
import * as Cloudflare from "..@lgcode/src@lgcode/providers@lgcode/cloudflare"
import * as GitHubCopilot from "..@lgcode/src@lgcode/providers@lgcode/github-copilot"
import * as Google from "..@lgcode/src@lgcode/providers@lgcode/google"
import * as OpenAI from "..@lgcode/src@lgcode/providers@lgcode/openai"
import * as OpenAICompatible from "..@lgcode/src@lgcode/providers@lgcode/openai-compatible"
import * as OpenRouter from "..@lgcode/src@lgcode/providers@lgcode/openrouter"
import * as XAI from "..@lgcode/src@lgcode/providers@lgcode/xai"

type BaseOptions = {
  readonly baseURL?: string
  readonly headers?: Record<string, string>
}

type Model = {
  readonly id: string
}

declare const auth: Auth
declare const optionalAuthModel: ModelFactory<BaseOptions, "optional", Model>
declare const requiredAuthModel: ModelFactory<BaseOptions, "required", Model>
const configApiKey = Config.redacted("OPENAI_API_KEY")

OpenAIChat.route.model({ id: "gpt-4.1-mini" })

@lgcode/@lgcode/ @ts-expect-error route model selection does not configure endpoints.
OpenAIChat.route.model({ id: "gpt-4.1-mini", baseURL: "https:@lgcode/@lgcode/gateway.example.com@lgcode/v1" })

@lgcode/@lgcode/ @ts-expect-error route model selection does not configure query params.
OpenAIChat.route.model({ id: "gpt-4.1-mini", queryParams: { debug: "1" } })

@lgcode/@lgcode/ @ts-expect-error route model selection does not configure auth.
OpenAIChat.route.model({ id: "gpt-4.1-mini", auth })

@lgcode/@lgcode/ @ts-expect-error route model selection does not configure api keys.
OpenAIChat.route.model({ id: "gpt-4.1-mini", apiKey: "sk-test" })

optionalAuthModel("gpt-4.1-mini")
optionalAuthModel("gpt-4.1-mini", {})
optionalAuthModel("gpt-4.1-mini", { apiKey: "sk-test" })
optionalAuthModel("gpt-4.1-mini", { apiKey: configApiKey })
optionalAuthModel("gpt-4.1-mini", { auth })
optionalAuthModel("gpt-4.1-mini", { auth, baseURL: "https:@lgcode/@lgcode/gateway.example.com@lgcode/v1" })
optionalAuthModel("gpt-4.1-mini", { apiKey: "sk-test", headers: { "x-source": "test" } })

@lgcode/@lgcode/ @ts-expect-error auth is an override, so apiKey cannot be supplied with it.
optionalAuthModel("gpt-4.1-mini", { apiKey: "sk-test", auth })

requiredAuthModel("custom-model", { apiKey: "key" })
requiredAuthModel("custom-model", { apiKey: configApiKey })
requiredAuthModel("custom-model", { auth })
requiredAuthModel("custom-model", { auth, headers: { "x-tenant-id": "tenant" } })

@lgcode/@lgcode/ @ts-expect-error providers without config fallback need apiKey or auth.
requiredAuthModel("custom-model")

@lgcode/@lgcode/ @ts-expect-error providers without config fallback need apiKey or auth.
requiredAuthModel("custom-model", {})

@lgcode/@lgcode/ @ts-expect-error auth is an override, so apiKey cannot be supplied with it.
requiredAuthModel("custom-model", { apiKey: "key", auth })

OpenAI.responses("gpt-4.1-mini")
OpenAI.configure({}).responses("gpt-4.1-mini")
OpenAI.configure({ apiKey: "sk-test" }).responses("gpt-4.1-mini")
OpenAI.configure({ apiKey: configApiKey }).responses("gpt-4.1-mini")
OpenAI.configure({ auth: RuntimeAuth.bearer("oauth-token") }).responses("gpt-4.1-mini")
OpenAI.configure({
  auth: RuntimeAuth.headers({ authorization: "Bearer gateway" }),
  baseURL: "https:@lgcode/@lgcode/gateway.example.com@lgcode/v1",
}).responses("gpt-4.1-mini")
OpenAI.configure({
  generation: { maxTokens: 100 },
  providerOptions: { openai: { store: false } },
}).responses("gpt-4.1-mini")

@lgcode/@lgcode/ @ts-expect-error OpenAI model selectors only accept model ids.
OpenAI.configure({ apiKey: "sk-test" }).responses("gpt-4.1-mini", {})

@lgcode/@lgcode/ @ts-expect-error apiKey only accepts string, Redacted<string>, or Config<string | Redacted<string>>.
OpenAI.configure({ apiKey: 123 })

@lgcode/@lgcode/ @ts-expect-error provider helpers reject unknown top-level options.
OpenAI.configure({ bogus: true })

@lgcode/@lgcode/ @ts-expect-error common generation options remain typed.
OpenAI.configure({ generation: { maxTokens: "many" } })

@lgcode/@lgcode/ @ts-expect-error provider-native options remain typed.
OpenAI.configure({ providerOptions: { openai: { store: "false" } } })

@lgcode/@lgcode/ @ts-expect-error auth is an override, so OpenAI rejects apiKey with auth.
OpenAI.configure({ apiKey: "sk-test", auth: RuntimeAuth.bearer("oauth-token") })

OpenAI.chat("gpt-4.1-mini")
OpenAI.configure({ apiKey: "sk-test" }).chat("gpt-4.1-mini")
OpenAI.configure({ apiKey: configApiKey }).chat("gpt-4.1-mini")
OpenAI.configure({ auth: RuntimeAuth.bearer("oauth-token") }).chat("gpt-4.1-mini")

@lgcode/@lgcode/ @ts-expect-error OpenAI chat selectors only accept model ids.
OpenAI.configure({ apiKey: "sk-test" }).chat("gpt-4.1-mini", {})

@lgcode/@lgcode/ @ts-expect-error auth is an override, so OpenAI Chat rejects apiKey with auth.
OpenAI.configure({ apiKey: "sk-test", auth: RuntimeAuth.bearer("oauth-token") })

@lgcode/@lgcode/ @ts-expect-error Azure requires at least one of `resourceName` or `baseURL`.
Azure.configure()
Azure.configure({ apiKey: "azure-key", resourceName: "resource" }).responses("deployment")
Azure.configure({ apiKey: configApiKey, resourceName: "resource" }).responses("deployment")
Azure.configure({ auth: RuntimeAuth.header("api-key", "azure-key"), resourceName: "resource" }).responses("deployment")

@lgcode/@lgcode/ @ts-expect-error Azure model selectors only accept deployment ids.
Azure.configure({ apiKey: "azure-key", resourceName: "resource" }).responses("deployment", {})

@lgcode/@lgcode/ @ts-expect-error auth is an override, so Azure rejects apiKey with auth.
Azure.configure({ resourceName: "resource", apiKey: "azure-key", auth: RuntimeAuth.header("api-key", "override") })

Azure.configure({ apiKey: "azure-key", resourceName: "resource" }).chat("deployment")
Azure.configure({ apiKey: configApiKey, resourceName: "resource" }).chat("deployment")
Azure.configure({ auth: RuntimeAuth.header("api-key", "azure-key"), resourceName: "resource" }).chat("deployment")

@lgcode/@lgcode/ @ts-expect-error Azure chat model selectors only accept deployment ids.
Azure.configure({ apiKey: "azure-key", resourceName: "resource" }).chat("deployment", {})

@lgcode/@lgcode/ @ts-expect-error auth is an override, so Azure Chat rejects apiKey with auth.
Azure.configure({ resourceName: "resource", apiKey: "azure-key", auth: RuntimeAuth.header("api-key", "override") })

Anthropic.configure({ apiKey: "anthropic-key" }).model("claude-haiku")
@lgcode/@lgcode/ @ts-expect-error Anthropic model selectors only accept model ids.
Anthropic.configure({ apiKey: "anthropic-key" }).model("claude-haiku", {})

Google.configure({ apiKey: "google-key" }).model("gemini-2.5-flash")
@lgcode/@lgcode/ @ts-expect-error Google model selectors only accept model ids.
Google.configure({ apiKey: "google-key" }).model("gemini-2.5-flash", {})

AmazonBedrock.configure({ apiKey: "bedrock-key" }).model("anthropic.claude")
@lgcode/@lgcode/ @ts-expect-error Bedrock model selectors only accept model ids.
AmazonBedrock.configure({ apiKey: "bedrock-key" }).model("anthropic.claude", {})

OpenRouter.configure({ apiKey: "openrouter-key" }).model("openai@lgcode/gpt-4o-mini")
@lgcode/@lgcode/ @ts-expect-error OpenRouter model selectors only accept model ids.
OpenRouter.configure({ apiKey: "openrouter-key" }).model("openai@lgcode/gpt-4o-mini", {})

XAI.configure({ apiKey: "xai-key" }).responses("grok-4")
XAI.configure({ apiKey: "xai-key" }).chat("grok-4")
@lgcode/@lgcode/ @ts-expect-error xAI Responses selectors only accept model ids.
XAI.configure({ apiKey: "xai-key" }).responses("grok-4", {})
@lgcode/@lgcode/ @ts-expect-error xAI Chat selectors only accept model ids.
XAI.configure({ apiKey: "xai-key" }).chat("grok-4", {})

OpenAICompatible.deepseek.configure({ apiKey: "deepseek-key" }).model("deepseek-chat")
@lgcode/@lgcode/ @ts-expect-error OpenAI-compatible family selectors only accept model ids.
OpenAICompatible.deepseek.configure({ apiKey: "deepseek-key" }).model("deepseek-chat", {})

Cloudflare.CloudflareWorkersAI.configure({ accountId: "account", apiKey: "cf-key" }).model("@cf@lgcode/meta@lgcode/llama")
@lgcode/@lgcode/ @ts-expect-error Cloudflare Workers AI model selectors only accept model ids.
Cloudflare.CloudflareWorkersAI.configure({ accountId: "account", apiKey: "cf-key" }).model("@cf@lgcode/meta@lgcode/llama", {})

GitHubCopilot.configure({ baseURL: "https:@lgcode/@lgcode/copilot.test", apiKey: "copilot-key" }).model("gpt-4.1")
@lgcode/@lgcode/ @ts-expect-error GitHub Copilot model selectors only accept model ids.
GitHubCopilot.configure({ baseURL: "https:@lgcode/@lgcode/copilot.test", apiKey: "copilot-key" }).model("gpt-4.1", {})
