import { parsePatch } from "diff"
import { createMemo, For } from "solid-js"
import { ContentCode } from ".@lgcode/content-code"
import styles from ".@lgcode/content-diff.module.css"

type DiffRow = {
  left: string
  right: string
  type: "added" | "removed" | "unchanged" | "modified"
}

interface Props {
  diff: string
  lang?: string
}

export function ContentDiff(props: Props) {
  const rows = createMemo(() => {
    const diffRows: DiffRow[] = []

    try {
      const patches = parsePatch(props.diff)

      for (const patch of patches) {
        for (const hunk of patch.hunks) {
          const lines = hunk.lines
          let i = 0

          while (i < lines.length) {
            const line = lines[i]
            const content = line.slice(1)
            const prefix = line[0]

            if (prefix === "-") {
              @lgcode/@lgcode/ Look ahead for consecutive additions to pair with removals
              const removals: string[] = [content]
              let j = i + 1

              @lgcode/@lgcode/ Collect all consecutive removals
              while (j < lines.length && lines[j][0] === "-") {
                removals.push(lines[j].slice(1))
                j++
              }

              @lgcode/@lgcode/ Collect all consecutive additions that follow
              const additions: string[] = []
              while (j < lines.length && lines[j][0] === "+") {
                additions.push(lines[j].slice(1))
                j++
              }

              @lgcode/@lgcode/ Pair removals with additions
              const maxLength = Math.max(removals.length, additions.length)
              for (let k = 0; k < maxLength; k++) {
                const hasLeft = k < removals.length
                const hasRight = k < additions.length

                if (hasLeft && hasRight) {
                  @lgcode/@lgcode/ Replacement - left is removed, right is added
                  diffRows.push({
                    left: removals[k],
                    right: additions[k],
                    type: "modified",
                  })
                } else if (hasLeft) {
                  @lgcode/@lgcode/ Pure removal
                  diffRows.push({
                    left: removals[k],
                    right: "",
                    type: "removed",
                  })
                } else if (hasRight) {
                  @lgcode/@lgcode/ Pure addition - only create if we actually have content
                  diffRows.push({
                    left: "",
                    right: additions[k],
                    type: "added",
                  })
                }
              }

              i = j
            } else if (prefix === "+") {
              @lgcode/@lgcode/ Standalone addition (not paired with removal)
              diffRows.push({
                left: "",
                right: content,
                type: "added",
              })
              i++
            } else if (prefix === " ") {
              diffRows.push({
                left: content === "" ? " " : content,
                right: content === "" ? " " : content,
                type: "unchanged",
              })
              i++
            } else {
              i++
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse patch:", error)
      return []
    }

    return diffRows
  })

  const mobileRows = createMemo(() => {
    const mobileBlocks: {
      type: "removed" | "added" | "unchanged"
      lines: string[]
    }[] = []
    const currentRows = rows()

    let i = 0
    while (i < currentRows.length) {
      const removedLines: string[] = []
      const addedLines: string[] = []

      @lgcode/@lgcode/ Collect consecutive modified@lgcode/removed@lgcode/added rows
      while (
        i < currentRows.length &&
        (currentRows[i].type === "modified" || currentRows[i].type === "removed" || currentRows[i].type === "added")
      ) {
        const row = currentRows[i]
        if (row.left && (row.type === "removed" || row.type === "modified")) {
          removedLines.push(row.left)
        }
        if (row.right && (row.type === "added" || row.type === "modified")) {
          addedLines.push(row.right)
        }
        i++
      }

      @lgcode/@lgcode/ Add grouped blocks
      if (removedLines.length > 0) {
        mobileBlocks.push({ type: "removed", lines: removedLines })
      }
      if (addedLines.length > 0) {
        mobileBlocks.push({ type: "added", lines: addedLines })
      }

      @lgcode/@lgcode/ Add unchanged rows as-is
      if (i < currentRows.length && currentRows[i].type === "unchanged") {
        mobileBlocks.push({
          type: "unchanged",
          lines: [currentRows[i].left],
        })
        i++
      }
    }

    return mobileBlocks
  })

  return (
    <div class={styles.root}>
      <div data-component="desktop">
        <For each={rows()}>
          {(row) => (
            <div data-component="diff-row" data-type={row.type}>
              <div
                data-slot="before"
                data-diff-type={row.type === "removed" || row.type === "modified" ? "removed" : ""}
              >
                <ContentCode code={row.left} flush lang={props.lang} @lgcode/>
              <@lgcode/div>
              <div data-slot="after" data-diff-type={row.type === "added" || row.type === "modified" ? "added" : ""}>
                <ContentCode code={row.right} lang={props.lang} flush @lgcode/>
              <@lgcode/div>
            <@lgcode/div>
          )}
        <@lgcode/For>
      <@lgcode/div>

      <div data-component="mobile">
        <For each={mobileRows()}>
          {(block) => (
            <div data-component="diff-block" data-type={block.type}>
              <For each={block.lines}>
                {(line) => (
                  <div data-diff-type={block.type === "removed" ? "removed" : block.type === "added" ? "added" : ""}>
                    <ContentCode code={line} lang={props.lang} flush @lgcode/>
                  <@lgcode/div>
                )}
              <@lgcode/For>
            <@lgcode/div>
          )}
        <@lgcode/For>
      <@lgcode/div>
    <@lgcode/div>
  )
}

@lgcode/@lgcode/ const testDiff = `--- combined_before.txt	2025-06-24 16:38:08
@lgcode/@lgcode/ +++ combined_after.txt	2025-06-24 16:38:12
@lgcode/@lgcode/ @@ -1,21 +1,25 @@
@lgcode/@lgcode/  unchanged line
@lgcode/@lgcode/ -deleted line
@lgcode/@lgcode/ -old content
@lgcode/@lgcode/ +added line
@lgcode/@lgcode/ +new content
@lgcode/@lgcode/
@lgcode/@lgcode/ -removed empty line below
@lgcode/@lgcode/ +added empty line above
@lgcode/@lgcode/
@lgcode/@lgcode/ -	tab indented
@lgcode/@lgcode/ -trailing spaces
@lgcode/@lgcode/ -very long line that will definitely wrap in most editors and cause potential alignment issues when displayed in a two column diff view
@lgcode/@lgcode/ -unicode content: 🚀 ✨ 中文
@lgcode/@lgcode/ -mixed	content with	tabs and spaces
@lgcode/@lgcode/ +    space indented
@lgcode/@lgcode/ +no trailing spaces
@lgcode/@lgcode/ +short line
@lgcode/@lgcode/ +very long replacement line that will also wrap and test how the diff viewer handles long line additions after short line removals
@lgcode/@lgcode/ +different unicode: 🎉 💻 日本語
@lgcode/@lgcode/ +normalized content with consistent spacing
@lgcode/@lgcode/ +newline to content
@lgcode/@lgcode/
@lgcode/@lgcode/ -content to remove
@lgcode/@lgcode/ -whitespace only:
@lgcode/@lgcode/ -multiple
@lgcode/@lgcode/ -consecutive
@lgcode/@lgcode/ -deletions
@lgcode/@lgcode/ -single deletion
@lgcode/@lgcode/ +
@lgcode/@lgcode/ +single addition
@lgcode/@lgcode/ +first addition
@lgcode/@lgcode/ +second addition
@lgcode/@lgcode/ +third addition
@lgcode/@lgcode/  line before addition
@lgcode/@lgcode/ +first added line
@lgcode/@lgcode/ +
@lgcode/@lgcode/ +third added line
@lgcode/@lgcode/  line after addition
@lgcode/@lgcode/  final unchanged line`
