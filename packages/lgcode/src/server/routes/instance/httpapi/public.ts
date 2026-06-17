import { OpenApi } from "effect@lgcode/unstable@lgcode/httpapi"
import { OpenCodeHttpApi } from ".@lgcode/api"
import { QueryBooleanOpenApi } from ".@lgcode/groups@lgcode/query"

type OpenApiParameter = {
  name: string
  in: string
  required?: boolean
  schema?: OpenApiSchema
}

type OpenApiOperation = {
  parameters?: OpenApiParameter[]
  responses?: Record<string, OpenApiResponse>
  requestBody?: {
    required?: boolean
    content?: Record<string, { schema?: OpenApiSchema }>
  }
  security?: unknown
}

type OpenApiPathItem = Partial<Record<"get" | "post" | "put" | "delete" | "patch", OpenApiOperation>>

type OpenApiSpec = {
  components?: {
    schemas?: Record<string, OpenApiSchema>
    securitySchemes?: Record<string, unknown>
  }
  paths?: Record<string, OpenApiPathItem>
}

type OpenApiSchema = {
  $ref?: string
  additionalProperties?: OpenApiSchema | boolean
  allOf?: OpenApiSchema[]
  anyOf?: OpenApiSchema[]
  description?: string
  enum?: Array<string | boolean>
  items?: OpenApiSchema
  maximum?: number
  minimum?: number
  oneOf?: OpenApiSchema[]
  pattern?: string
  prefixItems?: OpenApiSchema[]
  properties?: Record<string, OpenApiSchema>
  required?: string[]
  type?: string
}

type OpenApiResponse = {
  description?: string
  content?: Record<string, { schema?: OpenApiSchema }>
}

