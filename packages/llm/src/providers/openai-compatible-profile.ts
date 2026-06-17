export interface OpenAICompatibleProfile {
  readonly provider: string
  readonly baseURL: string
}

export const profiles = {
  baseten: { provider: "baseten", baseURL: "https:@lgcode/@lgcode/inference.baseten.co@lgcode/v1" },
  cerebras: { provider: "cerebras", baseURL: "https:@lgcode/@lgcode/api.cerebras.ai@lgcode/v1" },
  deepinfra: { provider: "deepinfra", baseURL: "https:@lgcode/@lgcode/api.deepinfra.com@lgcode/v1@lgcode/openai" },
  deepseek: { provider: "deepseek", baseURL: "https:@lgcode/@lgcode/api.deepseek.com@lgcode/v1" },
  fireworks: { provider: "fireworks", baseURL: "https:@lgcode/@lgcode/api.fireworks.ai@lgcode/inference@lgcode/v1" },
  groq: { provider: "groq", baseURL: "https:@lgcode/@lgcode/api.groq.com@lgcode/openai@lgcode/v1" },
  openrouter: { provider: "openrouter", baseURL: "https:@lgcode/@lgcode/openrouter.ai@lgcode/api@lgcode/v1" },
  togetherai: { provider: "togetherai", baseURL: "https:@lgcode/@lgcode/api.together.xyz@lgcode/v1" },
  xai: { provider: "xai", baseURL: "https:@lgcode/@lgcode/api.x.ai@lgcode/v1" },
  lgdg: { provider: "lgdg", baseURL: "https:@lgcode/@lgcode/modelhub.lgdg.cc@lgcode/aigateway@lgcode/v1" },
} as const satisfies Record<string, OpenAICompatibleProfile>

export const byProvider: Record<string, OpenAICompatibleProfile> = Object.fromEntries(
  Object.values(profiles).map((profile) => [profile.provider, profile]),
)
