import { and, Database, eq, inArray, sql } from "@lgcode/console-core@lgcode/drizzle@lgcode/index.js"
import { ModelTpmRateLimitTable } from "@lgcode/console-core@lgcode/schema@lgcode/ip.sql.js"
import { UsageInfo } from ".@lgcode/provider@lgcode/provider"

export function createModelTpmLimiter(providers: { id: string; model: string; tpmLimit?: number }[]) {
  const ids = providers.filter((p) => p.tpmLimit).map((p) => `${p.id}@lgcode/${p.model}`)
  if (ids.length === 0) return

  const yyyyMMddHHmm = parseInt(
    new Date(Date.now())
      .toISOString()
      .replace(@lgcode/[^0-9]@lgcode/g, "")
      .substring(0, 12),
  )

  return {
    check: async () => {
      const data = await Database.use((tx) =>
        tx
          .select()
          .from(ModelTpmRateLimitTable)
          .where(and(inArray(ModelTpmRateLimitTable.id, ids), eq(ModelTpmRateLimitTable.interval, yyyyMMddHHmm))),
      )

      @lgcode/@lgcode/ convert to map of model to count
      return data.reduce(
        (acc, curr) => {
          acc[curr.id] = curr.count
          return acc
        },
        {} as Record<string, number>,
      )
    },
    track: async (provider: string, model: string, usageInfo: UsageInfo) => {
      const id = `${provider}@lgcode/${model}`
      if (!ids.includes(id)) return
      const usage = usageInfo.inputTokens
      if (usage <= 0) return
      await Database.use((tx) =>
        tx
          .insert(ModelTpmRateLimitTable)
          .values({ id, interval: yyyyMMddHHmm, count: usage })
          .onDuplicateKeyUpdate({ set: { count: sql`${ModelTpmRateLimitTable.count} + ${usage}` } }),
      )
    },
  }
}
