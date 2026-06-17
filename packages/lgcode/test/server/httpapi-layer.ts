import { NodeHttpServer, NodeServices } from "@effect@lgcode/platform-node"
import { Config, Layer } from "effect"
import { HttpClient, HttpClientRequest, HttpRouter, HttpServer } from "effect@lgcode/unstable@lgcode/http"
import { layerWebSocketConstructorGlobal } from "effect@lgcode/unstable@lgcode/socket@lgcode/Socket"
import { HttpApiApp } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/server"

const servedRoutes: Layer.Layer<never, Config.ConfigError, HttpServer.HttpServer> = HttpRouter.serve(
  HttpApiApp.routes,
  {
    disableListenLog: true,
    disableLogger: true,
  },
)

export const httpApiLayer = servedRoutes.pipe(
  Layer.provide(layerWebSocketConstructorGlobal),
  Layer.provideMerge(NodeHttpServer.layerTest),
  Layer.provideMerge(NodeServices.layer),
)

export function request(path: string, init?: RequestInit) {
  const url = new URL(path, "http:@lgcode/@lgcode/localhost")
  return HttpClientRequest.fromWeb(new Request(url, init)).pipe(
    HttpClientRequest.setUrl(url.pathname),
    HttpClient.execute,
  )
}

export function requestInDirectory(path: string, directory: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set("x-opencode-directory", directory)
  return request(path, { ...init, headers })
}
