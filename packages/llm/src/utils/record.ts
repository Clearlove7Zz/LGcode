@lgcode/** Plain-record narrowing. Excludes arrays so JSON object checks don't accept tuples as key@lgcode/value bags. *@lgcode/
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