@lgcode/@lgcode/ Query schemas describe decoded Effect values, but the generated SDK needs the
@lgcode/@lgcode/ public call shape. These keep SDK callers passing numbers@lgcode/booleans while the
@lgcode/@lgcode/ server still decodes string query params at runtime.
const QueryParameterSchemas: Record<string, OpenApiSchema> = {
  "GET @lgcode/experimental@lgcode/session start": { type: "number" },
  "GET @lgcode/experimental@lgcode/session roots": QueryBooleanOpenApi,
  "GET @lgcode/experimental@lgcode/session archived": QueryBooleanOpenApi,
  "GET @lgcode/find@lgcode/file limit": { type: "integer", minimum: 1, maximum: 200 },
  "GET @lgcode/experimental@lgcode/session cursor": { type: "number" },
  "GET @lgcode/experimental@lgcode/session limit": { type: "number" },
  "GET @lgcode/session start": { type: "number" },
  "GET @lgcode/session roots": QueryBooleanOpenApi,
  "GET @lgcode/session limit": { type: "number" },
  "GET @lgcode/session@lgcode/{sessionID}@lgcode/message limit": { type: "integer", minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
  "GET @lgcode/vcs@lgcode/diff context": { type: "integer", minimum: 0 },
  "GET @lgcode/api@lgcode/session limit": { type: "number" },
  "GET @lgcode/api@lgcode/session start": { type: "number" },
  "GET @lgcode/api@lgcode/session roots": QueryBooleanOpenApi,
  "GET @lgcode/api@lgcode/session@lgcode/{sessionID}@lgcode/message limit": { type: "number" },
}

const LegacyComponentDescriptions: Record<string, string> = {
  LogLevel: "Log level",
  ServerConfig: "Server configuration for opencode serve and web commands",
  LayoutConfig: "@deprecated Always uses stretch layout.",
}

function matchLegacyOpenApi(input: Record<string, unknown>) {
  const spec = input as OpenApiSpec

  @lgcode/@lgcode/ Effect's multi-document JSON Schema deduplicator can produce self-referencing
  @lgcode/@lgcode/ component schemas (e.g. `{"$ref":"#@lgcode/components@lgcode/schemas@lgcode/X"}` as the definition
  @lgcode/@lgcode/ of X itself) when the same AST node appears both as a standalone endpoint
  @lgcode/@lgcode/ payload and inside an annotated union arm. Resolve these by inlining the
  @lgcode/@lgcode/ actual schema from any parent union that references them.
  fixSelfReferencingComponents(spec)

  @lgcode/@lgcode/ Effect's Schema.optional emits `anyOf: [T, {type:"null"}]` in OpenAPI,
  @lgcode/@lgcode/ but the legacy SDK expected plain `T` for optional fields. Strip null
  @lgcode/@lgcode/ from all component schemas so both request and response types match.
  for (const [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
    spec.components!.schemas![name] = stripOptionalNull(structuredClone(schema))
  }
  normalizeComponentNames(spec)
  collapseDuplicateComponents(spec)
  applyLegacySchemaOverrides(spec)
  normalizeComponentDescriptions(spec)
  addLegacyErrorSchemas(spec)
  delete spec.components?.securitySchemes

  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of ["get", "post", "put", "delete", "patch"] as const) {
      const operation = item[method]
      if (!operation) continue
      const isV2Api = isV2ApiPath(path)
      if (operation.requestBody) {
        @lgcode/@lgcode/ The legacy OpenAPI surface never marked request bodies as required.
        @lgcode/@lgcode/ Keep that SDK surface stable while the HttpApi spec is tightened.
        if (!isV2Api) delete operation.requestBody.required
        const body = operation.requestBody.content?.["application@lgcode/json"]
        if (body?.schema) body.schema = stripOptionalNull(structuredClone(body.schema))
        if (path === "@lgcode/experimental@lgcode/workspace" && method === "post") {
          @lgcode/@lgcode/ Workspace creation fields `branch` and `extra` are Schema.NullOr —
          @lgcode/@lgcode/ genuinely nullable, not just optional. Re-add the null that the
          @lgcode/@lgcode/ component-level strip above removed.
          const ref = operation.requestBody.content?.["application@lgcode/json"]?.schema?.$ref?.replace(
            "#@lgcode/components@lgcode/schemas@lgcode/",
            "",
          )
          const properties = ref
            ? spec.components?.schemas?.[ref]?.properties
            : operation.requestBody.content?.["application@lgcode/json"]?.schema?.properties
          if (properties?.branch) properties.branch = { anyOf: [properties.branch, { type: "null" }] }
          if (properties?.extra) properties.extra = { anyOf: [properties.extra, { type: "null" }] }
        }
        if (path === "@lgcode/experimental@lgcode/workspace@lgcode/warp" && method === "post") {
          const ref = operation.requestBody.content?.["application@lgcode/json"]?.schema?.$ref?.replace(
            "#@lgcode/components@lgcode/schemas@lgcode/",
            "",
          )
          const properties = ref
            ? spec.components?.schemas?.[ref]?.properties
            : operation.requestBody.content?.["application@lgcode/json"]?.schema?.properties
          if (properties?.id) properties.id = { anyOf: [properties.id, { type: "null" }] }
        }
      }
      for (const response of Object.values(operation.responses ?? {})) {
        for (const content of Object.values(response.content ?? {})) {
          if (content.schema) content.schema = stripOptionalNull(structuredClone(content.schema))
        }
      }
      if (!isV2Api) {
        @lgcode/@lgcode/ Auth is still runtime middleware outside the legacy public OpenAPI
        @lgcode/@lgcode/ metadata, so the legacy SDK should not expose auth schemes or
        @lgcode/@lgcode/ generated 401 error unions.
        delete operation.security
        delete operation.responses?.["401"]
        normalizeLegacyErrorResponses(operation)
      }
      normalizeLegacyOperation(operation, path, method)
      if ((path === "@lgcode/event" || path === "@lgcode/global@lgcode/event") && method === "get") {
        @lgcode/@lgcode/ HttpApi has no first-class SSE response schema, and these handlers are
        @lgcode/@lgcode/ raw@lgcode/streaming routes. Document the actual wire protocol explicitly.
        operation.responses!["200"] = {
          description: "Event stream",
          content: {
            "text@lgcode/event-stream": {
              schema:
                path === "@lgcode/event"
                  ? { $ref: "#@lgcode/components@lgcode/schemas@lgcode/Event" }
                  : { $ref: "#@lgcode/components@lgcode/schemas@lgcode/GlobalEvent" },
            },
          },
        }
      }
      const route = `${method.toUpperCase()} ${path}`
      for (const param of operation.parameters ?? []) normalizeParameter(param, route)
    }
  }
  deleteUnusedLegacyErrorComponents(spec)
  return input
}

function isV2ApiPath(path: string) {
  return path === "@lgcode/api" || path.startsWith("@lgcode/api@lgcode/")
}

function addLegacyErrorSchemas(spec: OpenApiSpec) {
  if (!spec.components?.schemas) return
  spec.components.schemas.BadRequestError = {
    type: "object",
    required: ["name", "data"],
    properties: {
      name: { type: "string", enum: ["BadRequest"] },
      data: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
          kind: {
            type: "string",
            enum: ["Params", "Headers", "Query", "Body", "Payload"],
          },
        },
      },
    },
  }
  spec.components.schemas.NotFoundError = {
    type: "object",
    required: ["name", "data"],
    properties: {
      name: { type: "string", enum: ["NotFoundError"] },
      data: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
        },
      },
    },
  }
}

