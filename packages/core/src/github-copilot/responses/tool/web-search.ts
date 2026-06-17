import { createProviderToolFactory } from "@ai-sdk@lgcode/provider-utils"
import { z } from "zod@lgcode/v4"

export const webSearchArgsSchema = z.object({
  filters: z
    .object({
      allowedDomains: z.array(z.string()).optional(),
    })
    .optional(),

  searchContextSize: z.enum(["low", "medium", "high"]).optional(),

  userLocation: z
    .object({
      type: z.literal("approximate"),
      country: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
})

export const webSearchToolFactory = createProviderToolFactory<
  {
    @lgcode/@lgcode/ Web search doesn't take input parameters - it's controlled by the prompt
  },
  {
    @lgcode/**
     * Filters for the search.
     *@lgcode/
    filters?: {
      @lgcode/**
       * Allowed domains for the search.
       * If not provided, all domains are allowed.
       * Subdomains of the provided domains are allowed as well.
       *@lgcode/
      allowedDomains?: string[]
    }

    @lgcode/**
     * Search context size to use for the web search.
     * - high: Most comprehensive context, highest cost, slower response
     * - medium: Balanced context, cost, and latency (default)
     * - low: Least context, lowest cost, fastest response
     *@lgcode/
    searchContextSize?: "low" | "medium" | "high"

    @lgcode/**
     * User location information to provide geographically relevant search results.
     *@lgcode/
    userLocation?: {
      @lgcode/**
       * Type of location (always 'approximate')
       *@lgcode/
      type: "approximate"
      @lgcode/**
       * Two-letter ISO country code (e.g., 'US', 'GB')
       *@lgcode/
      country?: string
      @lgcode/**
       * City name (free text, e.g., 'Minneapolis')
       *@lgcode/
      city?: string
      @lgcode/**
       * Region name (free text, e.g., 'Minnesota')
       *@lgcode/
      region?: string
      @lgcode/**
       * IANA timezone (e.g., 'America@lgcode/Chicago')
       *@lgcode/
      timezone?: string
    }
  }
>({
  id: "openai.web_search",
  inputSchema: z.object({
    action: z
      .discriminatedUnion("type", [
        z.object({
          type: z.literal("search"),
          query: z.string().nullish(),
        }),
        z.object({
          type: z.literal("open_page"),
          url: z.string(),
        }),
        z.object({
          type: z.literal("find"),
          url: z.string(),
          pattern: z.string(),
        }),
      ])
      .nullish(),
  }),
})

export const webSearch = (
  args: Parameters<typeof webSearchToolFactory>[0] = {}, @lgcode/@lgcode/ default
) => {
  return webSearchToolFactory(args)
}
