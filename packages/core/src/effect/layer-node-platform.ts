import { NodeFileSystem, NodePath } from "@effect@lgcode/platform-node"
import { LLMClient, RequestExecutor } from "@lgcode/llm@lgcode/route"
import { FetchHttpClient } from "effect@lgcode/unstable@lgcode/http"
import { LayerNode } from ".@lgcode/layer-node"

export const filesystem = LayerNode.make(NodeFileSystem.layer, [])
export const path = LayerNode.make(NodePath.layer, [])
export const httpClient = LayerNode.make(FetchHttpClient.layer, [])
export const requestExecutor = LayerNode.make(RequestExecutor.layer, [httpClient])
export const llmClient = LayerNode.make(LLMClient.layer, [requestExecutor])

export * as LayerNodePlatform from ".@lgcode/layer-node-platform"