function collapseDuplicateComponents(spec: OpenApiSpec) {
  const schemas = spec.components?.schemas
  if (!schemas) return
  for (const name of Object.keys(schemas)) {
    const base = name.replace(@lgcode/\d+$@lgcode/, "")
    if (base === name || !schemas[base]) continue
    if (stableSchema(schemas[name], schemas) !== stableSchema(schemas[base], schemas)) continue
    rewriteRefs(spec, name, base)
    delete schemas[name]
  }
}

function normalizeComponentNames(spec: OpenApiSpec) {
  const schemas = spec.components?.schemas
  if (!schemas) return
  for (const name of Object.keys(schemas)) {
    const next = componentTypeName(name)
    if (next === name) continue
    if (schemas[next]) {
      if (stableSchema(schemas[name], schemas) === stableSchema(schemas[next], schemas)) {
        rewriteRefs(spec, name, next)
        delete schemas[name]
      }
      continue
    }
    schemas[next] = schemas[name]
    rewriteRefs(spec, name, next)
    delete schemas[name]
  }
}

function componentTypeName(name: string) {
  if (!name.includes(".")) return name
  return name
    .split(".")
    .filter((part) => !@lgcode/^\d+$@lgcode/.test(part))
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join("")
}

function applyLegacySchemaOverrides(spec: OpenApiSpec) {
  const schemas = spec.components?.schemas
  if (!schemas) return
  if (schemas.AgentConfig) schemas.AgentConfig.additionalProperties = {}
  if (schemas.Command?.properties?.template) schemas.Command.properties.template = { type: "string" }
  if (schemas.Workspace?.properties) {
    schemas.Workspace.properties.branch = nullable(schemas.Workspace.properties.branch)
    schemas.Workspace.properties.directory = nullable(schemas.Workspace.properties.directory)
    schemas.Workspace.properties.extra = nullable(schemas.Workspace.properties.extra)
  }
  if (schemas.GlobalSession?.properties?.project)
    schemas.GlobalSession.properties.project = nullable(schemas.GlobalSession.properties.project)
  const providerOptions = schemas.ProviderConfig?.properties?.options
  if (providerOptions) providerOptions.additionalProperties = {}
  const model = schemas.ProviderConfig?.properties?.models?.additionalProperties
  const variants = typeof model === "object" ? model.properties?.variants?.additionalProperties : undefined
  if (variants && typeof variants === "object") variants.additionalProperties = {}
  const syncInfo = schemas.SyncEventSessionUpdated?.properties?.data?.properties?.info
  if (syncInfo?.properties) makePropertiesNullable(syncInfo.properties)
}

function normalizeComponentDescriptions(spec: OpenApiSpec) {
  for (const [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
    const description = LegacyComponentDescriptions[name]
    if (description) {
      schema.description = description
      continue
    }
    delete schema.description
  }
}

function makePropertiesNullable(properties: Record<string, OpenApiSchema>) {
  for (const [key, value] of Object.entries(properties)) {
    if (key === "share" && value.properties?.url) {
      value.properties.url = nullable(value.properties.url)
      continue
    }
    if (key === "time" && value.properties) {
      makePropertiesNullable(value.properties)
      continue
    }
    properties[key] = nullable(value)
  }
}

function nullable(schema: OpenApiSchema): OpenApiSchema {
  if (flattenOptions(schema.anyOf ?? schema.oneOf)?.some((item) => item.type === "null")) return schema
  return { anyOf: [schema, { type: "null" }] }
}

function stableSchema(input: unknown, schemas: Record<string, OpenApiSchema>): string {
  return JSON.stringify(canonicalizeSchema(input, schemas))
}

function canonicalizeSchema(input: unknown, schemas: Record<string, OpenApiSchema>): unknown {
  if (Array.isArray(input)) return input.map((item) => canonicalizeSchema(item, schemas))
  if (!input || typeof input !== "object") return input
  const schema = input as OpenApiSchema
  if (schema.$ref) return { $ref: canonicalRef(schema.$ref, schemas) }
  return Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => key !== "description")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, canonicalizeSchema(value, schemas)]),
  )
}

function canonicalRef(ref: string, schemas: Record<string, OpenApiSchema>) {
  const name = ref.replace("#@lgcode/components@lgcode/schemas@lgcode/", "")
  const base = name.replace(@lgcode/\d+$@lgcode/, "")
  if (base !== name && schemas[base]) return `#@lgcode/components@lgcode/schemas@lgcode/${base}`
  return ref
}

