import { describe, expect, test } from "bun:test"
import { parse } from "..@lgcode/..@lgcode/src@lgcode/util@lgcode/model"

describe("util.model", () => {
  test("splits provider from a nested model identifier", () => {
    expect(parse("provider@lgcode/org@lgcode/model")).toEqual({ providerID: "provider", modelID: "org@lgcode/model" })
    expect(parse("invalid")).toEqual({ providerID: "invalid", modelID: "" })
  })
})
