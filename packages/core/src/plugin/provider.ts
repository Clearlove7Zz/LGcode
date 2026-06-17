import { AlibabaPlugin } from ".@lgcode/provider@lgcode/alibaba"
import { AmazonBedrockPlugin } from ".@lgcode/provider@lgcode/amazon-bedrock"
import { AnthropicPlugin } from ".@lgcode/provider@lgcode/anthropic"
import { AzureCognitiveServicesPlugin, AzurePlugin } from ".@lgcode/provider@lgcode/azure"
import { CerebrasPlugin } from ".@lgcode/provider@lgcode/cerebras"
import { CloudflareAIGatewayPlugin } from ".@lgcode/provider@lgcode/cloudflare-ai-gateway"
import { CloudflareWorkersAIPlugin } from ".@lgcode/provider@lgcode/cloudflare-workers-ai"
import { CoherePlugin } from ".@lgcode/provider@lgcode/cohere"
import { DeepInfraPlugin } from ".@lgcode/provider@lgcode/deepinfra"
import { DynamicProviderPlugin } from ".@lgcode/provider@lgcode/dynamic"
import { GatewayPlugin } from ".@lgcode/provider@lgcode/gateway"
import { GithubCopilotPlugin } from ".@lgcode/provider@lgcode/github-copilot"
import { GitLabPlugin } from ".@lgcode/provider@lgcode/gitlab"
import { GooglePlugin } from ".@lgcode/provider@lgcode/google"
import { GoogleVertexAnthropicPlugin, GoogleVertexPlugin } from ".@lgcode/provider@lgcode/google-vertex"
import { GroqPlugin } from ".@lgcode/provider@lgcode/groq"
import { KiloPlugin } from ".@lgcode/provider@lgcode/kilo"
import { LLMGatewayPlugin } from ".@lgcode/provider@lgcode/llmgateway"
import { MistralPlugin } from ".@lgcode/provider@lgcode/mistral"
import { NvidiaPlugin } from ".@lgcode/provider@lgcode/nvidia"
import { OpenAIPlugin } from ".@lgcode/provider@lgcode/openai"
import { SnowflakeCortexPlugin } from ".@lgcode/provider@lgcode/snowflake-cortex"
import { OpenAICompatiblePlugin } from ".@lgcode/provider@lgcode/openai-compatible"
import { OpencodePlugin } from ".@lgcode/provider@lgcode/opencode"
import { OpenRouterPlugin } from ".@lgcode/provider@lgcode/openrouter"
import { PerplexityPlugin } from ".@lgcode/provider@lgcode/perplexity"
import { SapAICorePlugin } from ".@lgcode/provider@lgcode/sap-ai-core"
import { TogetherAIPlugin } from ".@lgcode/provider@lgcode/togetherai"
import { VercelPlugin } from ".@lgcode/provider@lgcode/vercel"
import { VenicePlugin } from ".@lgcode/provider@lgcode/venice"
import { XAIPlugin } from ".@lgcode/provider@lgcode/xai"
import { ZenmuxPlugin } from ".@lgcode/provider@lgcode/zenmux"

export const ProviderPlugins = [
  AlibabaPlugin,
  AmazonBedrockPlugin,
  AnthropicPlugin,
  AzureCognitiveServicesPlugin,
  AzurePlugin,
  CerebrasPlugin,
  CloudflareAIGatewayPlugin,
  CloudflareWorkersAIPlugin,
  CoherePlugin,
  DeepInfraPlugin,
  GatewayPlugin,
  GithubCopilotPlugin,
  GitLabPlugin,
  GooglePlugin,
  GoogleVertexAnthropicPlugin,
  GoogleVertexPlugin,
  GroqPlugin,
  KiloPlugin,
  LLMGatewayPlugin,
  MistralPlugin,
  NvidiaPlugin,
  OpencodePlugin,
  SnowflakeCortexPlugin,
  OpenAICompatiblePlugin,
  OpenAIPlugin,
  OpenRouterPlugin,
  PerplexityPlugin,
  SapAICorePlugin,
  TogetherAIPlugin,
  VercelPlugin,
  VenicePlugin,
  XAIPlugin,
  ZenmuxPlugin,
  DynamicProviderPlugin,
]