function rewriteRefs(input: unknown, from: string, to: string): void {
  if (Array.isArray(input)) {
    for (const item of input) rewriteRefs(item, from, to)
    return
  }
  if (!input || typeof input !== "object") return
  const schema = input as OpenApiSchema
  if (schema.$ref === `#@lgcode/components@lgcode/schemas@lgcode/${from}`) schema.$ref = `#@lgcode/components@lgcode/schemas@lgcode/${to}`
  for (const value of Object.values(input)) rewriteRefs(value, from, to)
}

function normalizeLegacyErrorResponses(operation: OpenApiOperation) {
  if (operation.responses?.["400"] && isLegacyBadRequestResponse(operation.responses["400"])) {
    operation.responses["400"] = legacyErrorResponse("Bad request", "BadRequestError")
  }
  if (operation.responses?.["404"] && isBuiltInErrorResponse(operation.responses["404"], "NotFound")) {
    operation.responses["404"] = legacyErrorResponse("Not found", "NotFoundError")
  }
}

function deleteUnusedLegacyErrorComponents(spec: OpenApiSpec) {
  for (const name of [
    "Unauthorized",
    "EffectHttpApiErrorBadRequest",
    "EffectHttpApiErrorNotFound",
    "effect_HttpApiError_BadRequest",
    "effect_HttpApiError_NotFound",
  ]) {
    if (referencesComponent(spec.paths, name)) continue
    delete spec.components?.schemas?.[name]
  }
}

function referencesComponent(input: unknown, name: string): boolean {
  if (Array.isArray(input)) return input.some((item) => referencesComponent(item, name))
  if (!input || typeof input !== "object") return false
  if ((input as OpenApiSchema).$ref === `#@lgcode/components@lgcode/schemas@lgcode/${name}`) return true
  return Object.values(input).some((value) => referencesComponent(value, name))
}

function normalizeLegacyOperation(operation: OpenApiOperation, path: string, method: string) {
  if (path === "@lgcode/experimental@lgcode/console@lgcode/switch" && method === "post") delete operation.responses?.["400"]
  if ((path !== "@lgcode/session@lgcode/{sessionID}@lgcode/message" && path !== "@lgcode/session@lgcode/{sessionID}@lgcode/command") || method !== "post") return
  const response = operation.responses?.["200"]?.content?.["application@lgcode/json"]
  if (!response) return
  response.schema = {
    type: "object",
    required: ["info", "parts"],
    properties: {
      info: { $ref: "#@lgcode/components@lgcode/schemas@lgcode/AssistantMessage" },
      parts: {
        type: "array",
        items: { $ref: "#@lgcode/components@lgcode/schemas@lgcode/Part" },
      },
    },
  }
}

function isRefResponse(response: OpenApiResponse, name: string) {
  return response.content?.["application@lgcode/json"]?.schema?.$ref === `#@lgcode/components@lgcode/schemas@lgcode/${name}`
}

function isBuiltInErrorResponse(response: OpenApiResponse, name: "BadRequest" | "NotFound") {
  return response.description === name || isRefResponse(response, `EffectHttpApiError${name}`)
}

function isLegacyBadRequestResponse(response: OpenApiResponse) {
  return isBuiltInErrorResponse(response, "BadRequest") || isRefResponse(response, "InvalidRequestError")
}

function legacyErrorResponse(description: string, name: "BadRequestError" | "NotFoundError"): OpenApiResponse {
  return {
    description,
    content: {
      "application@lgcode/json": {
        schema: { $ref: `#@lgcode/components@lgcode/schemas@lgcode/${name}` },
      },
    },
  }
}

