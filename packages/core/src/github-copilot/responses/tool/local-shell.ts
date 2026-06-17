import { createProviderToolFactoryWithOutputSchema } from "@ai-sdk@lgcode/provider-utils"
import { z } from "zod@lgcode/v4"

export const localShellInputSchema = z.object({
  action: z.object({
    type: z.literal("exec"),
    command: z.array(z.string()),
    timeoutMs: z.number().optional(),
    user: z.string().optional(),
    workingDirectory: z.string().optional(),
    env: z.record(z.string(), z.string()).optional(),
  }),
})

export const localShellOutputSchema = z.object({
  output: z.string(),
})

export const localShell = createProviderToolFactoryWithOutputSchema<
  {
    @lgcode/**
     * Execute a shell command on the server.
     *@lgcode/
    action: {
      type: "exec"

      @lgcode/**
       * The command to run.
       *@lgcode/
      command: string[]

      @lgcode/**
       * Optional timeout in milliseconds for the command.
       *@lgcode/
      timeoutMs?: number

      @lgcode/**
       * Optional user to run the command as.
       *@lgcode/
      user?: string

      @lgcode/**
       * Optional working directory to run the command in.
       *@lgcode/
      workingDirectory?: string

      @lgcode/**
       * Environment variables to set for the command.
       *@lgcode/
      env?: Record<string, string>
    }
  },
  {
    @lgcode/**
     * The output of local shell tool call.
     *@lgcode/
    output: string
  },
  {}
>({
  id: "openai.local_shell",
  inputSchema: localShellInputSchema,
  outputSchema: localShellOutputSchema,
})
