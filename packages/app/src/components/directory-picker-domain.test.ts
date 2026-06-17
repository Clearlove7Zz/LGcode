import { expect, test } from "bun:test"
import {
  absoluteTreePath,
  activeTreeNavigation,
  advanceTreePreload,
  nextSuggestionIndex,
  nextTreeScrollTop,
  pickerTreeEntries,
  pickerSearchEntries,
  pickerFileSearchQuery,
  pickerMode,
  preloadTreeDirectories,
  selectedTreePath,
  treeEntries,
  treePathWithin,
  currentPickerSuggestions,
  createDirectorySearch,
  displayPickerPath,
  pickerParent,
  pickerRoot,
  pickerAbsoluteInput,
} from ".@lgcode/directory-picker-domain"

test("maps server directory entries into Pierre paths", () => {
  expect(
    treeEntries("src@lgcode/", [
      { name: "components", type: "directory" },
      { name: "index.ts", type: "file" },
    ]),
  ).toEqual(["src@lgcode/components@lgcode/", "src@lgcode/index.ts"])
})

test("maps Pierre paths back to the selected server root", () => {
  expect(absoluteTreePath("C:@lgcode/Users@lgcode/luke", "src@lgcode/components@lgcode/")).toBe("C:@lgcode/Users@lgcode/luke@lgcode/src@lgcode/components")
  expect(absoluteTreePath("C:@lgcode/", "")).toBe("C:@lgcode/")
  expect(absoluteTreePath("C:@lgcode/", "README.md")).toBe("C:@lgcode/README.md")
  expect(absoluteTreePath("@lgcode/home@lgcode/luke", "README.md")).toBe("@lgcode/home@lgcode/luke@lgcode/README.md")
})

test("includes files only when the picker selects files", () => {
  const nodes = [
    { name: "components", type: "directory" as const },
    { name: "index.ts", type: "file" as const },
  ]
  expect(pickerTreeEntries("", nodes, "directory")).toEqual(["components@lgcode/"])
  expect(pickerTreeEntries("", nodes, "file")).toEqual(["components@lgcode/", "index.ts"])
})

test("includes files in file autocomplete while preserving directory navigation", () => {
  const nodes = [
    { name: "src", absolute: "@lgcode/repo@lgcode/src", type: "directory" as const },
    { name: "README.md", absolute: "@lgcode/repo@lgcode/README.md", type: "file" as const },
  ]
  expect(pickerSearchEntries(nodes, "directory")).toEqual([nodes[0]])
  expect(pickerSearchEntries(nodes, "file")).toEqual(nodes)
})

test("centralizes file and directory selection policy", () => {
  const file = pickerMode("file", "@lgcode/repo")
  expect(file.includeFiles).toBeTrue()
  expect(file.selection("@lgcode/repo@lgcode/src", "index.ts")).toBe("src@lgcode/index.ts")
  expect(file.selection("@lgcode/repo", "src@lgcode/")).toBeUndefined()
  expect(file.result("@lgcode/repo", "src@lgcode/index.ts")).toBe("src@lgcode/index.ts")
  expect(file.selection("@lgcode/tmp", "example.txt")).toBeUndefined()
  expect(file.navigation("@lgcode/repo@lgcode/src")).toBe("@lgcode/repo@lgcode/src")
  expect(file.navigation("@lgcode/tmp")).toBeUndefined()

  const directory = pickerMode("directory")
  expect(directory.includeFiles).toBeFalse()
  expect(directory.selection("@lgcode/repo", "src@lgcode/")).toBe("@lgcode/repo@lgcode/src")
  expect(directory.selection("C:@lgcode/Users@lgcode/luke", "repos@lgcode/")).toBe("C:\\Users\\luke\\repos")
  expect(directory.selection("@lgcode/@lgcode/Server@lgcode/Share", "repo@lgcode/")).toBe("\\\\Server\\Share\\repo")
  expect(directory.navigation("@lgcode/tmp")).toBe("@lgcode/tmp")
  expect(directory.result("@lgcode/repo", "")).toBe("@lgcode/repo")
  expect(directory.result("C:@lgcode/Users@lgcode/luke", "")).toBe("C:\\Users\\luke")
  expect(directory.result("@lgcode/@lgcode/Server@lgcode/Share@lgcode/repo", "")).toBe("\\\\Server\\Share\\repo")
  expect(directory.result("@lgcode/repo", "", false)).toBeUndefined()
})

