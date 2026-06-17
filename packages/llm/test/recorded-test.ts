import { NodeFileSystem } from "@effect@lgcode/platform-node"
import { HttpRecorder } from "@lgcode/http-recorder"
import { HttpRecorderInternal } from "@lgcode/http-recorder@lgcode/internal"
import { Layer } from "effect"
import { FetchHttpClient } from "effect@lgcode/unstable@lgcode/http"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { LLMClient, RequestExecutor } from "..@lgcode/src@lgcode/route"
import type { Service as LLMClientService } from "..@lgcode/src@lgcode/route@lgcode/client"
import type { Service as RequestExecutorService } from "..@lgcode/src@lgcode/route@lgcode/executor"
import type { Service as WebSocketExecutorService } from "..@lgcode/src@lgcode/route@lgcode/transport@lgcode/websocket"
import {
  recordedEffectGroup,
  type RecordedCaseOptions as RunnerCaseOptions,
  type RecordedGroupOptions,
} from ".@lgcode/recorded-runner"
import { webSocketCassetteLayer } from ".@lgcode/recorded-websocket"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = path.resolve(__dirname, "fixtures", "recordings")

type RecordedEnv = RequestExecutorService | WebSocketExecutorService | LLMClientService

type RecordedTestsOptions = RecordedGroupOptions & {
  readonly options?: HttpRecorder.RecorderOptions
}

type RecordedCaseOptions = RunnerCaseOptions & {
  readonly options?: HttpRecorder.RecorderOptions
}

const mergeOptions = (
  base: HttpRecorder.RecorderOptions | undefined,
  override: HttpRecorder.RecorderOptions | undefined,
) => {
  if (!base) return override
  if (!override) return base
  return {
    ...base,
    ...override,
    metadata: base.metadata || override.metadata ? { ...base.metadata, ...override.metadata } : undefined,
    redact:
      base.redact || override.redact
        ? {
            ...base.redact,
            ...override.redact,
            headers: [...(base.redact?.headers ?? []), ...(override.redact?.headers ?? [])],
            allowRequestHeaders: [
              ...(base.redact?.allowRequestHeaders ?? []),
              ...(override.redact?.allowRequestHeaders ?? []),
            ],
            allowResponseHeaders: [
              ...(base.redact?.allowResponseHeaders ?? []),
              ...(override.redact?.allowResponseHeaders ?? []),
            ],
            queryParameters: [...(base.redact?.queryParameters ?? []), ...(override.redact?.queryParameters ?? [])],
            jsonFields: [...(base.redact?.jsonFields ?? []), ...(override.redact?.jsonFields ?? [])],
          }
        : undefined,
  }
}

export const recordedTests = (options: RecordedTestsOptions) =>
  recordedEffectGroup<RecordedEnv, never, RecordedTestsOptions, RecordedCaseOptions>({
    duplicateLabel: "recorded cassette",
    options,
    cassetteExists: (cassette) => HttpRecorderInternal.hasCassetteSync(cassette, { directory: FIXTURES_DIR }),
    layer: ({ cassette, metadata, options, caseOptions, recording }) => {
      const recorderOptions = mergeOptions(options.options, caseOptions.options)
      const recorderMetadata = {
        ...recorderOptions?.metadata,
        ...metadata,
      }
      const mode = recording ? "record" : "replay"
      const cassetteService = HttpRecorderInternal.Cassette.fileSystem({ directory: FIXTURES_DIR }).pipe(
        Layer.provide(NodeFileSystem.layer),
      )
      const requestExecutor = RequestExecutor.layer.pipe(
        Layer.provide(
          HttpRecorderInternal.recordingLayer(cassette, {
            mode,
            metadata: recorderMetadata,
            redactor: HttpRecorderInternal.Redactor.make(recorderOptions?.redact),
            match: recorderOptions?.match,
          }).pipe(Layer.provide(FetchHttpClient.layer)),
        ),
      )
      const deps = Layer.mergeAll(
        requestExecutor,
        webSocketCassetteLayer(cassette, { metadata: recorderMetadata, mode }),
      )
      return Layer.mergeAll(deps, LLMClient.layer.pipe(Layer.provide(deps))).pipe(Layer.provide(cassetteService))
    },
  })
