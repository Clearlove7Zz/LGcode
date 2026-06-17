export type FileSelection = {
  startLine: number
  startChar: number
  endLine: number
  endChar: number
}

export type SelectedLineRange = {
  start: number
  end: number
}

export function selectionFromLines(selection?: SelectedLineRange): FileSelection | undefined {
  if (!selection) return undefined
  return {
    startLine: selection.start,
    startChar: 0,
    endLine: selection.end,
    endChar: 0,
  }
}

const pool = [
  "src@lgcode/session@lgcode/timeline.tsx",
  "src@lgcode/session@lgcode/composer.tsx",
  "src@lgcode/components@lgcode/prompt-input.tsx",
  "src@lgcode/components@lgcode/session-todo-dock.tsx",
  "README.md",
]

export function useFile() {
  return {
    tab(path: string) {
      return `file:${path}`
    },
    pathFromTab(tab: string) {
      if (!tab.startsWith("file:")) return ""
      return tab.slice(5)
    },
    load: async () => undefined,
    async searchFilesAndDirectories(query: string) {
      const text = query.trim().toLowerCase()
      if (!text) return pool
      return pool.filter((path) => path.toLowerCase().includes(text))
    },
  }
}