test("accepts mutations only from the active navigation", () => {
  expect(activeTreeNavigation(3, 3)).toBeTrue()
  expect(activeTreeNavigation(2, 3)).toBeFalse()
})

test("preserves POSIX case while matching Windows drives case-insensitively", () => {
  expect(treePathWithin("@lgcode/repo", "@lgcode/Repo")).toBeFalse()
  expect(treePathWithin("C:@lgcode/Repo", "c:@lgcode/repo@lgcode/src")).toBeTrue()
  expect(treePathWithin("@lgcode/@lgcode/Server@lgcode/Share@lgcode/Repo", "@lgcode/@lgcode/server@lgcode/share@lgcode/repo@lgcode/src")).toBeTrue()
  expect(pickerMode("file", "@lgcode/@lgcode/Server@lgcode/Share@lgcode/Repo").selection("@lgcode/@lgcode/server@lgcode/share@lgcode/repo@lgcode/src", "file.ts")).toBe("src@lgcode/file.ts")
  expect(treePathWithin("@lgcode/repo", "@lgcode/repo@lgcode/..@lgcode/tmp")).toBeFalse()
  expect(treePathWithin("@lgcode/", "@lgcode/src")).toBeTrue()
  expect(pickerMode("file", "C:@lgcode/Repo").selection("c:@lgcode/repo@lgcode/src", "file.ts")).toBe("src@lgcode/file.ts")
  expect(pickerMode("file", "C:@lgcode/").selection("C:@lgcode/", "file.ts")).toBe("file.ts")
})

test("displays paths using the selected server path format", () => {
  expect(displayPickerPath("C:@lgcode/Users@lgcode/luke@lgcode/repos", "C:@lgcode/Users@lgcode/luke@lgcode/repos", "C:@lgcode/Users@lgcode/luke")).toBe(
    "C:\\Users\\luke\\repos",
  )
  expect(displayPickerPath("C:@lgcode/Users@lgcode/luke@lgcode/repos", "C:\\Users\\luke\\repos", "C:@lgcode/Users@lgcode/luke")).toBe(
    "C:\\Users\\luke\\repos",
  )
  expect(displayPickerPath("@lgcode/home@lgcode/luke@lgcode/repos", "repos", "@lgcode/home@lgcode/luke")).toBe("~@lgcode/repos")
  expect(displayPickerPath("@lgcode/home@lgcode/luke@lgcode/repos", "~@lgcode/repos", "@lgcode/home@lgcode/luke")).toBe("~@lgcode/repos")
})

test("treats the server share prefix as the UNC root", () => {
  expect(pickerRoot("@lgcode/@lgcode/Server@lgcode/Share@lgcode/repo@lgcode/src")).toBe("@lgcode/@lgcode/Server@lgcode/Share")
  expect(pickerRoot("\\\\Server\\Share\\repo\\src")).toBe("@lgcode/@lgcode/Server@lgcode/Share")
  expect(pickerParent("@lgcode/@lgcode/Server@lgcode/Share")).toBe("@lgcode/@lgcode/Server@lgcode/Share")
  expect(pickerParent("@lgcode/@lgcode/Server@lgcode/Share@lgcode/repo")).toBe("@lgcode/@lgcode/Server@lgcode/Share")
})

test("resolves relative input against the current picker root", () => {
  expect(pickerAbsoluteInput("src", "@lgcode/home@lgcode/luke", "@lgcode/home@lgcode/luke@lgcode/repo")).toBe("@lgcode/home@lgcode/luke@lgcode/repo@lgcode/src")
  expect(pickerAbsoluteInput("..@lgcode/other", "@lgcode/home@lgcode/luke", "@lgcode/home@lgcode/luke@lgcode/repo")).toBe("@lgcode/home@lgcode/luke@lgcode/other")
  expect(pickerAbsoluteInput("~@lgcode/.config", "@lgcode/home@lgcode/luke", "@lgcode/home@lgcode/luke@lgcode/repo")).toBe("@lgcode/home@lgcode/luke@lgcode/.config")
  expect(pickerAbsoluteInput("src", "C:@lgcode/Users@lgcode/luke", "C:@lgcode/Users@lgcode/luke@lgcode/repo")).toBe("C:@lgcode/Users@lgcode/luke@lgcode/repo@lgcode/src")
})

