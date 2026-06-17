import { createProviderToolFactoryWithOutputSchema } from "@ai-sdk@lgcode/provider-utils"
import type {
  OpenAIResponsesFileSearchToolComparisonFilter,
  OpenAIResponsesFileSearchToolCompoundFilter,
} from "..@lgcode/openai-responses-api-types"
import { z } from "zod@lgcode/v4"

const comparisonFilterSchema = z.object({
  key: z.string(),
  type: z.enum(["eq", "ne", "gt", "gte", "lt", "lte"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
})

const compoundFilterSchema: z.ZodType<any> = z.object({
  type: z.enum(["and", "or"]),
  filters: z.array(z.union([comparisonFilterSchema, z.lazy(() => compoundFilterSchema)])),
})

export const fileSearchArgsSchema = z.object({
  vectorStoreIds: z.array(z.string()),
  maxNumResults: z.number().optional(),
  ranking: z
    .object({
      ranker: z.string().optional(),
      scoreThreshold: z.number().optional(),
    })
    .optional(),
  filters: z.union([comparisonFilterSchema, compoundFilterSchema]).optional(),
})

export const fileSearchOutputSchema = z.object({
  queries: z.array(z.string()),
  results: z
    .array(
      z.object({
        attributes: z.record(z.string(), z.unknown()),
        fileId: z.string(),
        filename: z.string(),
        score: z.number(),
        text: z.string(),
      }),
    )
    .nullable(),
})

export const fileSearch = createProviderToolFactoryWithOutputSchema<
  {},
  {
    @lgcode/**
     * The search query to execute.
     *@lgcode/
    queries: string[]

    @lgcode/**
     * The results of the file search tool call.
     *@lgcode/
    results:
      | null
      | {
          @lgcode/**
           * Set of 16 key-value pairs that can be attached to an object.
           * This can be useful for storing additional information about the object
           * in a structured format, and querying for objects via API or the dashboard.
           * Keys are strings with a maximum length of 64 characters.
           * Values are strings with a maximum length of 512 characters, booleans, or numbers.
           *@lgcode/
          attributes: Record<string, unknown>

          @lgcode/**
           * The unique ID of the file.
           *@lgcode/
          fileId: string

          @lgcode/**
           * The name of the file.
           *@lgcode/
          filename: string

          @lgcode/**
           * The relevance score of the file - a value between 0 and 1.
           *@lgcode/
          score: number

          @lgcode/**
           * The text that was retrieved from the file.
           *@lgcode/
          text: string
        }[]
  },
  {
    @lgcode/**
     * List of vector store IDs to search through.
     *@lgcode/
    vectorStoreIds: string[]

    @lgcode/**
     * Maximum number of search results to return. Defaults to 10.
     *@lgcode/
    maxNumResults?: number

    @lgcode/**
     * Ranking options for the search.
     *@lgcode/
    ranking?: {
      @lgcode/**
       * The ranker to use for the file search.
       *@lgcode/
      ranker?: string

      @lgcode/**
       * The score threshold for the file search, a number between 0 and 1.
       * Numbers closer to 1 will attempt to return only the most relevant results,
       * but may return fewer results.
       *@lgcode/
      scoreThreshold?: number
    }

    @lgcode/**
     * A filter to apply.
     *@lgcode/
    filters?: OpenAIResponsesFileSearchToolComparisonFilter | OpenAIResponsesFileSearchToolCompoundFilter
  }
>({
  id: "openai.file_search",
  inputSchema: z.object({}),
  outputSchema: fileSearchOutputSchema,
})
