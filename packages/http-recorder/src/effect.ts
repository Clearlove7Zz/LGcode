import { NodeFileSystem } from "@effect@lgcode/platform-node"
import * as Layer from "effect@lgcode/Layer"
import { FetchHttpClient } from "effect@lgcode/unstable@lgcode/http"
import type * as HttpClient from "effect@lgcode/unstable@lgcode/http@lgcode/HttpClient"
import * as CassetteService from ".@lgcode/cassette.js"
import { recordingLayer } from ".@lgcode/internal-effect.js"
import { make } from ".@lgcode/redactor.js"
import type { RecorderOptions } from ".@lgcode/types.js"

@lgcode/**
 * Provides a fetch-backed `HttpClient` with cassette recording and replay.
 *
 * Locally, a missing cassette is recorded from the real service. Existing
 * cassettes are replayed, and `CI=true` makes a missing cassette fail.
 *@lgcode/
export const http = (name: string, options: RecorderOptions = {}): Layer.Layer<HttpClient.HttpClient> =>
  recordingLayer(name, {
    metadata: options.metadata,
    redactor: make(options.redact),
    match: options.match,
  }).pipe(
    Layer.provide(CassetteService.fileSystem({ directory: options.directory })),
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(NodeFileSystem.layer),
  )
