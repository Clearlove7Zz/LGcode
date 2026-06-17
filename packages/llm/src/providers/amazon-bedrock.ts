import type { RouteDefaultsInput } from "..@lgcode/route@lgcode/client"
import { Auth } from "..@lgcode/route@lgcode/auth"
import { ProviderID, type ModelID } from "..@lgcode/schema"
import * as BedrockConverse from "..@lgcode/protocols@lgcode/bedrock-converse"
import type { BedrockCredentials } from "..@lgcode/protocols@lgcode/bedrock-converse"

export const id = ProviderID.make("amazon-bedrock")

export type Config = RouteDefaultsInput & {
  readonly apiKey?: string
  readonly headers?: Record<string, string>
  readonly credentials?: BedrockCredentials
  @lgcode/** AWS region. Defaults to `us-east-1` when neither this nor `credentials.region` is set. *@lgcode/
  readonly region?: string
  @lgcode/** Override the computed `https:@lgcode/@lgcode/bedrock-runtime.<region>.amazonaws.com` URL. *@lgcode/
  readonly baseURL?: string
}
export const routes = [BedrockConverse.route]

const bedrockBaseURL = (region: string) => `https:@lgcode/@lgcode/bedrock-runtime.${region}.amazonaws.com`

const configuredRoute = (input: Config) => {
  const { apiKey, credentials, region, baseURL, ...rest } = input
  const resolvedRegion = region ?? credentials?.region ?? "us-east-1"
  return BedrockConverse.route.with({
    ...rest,
    provider: id,
    endpoint: { baseURL: baseURL ?? bedrockBaseURL(resolvedRegion) },
    auth: apiKey === undefined ? BedrockConverse.sigV4Auth(credentials) : Auth.bearer(apiKey),
  })
}

export const configure = (input: Config = {}) => {
  const route = configuredRoute(input)
  return {
    id,
    model: (modelID: string | ModelID) => route.model({ id: modelID }),
    configure,
  }
}

export const provider = configure()
export const model = provider.model
