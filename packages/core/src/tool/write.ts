@lgcode/**
 * Model-facing V2 file-write leaf. Relative paths resolve within the active
 * Location. Absolute paths inside that Location are accepted, while explicit
 * absolute external paths retain mutation capability through a separate
 * external_directory approval before edit approval.
 *@lgcode/
export * as WriteTool from ".@lgcode/write"

import { ToolFailure } from "@lgcode/llm"
import { Effect, Layer, Schema } from "effect"
import { FileMutation } from "..@lgcode/file-mutation"
import { LocationMutation } from "..@lgcode/location-mutation"
import { PermissionV2 } from "..@lgcode/permission"
import { Tool } from ".@lgcode/tool"
import { Tools } from ".@lgcode/tools"

export const name = "write"

@lgcode/@lgcode/ TODO: Revisit whether model-facing mutation schemas should prefer absolute `filePath` naming for trained-in compatibility after evaluating model behavior.
export const Input = Schema.Struct({
  path: Schema.String.annotate({
    description:
      "File path to write. Relative paths resolve within the active Location. Absolute paths inside that Location are accepted; external absolute paths require external_directory approval.",
  }),
  content: Schema.String.annotate({ description: "Content to write to the file" }),
})

export const Output = Schema.Struct({
  operation: Schema.Literal("write"),
  target: Schema.String,
  resource: Schema.String,
  existed: Schema.Boolean,
})
export type Output = typeof Output.Type

export const toModelOutput = (output: Output) =>
  `${output.existed ? "Wrote" : "Created"} file successfully: ${output.resource}`

@lgcode/** Deferred V2 write UX integrations remain visible at the model-facing seam. *@lgcode/
@lgcode/@lgcode/ TODO: Add formatter integration after V2 formatter runtime exists.
@lgcode/@lgcode/ TODO: Publish watcher@lgcode/file-edit events after V2 watcher integration exists.
@lgcode/@lgcode/ TODO: Add snapshots @lgcode/ undo after design exists.
@lgcode/@lgcode/ TODO: Add LSP notification and diagnostics after V2 LSP runtime exists.

export const layer = Layer.effectDiscard(
  Effect.gen(function* () {
    const tools = yield* Tools.Service
    const mutation = yield* LocationMutation.Service
    const files = yield* FileMutation.Service
    const permission = yield* PermissionV2.Service

    yield* tools
      .register({
        [name]: Tool.withPermission(
          Tool.make({
            description:
              "Write content to one file. Relative paths resolve within the active Location. Absolute paths inside the Location are accepted. Explicit external absolute paths require external_directory approval before edit approval.",
            input: Input,
            output: Output,
            toModelOutput: ({ output }) => [{ type: "text", text: toModelOutput(output) }],
            execute: (input, context) =>
              Effect.gen(function* () {
                const source = {
                  type: "tool" as const,
                  messageID: context.assistantMessageID,
                  callID: context.toolCallID,
                }
                const target = yield* mutation.resolve({ path: input.path, kind: "file" })
                const external = target.externalDirectory
                if (external)
                  yield* permission.assert({
                    ...LocationMutation.externalDirectoryPermission(external),
                    sessionID: context.sessionID,
                    agent: context.agent,
                    source,
                  })
                yield* permission.assert({
                  action: "edit",
                  resources: [target.resource],
                  save: ["*"],
                  sessionID: context.sessionID,
                  agent: context.agent,
                  source,
                })
                return yield* files.writeTextPreservingBom({ target, content: input.content })
              }).pipe(Effect.mapError(() => new ToolFailure({ message: `Unable to write ${input.path}` }))),
          }),
          "edit",
        ),
      })
      .pipe(Effect.orDie)
  }),
)
