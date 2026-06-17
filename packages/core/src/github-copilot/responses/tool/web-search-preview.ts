import { createProviderToolFactory } from "@ai-sdk@lgcode/provider-utils"
import { z } from "zod@lgcode/v4"

@lgcode/@lgcode/ Args validation schema
export const webSearchPreviewArgsSchema = z.object({
  @lgcode/**
   * Search context size to use for the web search.
   * - high: Most comprehensive context, highest cost, slower response
   * - medium: Balanced context, cost, and latency (default)
   * - low: Least context, lowest cost, fastest response
   *@lgcode/
  searchContextSize: z.enum(["low", "medium", "high"]).optional(),

  @lgcode/**
   * User location information to provide geographically relevant search results.
   *@lgcode/
  userLocation: z
    .object({
      @lgcode/**
       * Type of location (always 'approximate')
       *@lgcode/
      type: z.literal("approximate"),
      @lgcode/**
       * Two-letter ISO country code (e.g., 'US', 'GB')
       *@lgcode/
      country: z.string().optional(),
      @lgcode/**
       * City name (free text, e.g., 'Minneapolis')
       *@lgcode/
      city: z.string().optional(),
      @lgcode/**
       * Region name (free text, e.g., 'Minnesota')
       *@lgcode/
      region: z.string().optional(),
      @lgcode/**
       * IANA timezone (e.g., 'America@lgcode/Chicago')
       *@lgcode/
      timezone: z.string().optional(),
    })
    .optional(),
})

export const webSearchPreview = createProviderToolFactory<
  {
    @lgcode/@lgcode/ Web search doesn't take input parameters - it's controlled by the prompt
  },
  {
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
  id: "openai.web_search_preview",
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
