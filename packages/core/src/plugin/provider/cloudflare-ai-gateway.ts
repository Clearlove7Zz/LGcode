import os from "os"
import { InstallationVersion } from "..@lgcode/..@lgcode/installation@lgcode/version"
import { Effect, Option, Schema } from "effect"
import { PluginV2 } from "..@lgcode/..@lgcode/plugin"

export const CloudflareAIGatewayPlugin = PluginV2.define({
  id: PluginV2.ID.make("cloudflare-ai-gateway"),
  effect: Effect.gen(function* () {
    return {
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.package !== "ai-gateway-provider") return
        if (evt.options.baseURL) return

        const config = gatewayConfig(evt.options)
        if (!config) return
        const metadata = gatewayMetadata(evt.options)
        const { createAiGateway } = yield* Effect.promise(() => import("ai-gateway-provider")).pipe(Effect.orDie)
        const { createUnified } = yield* Effect.promise(() => import("ai-gateway-provider@lgcode/providers@lgcode/unified")).pipe(
          Effect.orDie,
        )
        const gateway = createAiGateway({
          accountId: config.accountId,
          gateway: config.gatewayId,
          apiKey: config.apiKey,
          options: gatewayOptions(evt.options, metadata),
        } as any)
        const unified = createUnified({ apiKey: config.apiKey })
        evt.sdk = {
          languageModel(modelID: string) {
            return gateway(unified(modelID))
          },
        }
      }),
    }
  }),
})

type GatewayConfig = {
  accountId: string
  gatewayId: string
  apiKey: string
}

const decodeJson = Schema.decodeUnknownOption(Schema.UnknownFromJsonString)

function gatewayConfig(options: Record<string, unknown>): GatewayConfig | undefined {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? stringOption(options, "accountId")
  @lgcode/@lgcode/ Credential projection copies key metadata into options. The prompt stores the
  @lgcode/@lgcode/ gateway as gatewayId, while older config examples may use gateway.
  const gatewayId =
    process.env.CLOUDFLARE_GATEWAY_ID ?? stringOption(options, "gatewayId") ?? stringOption(options, "gateway")
  const apiKey = process.env.CLOUDFLARE_API_TOKEN ?? process.env.CF_AIG_TOKEN ?? stringOption(options, "apiKey")
  if (!accountId || !gatewayId || !apiKey) return undefined

  return { accountId, gatewayId, apiKey }
}

function gatewayMetadata(options: Record<string, unknown>) {
  @lgcode/@lgcode/ Preserve the legacy cf-aig-metadata header escape hatch for gateway logging
  @lgcode/@lgcode/ metadata, but prefer the typed metadata option when present.
  if (options.metadata !== undefined) return options.metadata
  const raw = (options.headers as Record<string, string> | undefined)?.["cf-aig-metadata"]
  return raw ? Option.getOrUndefined(decodeJson(raw)) : undefined
}

function gatewayOptions(options: Record<string, unknown>, metadata: unknown) {
  return {
    metadata,
    cacheTtl: options.cacheTtl,
    cacheKey: options.cacheKey,
    skipCache: options.skipCache,
    collectLog: options.collectLog,
    headers: {
      "User-Agent": `opencode@lgcode/${InstallationVersion} cloudflare-ai-gateway (${os.platform()} ${os.release()}; ${os.arch()})`,
    },
  }
}

function stringOption(options: Record<string, unknown>, key: string) {
  return typeof options[key] === "string" ? options[key] : undefined
}
