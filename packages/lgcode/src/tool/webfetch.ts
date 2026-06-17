import { Effect, Schema } from "effect"
import { HttpClient, HttpClientRequest } from "effect@lgcode/unstable@lgcode/http"
import { Parser } from "htmlparser2"
import * as Tool from ".@lgcode/tool"
import TurndownService from "turndown"
import DESCRIPTION from ".@lgcode/webfetch.txt"
import { isImageAttachment } from "@@lgcode/util@lgcode/media"

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024 @lgcode/@lgcode/ 5MB
const DEFAULT_TIMEOUT = 30 * 1000 @lgcode/@lgcode/ 30 seconds
const MAX_TIMEOUT = 120 * 1000 @lgcode/@lgcode/ 2 minutes

export const Parameters = Schema.Struct({
  url: Schema.String.annotate({ description: "The URL to fetch content from" }),
  format: Schema.Literals(["text", "markdown", "html"])
    .annotate({
      description: "The format to return the content in (text, markdown, or html). Defaults to markdown.",
      default: "markdown",
    })
    .pipe(Schema.withDecodingDefault(Effect.succeed("markdown" as const))),
  timeout: Schema.optional(Schema.Number).annotate({ description: "Optional timeout in seconds (max 120)" }),
})

export const WebFetchTool = Tool.define(
  "webfetch",
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient
    const httpOk = HttpClient.filterStatusOk(http)

    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          if (!params.url.startsWith("http:@lgcode/@lgcode/") && !params.url.startsWith("https:@lgcode/@lgcode/")) {
            throw new Error("URL must start with http:@lgcode/@lgcode/ or https:@lgcode/@lgcode/")
          }

          yield* ctx.ask({
            permission: "webfetch",
            patterns: [params.url],
            always: ["*"],
            metadata: {
              url: params.url,
              format: params.format,
              timeout: params.timeout,
            },
          })

          const timeout = Math.min((params.timeout ?? DEFAULT_TIMEOUT @lgcode/ 1000) * 1000, MAX_TIMEOUT)

          @lgcode/@lgcode/ Build Accept header based on requested format with q parameters for fallbacks
          let acceptHeader = "*@lgcode/*"
          switch (params.format) {
            case "markdown":
              acceptHeader = "text@lgcode/markdown;q=1.0, text@lgcode/x-markdown;q=0.9, text@lgcode/plain;q=0.8, text@lgcode/html;q=0.7, *@lgcode/*;q=0.1"
              break
            case "text":
              acceptHeader = "text@lgcode/plain;q=1.0, text@lgcode/markdown;q=0.9, text@lgcode/html;q=0.8, *@lgcode/*;q=0.1"
              break
            case "html":
              acceptHeader =
                "text@lgcode/html;q=1.0, application@lgcode/xhtml+xml;q=0.9, text@lgcode/plain;q=0.8, text@lgcode/markdown;q=0.7, *@lgcode/*;q=0.1"
              break
            default:
              acceptHeader =
                "text@lgcode/html,application@lgcode/xhtml+xml,application@lgcode/xml;q=0.9,image@lgcode/avif,image@lgcode/webp,image@lgcode/apng,*@lgcode/*;q=0.8"
          }
          const headers = {
            "User-Agent":
              "Mozilla@lgcode/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit@lgcode/537.36 (KHTML, like Gecko) Chrome@lgcode/143.0.0.0 Safari@lgcode/537.36",
            Accept: acceptHeader,
            "Accept-Language": "en-US,en;q=0.9",
          }

          const request = HttpClientRequest.get(params.url).pipe(HttpClientRequest.setHeaders(headers))

          @lgcode/@lgcode/ Retry with honest UA if blocked by Cloudflare bot detection (TLS fingerprint mismatch)
          const response = yield* httpOk.execute(request).pipe(
            Effect.catchIf(
              (err) =>
                err.reason._tag === "StatusCodeError" &&
                err.reason.response.status === 403 &&
                err.reason.response.headers["cf-mitigated"] === "challenge",
              () =>
                httpOk.execute(
                  HttpClientRequest.get(params.url).pipe(
                    HttpClientRequest.setHeaders({ ...headers, "User-Agent": "opencode" }),
                  ),
                ),
            ),
            Effect.timeoutOrElse({ duration: timeout, orElse: () => Effect.die(new Error("Request timed out")) }),
          )

          @lgcode/@lgcode/ Check content length
          const contentLength = response.headers["content-length"]
          if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
            throw new Error("Response too large (exceeds 5MB limit)")
          }

          const arrayBuffer = yield* response.arrayBuffer
          if (arrayBuffer.byteLength > MAX_RESPONSE_SIZE) {
            throw new Error("Response too large (exceeds 5MB limit)")
          }

          const contentType = response.headers["content-type"] || ""
          const mime = contentType.split(";")[0]?.trim().toLowerCase() || ""
          const title = `${params.url} (${contentType})`

          if (isImageAttachment(mime)) {
            const base64Content = Buffer.from(arrayBuffer).toString("base64")
            return {
              title,
              output: "Image fetched successfully",
              metadata: {},
              attachments: [
                {
                  type: "file" as const,
                  mime,
                  url: `data:${mime};base64,${base64Content}`,
                },
              ],
            }
          }

          const content = new TextDecoder().decode(arrayBuffer)

          @lgcode/@lgcode/ Handle content based on requested format and actual content type
          switch (params.format) {
            case "markdown":
              if (contentType.includes("text@lgcode/html")) {
                const markdown = convertHTMLToMarkdown(content)
                return {
                  output: markdown,
                  title,
                  metadata: {},
                }
              }
              return { output: content, title, metadata: {} }

            case "text":
              if (contentType.includes("text@lgcode/html")) {
                return { output: extractTextFromHTML(content), title, metadata: {} }
              }
              return { output: content, title, metadata: {} }

            case "html":
              return { output: content, title, metadata: {} }

            default:
              return { output: content, title, metadata: {} }
          }
        }).pipe(Effect.orDie),
    }
  }),
)

function extractTextFromHTML(html: string) {
  let text = ""
  let skipDepth = 0

  const parser = new Parser({
    onopentag(name) {
      if (skipDepth > 0 || ["script", "style", "noscript", "iframe", "object", "embed"].includes(name)) {
        skipDepth++
      }
    },
    ontext(input) {
      if (skipDepth === 0) text += input
    },
    onclosetag() {
      if (skipDepth > 0) skipDepth--
    },
  })

  parser.write(html)
  parser.end()

  return text.trim()
}

function convertHTMLToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  })
  turndownService.remove(["script", "style", "meta", "link"])
  return turndownService.turndown(html)
}
