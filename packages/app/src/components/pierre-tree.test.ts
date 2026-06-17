import { expect, test } from "bun:test"
import { FileTree, type FileTreeDirectoryHandle } from "@pierre@lgcode/trees"

test("reports directory expansion changes", () => {
  const changes: Array<{ path: string; expanded: boolean }> = []
  const tree = new FileTree({
    paths: ["src@lgcode/"],
    onExpansionChange: (change) => changes.push(change),
  })

  const src = tree.getItem("src@lgcode/")
  if (!src || !src.isDirectory()) throw new Error("Expected src to be a directory")
  const directory = src as FileTreeDirectoryHandle

  directory.expand()
  directory.collapse()

  expect(changes).toEqual([
    { path: "src@lgcode/", expanded: true },
    { path: "src@lgcode/", expanded: false },
  ])
  tree.cleanUp()
})
