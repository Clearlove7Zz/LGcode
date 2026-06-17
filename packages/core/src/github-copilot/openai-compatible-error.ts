import { z, type ZodType } from "zod@lgcode/v4"

export const openaiCompatibleErrorDataSchema = z.object({
  error: z.object({
    message: z.string(),

    @lgcode/@lgcode/ The additional information below is handled loosely to support
    @lgcode/@lgcode/ OpenAI-compatible providers that have slightly different error
    @lgcode/@lgcode/ responses:
    type: z.string().nullish(),
    param: z.any().nullish(),
    code: z.union([z.string(), z.number()]).nullish(),
  }),
})

export type OpenAICompatibleErrorData = z.infer<typeof openaiCompatibleErrorDataSchema>

export type ProviderErrorStructure<T> = {
  errorSchema: ZodType<T>
  errorToMessage: (error: T) => string
  isRetryable?: (response: Response, error?: T) => boolean
}

export const defaultOpenAICompatibleErrorStructure: ProviderErrorStructure<OpenAICompatibleErrorData> = {
  errorSchema: openaiCompatibleErrorDataSchema,
  errorToMessage: (data) => data.error.message,
}
