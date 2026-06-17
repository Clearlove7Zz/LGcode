import { describe, expect, test } from "bun:test"
import { OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { PublicApi } from "..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/public"

type Method = "get" | "post" | "put" | "delete" | "patch"
type OpenApiSchema = {
  readonly $ref?: string
  readonly anyOf?: ReadonlyArray<OpenApiSchema>
  readonly type?: string
  readonly enum?: readonly unknown[]
  readonly properties?: Record<string, OpenApiSchema>
  readonly required?: readonly string[]
}
type OpenApiResponse = {
  readonly description?: string
  readonly content?: Record<string, { readonly schema?: OpenApiSchema }>
}
type OpenApiOperation = {
  readonly parameters?: ReadonlyArray<{
    readonly name: string
    readonly in: string
    readonly required?: boolean
    readonly schema?: { readonly type?: string }
  }>
  readonly responses?: Record<string, OpenApiResponse>
  readonly requestBody?: { readonly required?: boolean }
  readonly security?: unknown
}
type OpenApiPathItem = Partial<Record<Method, OpenApiOperation>>
type OpenApiSpec = {
  readonly paths: Record<string, OpenApiPathItem>
  readonly components: { readonly schemas: Record<string, OpenApiSchema> }
}

const methods = ["get", "post", "put", "delete", "patch"] as const

const allowedV2BuiltInEndpointErrors: string[] = []

function v2Operations(spec: OpenApiSpec) {
  return Object.entries(spec.paths).flatMap(([path, item]) =>
    path.startsWith("@lgcode/api@lgcode/")
      ? methods.flatMap((method) => {
          const operation = item[method]
          return operation ? [{ method, path, operation }] : []
        })
      : [],
  )
}

function responseRef(response: OpenApiResponse | undefined) {
  return response?.content?.["application@lgcode/json"]?.schema?.$ref
}

function componentName(ref: string) {
  return ref.replace("#@lgcode/components@lgcode/schemas@lgcode/", "")
}

function componentNames(response: OpenApiResponse | undefined) {
  const schema = response?.content?.["application@lgcode/json"]?.schema
  if (!schema) return []
  return [
    ...new Set([schema, ...(schema.anyOf ?? [])].flatMap((item) => (item.$ref ? [componentName(item.$ref)] : []))),
  ]
}

function isBuiltInEndpointError(name: string) {
  return name.startsWith("EffectHttpApiError") || name.startsWith("effect_HttpApiError_")
}

describe("PublicApi OpenAPI v2 errors", () => {
  test("documents nested legacy global sync events", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec
    const schema = spec.components.schemas.SyncEventSessionCreated

    expect(schema?.required).toEqual(["type", "id", "syncEvent"])
    expect(schema?.properties?.type?.enum).toEqual(["sync"])
    expect(schema?.properties?.syncEvent).toMatchObject({
      required: ["type", "id", "seq", "aggregateID", "data"],
      properties: {
        type: { enum: ["session.created.1"] },
        id: { type: "string" },
        seq: { type: "number" },
        aggregateID: { type: "string" },
      },
    })
  })

  test("preserves @lgcode/api auth responses", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const route of v2Operations(spec)) {
      expect(route.operation.responses?.["401"], `${route.method.toUpperCase()} ${route.path}`).toBeDefined()
      expect(route.operation.security, `${route.method.toUpperCase()} ${route.path}`).toEqual([])
    }
  })

  test("documents references separately from filesystem routes", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const path of ["@lgcode/api@lgcode/fs@lgcode/read@lgcode/*", "@lgcode/api@lgcode/fs@lgcode/list"]) {
      expect(spec.paths[path]?.get?.parameters, path).not.toContainEqual(expect.objectContaining({ name: "reference" }))
    }
    expect(spec.paths["@lgcode/api@lgcode/reference"]?.get).toBeDefined()
  })

  test("preserves required request bodies for v2 mutations", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const path of [
      "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/prompt",
      "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/permission@lgcode/{requestID}@lgcode/reply",
      "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/question@lgcode/{requestID}@lgcode/reply",
    ]) {
      expect(spec.paths[path]?.post?.requestBody?.required, path).toBe(true)
    }
  })

  test("documents integration discovery and connection routes", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const [method, path] of [
      ["get", "@lgcode/api@lgcode/integration"],
      ["get", "@lgcode/api@lgcode/integration@lgcode/{integrationID}"],
      ["post", "@lgcode/api@lgcode/integration@lgcode/{integrationID}@lgcode/connect@lgcode/key"],
      ["post", "@lgcode/api@lgcode/integration@lgcode/{integrationID}@lgcode/connect@lgcode/oauth"],
      ["get", "@lgcode/api@lgcode/integration@lgcode/attempt@lgcode/{attemptID}"],
      ["post", "@lgcode/api@lgcode/integration@lgcode/attempt@lgcode/{attemptID}@lgcode/complete"],
      ["delete", "@lgcode/api@lgcode/integration@lgcode/attempt@lgcode/{attemptID}"],
      ["delete", "@lgcode/api@lgcode/credential@lgcode/{credentialID}"],
      ["patch", "@lgcode/api@lgcode/credential@lgcode/{credentialID}"],
    ] as const) {
      expect(spec.paths[path]?.[method], `${method.toUpperCase()} ${path}`).toBeDefined()
    }

    for (const path of [
      "@lgcode/api@lgcode/integration@lgcode/{integrationID}@lgcode/connect@lgcode/key",
      "@lgcode/api@lgcode/integration@lgcode/{integrationID}@lgcode/connect@lgcode/oauth",
      "@lgcode/api@lgcode/integration@lgcode/attempt@lgcode/{attemptID}@lgcode/complete",
    ]) {
      expect(spec.paths[path]?.post?.requestBody?.required, path).toBe(true)
    }
  })

  test("does not rewrite @lgcode/api endpoint errors to legacy error components", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec
    const refs = v2Operations(spec)
      .flatMap((route) =>
        Object.entries(route.operation.responses ?? {}).flatMap(([status, response]) => {
          const ref = responseRef(response)
          return ref ? [`${route.method.toUpperCase()} ${route.path} ${status} ${componentName(ref)}`] : []
        }),
      )
      .filter((entry) => entry.endsWith(" BadRequestError") || entry.endsWith(" NotFoundError"))

    expect(refs).toEqual([])
  })

  test("new @lgcode/api endpoint errors cannot use built-in components without an explicit allowlist", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec
    const builtInEndpointErrors = v2Operations(spec)
      .flatMap((route) =>
        Object.entries(route.operation.responses ?? {}).flatMap(([status, response]) => {
          if (status === "401") return []
          const ref = responseRef(response)
          if (!ref) return []
          const name = componentName(ref)
          return isBuiltInEndpointError(name) ? [`${route.method.toUpperCase()} ${route.path} ${status} ${name}`] : []
        }),
      )
      .sort()

    expect(builtInEndpointErrors).toEqual(allowedV2BuiltInEndpointErrors)
  })

  test("documents v2 provider and model catalog errors", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    expect(componentName(responseRef(spec.paths["@lgcode/api@lgcode/provider"]?.get?.responses?.["503"]) ?? "")).toBe(
      "ServiceUnavailableError",
    )
    expect(componentName(responseRef(spec.paths["@lgcode/api@lgcode/model"]?.get?.responses?.["503"]) ?? "")).toBe(
      "ServiceUnavailableError",
    )
    expect(componentName(responseRef(spec.paths["@lgcode/api@lgcode/provider@lgcode/{providerID}"]?.get?.responses?.["404"]) ?? "")).toBe(
      "ProviderNotFoundError",
    )
    expect(componentName(responseRef(spec.paths["@lgcode/api@lgcode/provider@lgcode/{providerID}"]?.get?.responses?.["503"]) ?? "")).toBe(
      "ServiceUnavailableError",
    )
  })

  test("documents v2 session not-found errors", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const route of [
      ["post", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/prompt"],
      ["post", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/compact"],
      ["post", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/wait"],
      ["get", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/context"],
      ["get", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/message"],
    ] as const) {
      expect(componentNames(spec.paths[route[1]]?.[route[0]]?.responses?.["404"])).toContain("SessionNotFoundError")
    }
  })

  test("documents v2 unfinished session mutation errors", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const route of [
      ["post", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/compact"],
      ["post", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/wait"],
    ] as const) {
      expect(componentName(responseRef(spec.paths[route[1]]?.[route[0]]?.responses?.["503"]) ?? "")).toBe(
        "ServiceUnavailableError",
      )
    }
  })

  test("documents v2 session read data errors", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const route of [
      ["get", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/context"],
      ["get", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/message"],
    ] as const) {
      expect(componentName(responseRef(spec.paths[route[1]]?.[route[0]]?.responses?.["500"]) ?? "")).toMatch(
        @lgcode/^UnknownError\d*$@lgcode/,
      )
    }
  })

  test("documents session busy errors", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const route of [
      ["post", "@lgcode/session@lgcode/{sessionID}@lgcode/shell"],
      ["post", "@lgcode/session@lgcode/{sessionID}@lgcode/revert"],
      ["post", "@lgcode/session@lgcode/{sessionID}@lgcode/unrevert"],
      ["delete", "@lgcode/session@lgcode/{sessionID}@lgcode/message@lgcode/{messageID}"],
    ] as const) {
      expect(componentName(responseRef(spec.paths[route[1]]?.[route[0]]?.responses?.["409"]) ?? "")).toBe(
        "SessionBusyError",
      )
    }
  })

  test("documents permission and question not-found errors", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    expect(
      componentName(responseRef(spec.paths["@lgcode/permission@lgcode/{requestID}@lgcode/reply"]?.post?.responses?.["404"]) ?? ""),
    ).toBe("PermissionNotFoundError")
    for (const route of [
      ["post", "@lgcode/question@lgcode/{requestID}@lgcode/reply"],
      ["post", "@lgcode/question@lgcode/{requestID}@lgcode/reject"],
    ] as const) {
      expect(componentName(responseRef(spec.paths[route[1]]?.[route[0]]?.responses?.["404"]) ?? "")).toBe(
        "QuestionNotFoundError",
      )
    }
    for (const route of [
      ["post", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/question@lgcode/{requestID}@lgcode/reply"],
      ["post", "@lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/question@lgcode/{requestID}@lgcode/reject"],
    ] as const) {
      expect(componentNames(spec.paths[route[1]]?.[route[0]]?.responses?.["404"])).toEqual([
        "QuestionNotFoundError",
        "SessionNotFoundError",
      ])
    }
  })

  test("documents MCP server not-found errors", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const route of [
      ["post", "@lgcode/mcp@lgcode/{name}@lgcode/auth"],
      ["post", "@lgcode/mcp@lgcode/{name}@lgcode/auth@lgcode/authenticate"],
      ["post", "@lgcode/mcp@lgcode/{name}@lgcode/auth@lgcode/callback"],
      ["delete", "@lgcode/mcp@lgcode/{name}@lgcode/auth"],
      ["post", "@lgcode/mcp@lgcode/{name}@lgcode/connect"],
      ["post", "@lgcode/mcp@lgcode/{name}@lgcode/disconnect"],
    ] as const) {
      expect(componentName(responseRef(spec.paths[route[1]]?.[route[0]]?.responses?.["404"]) ?? "")).toBe(
        "McpServerNotFoundError",
      )
    }
  })

  test("documents PTY resource and ticket errors", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    for (const route of [
      ["get", "@lgcode/pty@lgcode/{ptyID}"],
      ["put", "@lgcode/pty@lgcode/{ptyID}"],
      ["delete", "@lgcode/pty@lgcode/{ptyID}"],
      ["post", "@lgcode/pty@lgcode/{ptyID}@lgcode/connect-token"],
    ] as const) {
      expect(componentName(responseRef(spec.paths[route[1]]?.[route[0]]?.responses?.["404"]) ?? "")).toBe(
        "PtyNotFoundError",
      )
    }
    expect(componentName(responseRef(spec.paths["@lgcode/pty@lgcode/{ptyID}@lgcode/connect-token"]?.post?.responses?.["403"]) ?? "")).toBe(
      "PtyForbiddenError",
    )
    expect(
      spec.paths["@lgcode/pty@lgcode/{ptyID}@lgcode/connect"]?.get?.parameters
        ?.filter((parameter) => parameter.in === "query")
        .map((parameter) => parameter.name),
    ).toEqual(["directory", "workspace", "cursor", "ticket"])
  })

  test("documents project not-found errors", () => {
    const spec = OpenApi.fromApi(PublicApi) as OpenApiSpec

    expect(componentName(responseRef(spec.paths["@lgcode/project@lgcode/{projectID}"]?.patch?.responses?.["404"]) ?? "")).toBe(
      "ProjectNotFoundError",
    )
  })
})