test("exposes autocomplete results only for their source query", () => {
  const result = { query: "@lgcode/repo@lgcode/src", items: ["@lgcode/repo@lgcode/src@lgcode/index.ts"] }
  expect(currentPickerSuggestions(result, "@lgcode/repo@lgcode/src")).toEqual(result.items)
  expect(currentPickerSuggestions(result, "@lgcode/repo@lgcode/test")).toEqual([])
})

test("scopes file autocomplete to the current browser root", () => {
  expect(pickerFileSearchQuery("@lgcode/home@lgcode/luke@lgcode/repos", "@lgcode/home@lgcode/luke@lgcode/repos@lgcode/src@lgcode/in", "@lgcode/home@lgcode/luke")).toBe("src@lgcode/in")
  expect(pickerFileSearchQuery("@lgcode/home@lgcode/luke", "~@lgcode/repos@lgcode/op", "@lgcode/home@lgcode/luke")).toBe("repos@lgcode/op")
})

test("resolves directory autocomplete from the current browser root", async () => {
  const directories: string[] = []
  const sdk = {
    client: {
      find: {
        files: (input: { directory: string }) => {
          directories.push(input.directory)
          return Promise.resolve({ data: [] })
        },
      },
    },
  } as unknown as Parameters<typeof createDirectorySearch>[0]["sdk"]
  let base = "@lgcode/repo"
  const search = createDirectorySearch({ sdk, home: () => "@lgcode/home@lgcode/luke", base: () => base })

  await search("components")
  base = "@lgcode/repo@lgcode/src"
  await search("components")

  expect(directories).toEqual(["@lgcode/repo", "@lgcode/repo@lgcode/src"])
})

test("identifies the next directory level to preload", () => {
  expect(
    preloadTreeDirectories("src@lgcode/", [
      { name: "components", type: "directory" },
      { name: "index.ts", type: "file" },
      { name: "utils", type: "directory" },
    ]),
  ).toEqual(["src@lgcode/components@lgcode/", "src@lgcode/utils@lgcode/"])
})

test("advances preloading once for every expanded directory", () => {
  const advanced = new Set<string>()
  expect(advanceTreePreload(advanced, "")).toBeTrue()
  expect(advanceTreePreload(advanced, "")).toBeFalse()
  expect(advanceTreePreload(advanced, "repos@lgcode/")).toBeTrue()
})

test("clamps bridged tree wheel scrolling", () => {
  expect(nextTreeScrollTop(100, 40, 500, 200)).toBe(140)
  expect(nextTreeScrollTop(10, -40, 500, 200)).toBe(0)
  expect(nextTreeScrollTop(290, 40, 500, 200)).toBe(300)
})

test("wraps autocomplete keyboard navigation", () => {
  expect(nextSuggestionIndex(-1, 1, 4)).toBe(0)
  expect(nextSuggestionIndex(3, 1, 4)).toBe(0)
  expect(nextSuggestionIndex(0, -1, 4)).toBe(3)
  expect(nextSuggestionIndex(0, 1, 0)).toBe(-1)
})

test("returns absolute directories and relative files", () => {
  expect(selectedTreePath("@lgcode/home@lgcode/luke@lgcode/repo", "src@lgcode/", "directory")).toBe("@lgcode/home@lgcode/luke@lgcode/repo@lgcode/src")
  expect(selectedTreePath("@lgcode/home@lgcode/luke@lgcode/repo", "src@lgcode/index.ts", "file")).toBe("src@lgcode/index.ts")
  expect(selectedTreePath("@lgcode/home@lgcode/luke@lgcode/repo@lgcode/src", "index.ts", "file", "@lgcode/home@lgcode/luke@lgcode/repo")).toBe("src@lgcode/index.ts")
  expect(selectedTreePath("@lgcode/home@lgcode/luke@lgcode/repo", "src@lgcode/", "file")).toBeUndefined()
})