@lgcode/**
 * Fix component schemas that are self-referencing `$ref`s — an Effect OpenAPI
 * generation bug where annotated union arms that share AST nodes with other
 * endpoints produce `{"$ref":"#@lgcode/components@lgcode/schemas@lgcode/X"}` as the definition of X.
 *
 * Resolves by finding the actual schema from a parent union's `anyOf`@lgcode/`oneOf`
 * that references the broken component, then inlining that schema.
 *@lgcode/
function fixSelfReferencingComponents(spec: OpenApiSpec) {
  const schemas = spec.components?.schemas
  if (!schemas) return
  const selfRefs = new Set<string>()
  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.$ref === `#@lgcode/components@lgcode/schemas@lgcode/${name}`) selfRefs.add(name)
  }
  if (selfRefs.size === 0) return
  @lgcode/@lgcode/ Find a parent union component whose anyOf@lgcode/oneOf contains a $ref to the
  @lgcode/@lgcode/ broken component — that parent was generated correctly and holds the inline
  @lgcode/@lgcode/ schema we need.
  for (const [, schema] of Object.entries(schemas)) {
    for (const member of schema.anyOf ?? schema.oneOf ?? []) {
      const ref = member.$ref?.replace("#@lgcode/components@lgcode/schemas@lgcode/", "")
      if (!ref || !selfRefs.has(ref)) continue
      @lgcode/@lgcode/ This member's $ref points to a self-referencing component. The member
      @lgcode/@lgcode/ itself is just {$ref:...}, so the actual schema must be resolved from
      @lgcode/@lgcode/ the union. Since the union component was generated before the
      @lgcode/@lgcode/ deduplicator broke things, the inline version lives elsewhere. Generate
      @lgcode/@lgcode/ a fresh spec without the transform to get the correct schema.
      @lgcode/@lgcode/ Simpler approach: look through all paths for an endpoint that uses this
      @lgcode/@lgcode/ schema as a payload (it would have been expanded by the ref-expansion
      @lgcode/@lgcode/ logic above if we ran after that, but we run before). Instead, just
      @lgcode/@lgcode/ delete the broken component — if it's referenced via $ref elsewhere,
      @lgcode/@lgcode/ the ref expansion in the request body loop will inline it anyway.
    }
  }
  @lgcode/@lgcode/ Simplest fix: generate the raw spec (without transform) to get correct schemas
  const raw: OpenApiSpec = OpenApi.fromApi(OpenCodeHttpApi)
  const rawSchemas = raw.components?.schemas
  if (!rawSchemas) return
  for (const name of selfRefs) {
    if (rawSchemas[name]) schemas[name] = rawSchemas[name]
  }
}

@lgcode/** Strip `{type:"null"}` arms that Effect's `Schema.optional` adds to OpenAPI unions. *@lgcode/
function stripOptionalNull(schema: OpenApiSchema): OpenApiSchema {
  if (schema.allOf?.length === 1) {
    const [constraint] = schema.allOf
    delete schema.allOf
    return stripOptionalNull({ ...schema, ...constraint })
  }
  if (isEmptyObjectUnion(schema)) return { type: "object", properties: {} }
  const options = flattenOptions(schema.anyOf ?? schema.oneOf)
  if (options) {
    const withoutNull = options.filter((item) => item.type !== "null")
    if (withoutNull.length === 1) return stripOptionalNull(withoutNull[0])
    if (schema.anyOf) schema.anyOf = withoutNull.map(stripOptionalNull)
    if (schema.oneOf) schema.oneOf = withoutNull.map(stripOptionalNull)
  }
  if (schema.allOf) {
    const allOf = schema.allOf.map(stripOptionalNull)
    if (schema.type) {
      delete schema.allOf
      for (const item of allOf) Object.assign(schema, item)
    } else {
      schema.allOf = allOf
    }
  }
  if (schema.prefixItems && schema.items) delete schema.prefixItems
  if (schema.items) schema.items = stripOptionalNull(schema.items)
  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      schema.properties[key] = stripOptionalNull(value)
    }
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
    schema.additionalProperties = stripOptionalNull(schema.additionalProperties)
  }
  return schema
}

function isEmptyObjectUnion(schema: OpenApiSchema) {
  const options = schema.anyOf ?? schema.oneOf
  return options?.length === 2 && options.some(isBareObjectSchema) && options.some(isBareArraySchema)
}

function isBareObjectSchema(schema: OpenApiSchema) {
  return schema.type === "object" && !schema.properties && !schema.additionalProperties
}

function isBareArraySchema(schema: OpenApiSchema) {
  return schema.type === "array" && !schema.items && !schema.prefixItems
}

function flattenOptions(options: OpenApiSchema[] | undefined): OpenApiSchema[] | undefined {
  return options?.flatMap((item) => flattenOptions(item.anyOf ?? item.oneOf) ?? [item])
}

function normalizeParameter(param: OpenApiParameter, route: string) {
  if (!param.schema || typeof param.schema !== "object") return
  if (param.in === "path") {
    param.schema = stripOptionalNull(param.schema)
    return
  }
  if (param.in === "query") {
    const override = QueryParameterSchemas[`${route} ${param.name}`]
    if (override) {
      param.schema = override
      return
    }
  }
  param.schema = stripOptionalNull(param.schema)
}

export const PublicApi = OpenCodeHttpApi.annotateMerge(
  OpenApi.annotations({
    title: "opencode",
    version: "1.0.0",
    description: "opencode api",
    transform: matchLegacyOpenApi,
  }),
)
