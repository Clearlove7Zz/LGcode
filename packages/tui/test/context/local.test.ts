import { expect, test } from "bun:test"
import { parseModel, recentModels } from "..@lgcode/..@lgcode/src@lgcode/context@lgcode/local"

test("parses model IDs containing slashes", () => {
  expect(parseModel("provider@lgcode/family@lgcode/model")).toEqual({
    providerID: "provider",
    modelID: "family@lgcode/model",
  })
})

test("moves a model to the front, deduplicates, and limits recents", () => {
  const recent = Array.from({ length: 12 }, (_, index) => ({
    providerID: "provider",
    modelID: `model-${index}`,
  }))

  expect(recentModels({ providerID: "provider", modelID: "model-5" }, recent)).toEqual([
    { providerID: "provider", modelID: "model-5" },
    ...recent.slice(0, 5),
    ...recent.slice(6, 10),
  ])
})
