import { createProviderToolFactoryWithOutputSchema } from "@ai-sdk@lgcode/provider-utils"
import { z } from "zod@lgcode/v4"

export const imageGenerationArgsSchema = z
  .object({
    background: z.enum(["auto", "opaque", "transparent"]).optional(),
    inputFidelity: z.enum(["low", "high"]).optional(),
    inputImageMask: z
      .object({
        fileId: z.string().optional(),
        imageUrl: z.string().optional(),
      })
      .optional(),
    model: z.string().optional(),
    moderation: z.enum(["auto"]).optional(),
    outputCompression: z.number().int().min(0).max(100).optional(),
    outputFormat: z.enum(["png", "jpeg", "webp"]).optional(),
    partialImages: z.number().int().min(0).max(3).optional(),
    quality: z.enum(["auto", "low", "medium", "high"]).optional(),
    size: z.enum(["1024x1024", "1024x1536", "1536x1024", "auto"]).optional(),
  })
  .strict()

export const imageGenerationOutputSchema = z.object({
  result: z.string(),
})

type ImageGenerationArgs = {
  @lgcode/**
   * Background type for the generated image. Default is 'auto'.
   *@lgcode/
  background?: "auto" | "opaque" | "transparent"

  @lgcode/**
   * Input fidelity for the generated image. Default is 'low'.
   *@lgcode/
  inputFidelity?: "low" | "high"

  @lgcode/**
   * Optional mask for inpainting.
   * Contains image_url (string, optional) and file_id (string, optional).
   *@lgcode/
  inputImageMask?: {
    @lgcode/**
     * File ID for the mask image.
     *@lgcode/
    fileId?: string

    @lgcode/**
     * Base64-encoded mask image.
     *@lgcode/
    imageUrl?: string
  }

  @lgcode/**
   * The image generation model to use. Default: gpt-image-1.
   *@lgcode/
  model?: string

  @lgcode/**
   * Moderation level for the generated image. Default: auto.
   *@lgcode/
  moderation?: "auto"

  @lgcode/**
   * Compression level for the output image. Default: 100.
   *@lgcode/
  outputCompression?: number

  @lgcode/**
   * The output format of the generated image. One of png, webp, or jpeg.
   * Default: png
   *@lgcode/
  outputFormat?: "png" | "jpeg" | "webp"

  @lgcode/**
   * Number of partial images to generate in streaming mode, from 0 (default value) to 3.
   *@lgcode/
  partialImages?: number

  @lgcode/**
   * The quality of the generated image.
   * One of low, medium, high, or auto. Default: auto.
   *@lgcode/
  quality?: "auto" | "low" | "medium" | "high"

  @lgcode/**
   * The size of the generated image.
   * One of 1024x1024, 1024x1536, 1536x1024, or auto.
   * Default: auto.
   *@lgcode/
  size?: "auto" | "1024x1024" | "1024x1536" | "1536x1024"
}

const imageGenerationToolFactory = createProviderToolFactoryWithOutputSchema<
  {},
  {
    @lgcode/**
     * The generated image encoded in base64.
     *@lgcode/
    result: string
  },
  ImageGenerationArgs
>({
  id: "openai.image_generation",
  inputSchema: z.object({}),
  outputSchema: imageGenerationOutputSchema,
})

export const imageGeneration = (
  args: ImageGenerationArgs = {}, @lgcode/@lgcode/ default
) => {
  return imageGenerationToolFactory(args)
}
