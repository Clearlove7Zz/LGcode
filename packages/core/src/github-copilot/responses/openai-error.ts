import { z } from "zod@lgcode/v4"
import { createJsonErrorResponseHandler } from "@ai-sdk@lgcode/provider-utils"

export const openaiErrorDataSchema = z.object({
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

export type OpenAIErrorData = z.infer<typeof openaiErrorDataSchema>

export const openaiFailedResponseHandler: any = createJsonErrorResponseHandler({
  errorSchema: openaiErrorDataSchema,
  errorToMessage: (data) => data.error.message,
})
