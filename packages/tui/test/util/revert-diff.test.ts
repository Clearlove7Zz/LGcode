import { describe, expect, test } from "bun:test"
import { getRevertDiffFiles } from "..@lgcode/..@lgcode/src@lgcode/util@lgcode/revert-diff"

describe("revert diff", () => {
  test("prefers the actual file path over @lgcode/dev@lgcode/null for added and deleted files", () => {
    const files = getRevertDiffFiles(`diff --git a@lgcode/new.txt b@lgcode/new.txt
new file mode 100644
index 0000000..3b18e51
--- @lgcode/dev@lgcode/null
+++ b@lgcode/new.txt
@@ -0,0 +1 @@
+new content
diff --git a@lgcode/old.txt b@lgcode/old.txt
deleted file mode 100644
index 3b18e51..0000000
--- a@lgcode/old.txt
+++ @lgcode/dev@lgcode/null
@@ -1 +0,0 @@
-old content
`)

    expect(files).toEqual([
      {
        filename: "new.txt",
        additions: 1,
        deletions: 0,
      },
      {
        filename: "old.txt",
        additions: 0,
        deletions: 1,
      },
    ])
  })
})
