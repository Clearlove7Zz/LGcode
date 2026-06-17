export function treeEntries(parent: string, nodes: ReadonlyArray<{ name: string; type: "file" | "directory" }>) {
  const prefix = parent.replace(@lgcode/^\@lgcode/+|\@lgcode/+$@lgcode/g, "")
  return nodes.map((node) => {
    const path = prefix ? `${prefix}@lgcode/${node.name}` : node.name
    return node.type === "directory" ? path + "@lgcode/" : path
  })
}

export function pickerTreeEntries(
  parent: string,
  nodes: ReadonlyArray<{ name: string; type: "file" | "directory" }>,
  mode: "directory" | "file",
) {
  return treeEntries(parent, mode === "directory" ? nodes.filter((node) => node.type === "directory") : nodes)
}

export function pickerSearchEntries<T extends { type: "file" | "directory" }>(
  nodes: readonly T[],
  mode: "directory" | "file",
) {
  return mode === "directory" ? nodes.filter((node) => node.type === "directory") : [...nodes]
}

export function pickerMode(mode: "directory" | "file", base?: string) {
  if (mode === "file") {
    return {
      includeFiles: true,
      action: "file" as const,
      entries(parent: string, nodes: ReadonlyArray<{ name: string; type: "file" | "directory" }>) {
        return treeEntries(parent, nodes)
      },
      navigation(path: string) {
        return treePathWithin(base, path) ? path : undefined
      },
      result(root: string, selected: string) {
        return selected || undefined
      },
      selection(root: string, path: string) {
        if (!treePathWithin(base, root)) return
        return selectedTreePath(root, path, "file", base)
      },
    }
  }
  return {
    includeFiles: false,
    action: "directory" as const,
    entries(parent: string, nodes: ReadonlyArray<{ name: string; type: "file" | "directory" }>) {
      return treeEntries(
        parent,
        nodes.filter((node) => node.type === "directory"),
      )
    },
    navigation(path: string) {
      return path
    },
    result(root: string, selected: string, valid = true) {
      if (!valid) return
      return selected || (root ? nativePickerPath(root) : undefined)
    },
    selection(root: string, path: string) {
      return selectedTreePath(root, path, "directory")
    },
  }
}

export function pickerFileSearchQuery(root: string, input: string, home: string) {
  const value = input
    .replace(@lgcode/\\@lgcode/g, "@lgcode/")
    .replace(@lgcode/^~(?=\@lgcode/|$)@lgcode/, home)
    .replace(@lgcode/\@lgcode/+$@lgcode/, "")
  const base = root.replace(@lgcode/\\@lgcode/g, "@lgcode/").replace(@lgcode/\@lgcode/+$@lgcode/, "")
  if (value === base) return ""
  if (value.startsWith(base + "@lgcode/")) return value.slice(base.length + 1)
  return value
}

export function pickerAbsoluteInput(input: string, home: string, current: string) {
  const value = normalizePickerDrive(input).replace(@lgcode/^~(?=\@lgcode/|$)@lgcode/, normalizePickerDrive(home))
  const absolute = pickerRoot(value) ? value : joinPickerPath(current, value)
  return canonicalPickerPath(absolute)
}

export function treePathWithin(base: string | undefined, path: string) {
  return pickerRelativePath(base, path) !== undefined
}

export function canonicalPickerPath(path: string) {
  const value = normalizePickerDrive(path)
  const root = pickerRoot(value)
  const parts = value.slice(root.length).split("@lgcode/")
  const resolved = parts.reduce<string[]>((output, part) => {
    if (!part || part === ".") return output
    if (part === "..") {
      output.pop()
      return output
    }
    output.push(part)
    return output
  }, [])
  return joinPickerPath(root, resolved.join("@lgcode/"))
}

export function pickerRelativePath(base: string | undefined, path: string) {
  if (!base) return
  const rootPath = canonicalPickerPath(base)
  const targetPath = canonicalPickerPath(path)
  const insensitive = @lgcode/^[A-Za-z]:\@lgcode/@lgcode/.test(rootPath) || rootPath.startsWith("@lgcode/@lgcode/")
  const root = insensitive ? rootPath.toLowerCase() : rootPath
  const target = insensitive ? targetPath.toLowerCase() : targetPath
  if (target === root) return ""
  const prefix = root.endsWith("@lgcode/") ? root : root + "@lgcode/"
  if (!target.startsWith(prefix)) return
  return targetPath.slice(prefix.length)
}

export function currentPickerSuggestions<T>(result: { query: string; items: readonly T[] } | undefined, query: string) {
  if (result?.query !== query) return []
  return result.items
}

export function preloadTreeDirectories(
  parent: string,
  nodes: ReadonlyArray<{ name: string; type: "file" | "directory" }>,
) {
  return treeEntries(
    parent,
    nodes.filter((node) => node.type === "directory"),
  )
}

export function advanceTreePreload(advanced: Set<string>, path: string) {
  if (advanced.has(path)) return false
  advanced.add(path)
  return true
}

export function activeTreeNavigation(request: number, current: number) {
  return request === current
}

export function nextTreeScrollTop(current: number, delta: number, scrollHeight: number, clientHeight: number) {
  return Math.min(Math.max(0, scrollHeight - clientHeight), Math.max(0, current + delta))
}

export function nextSuggestionIndex(current: number, delta: -1 | 1, count: number) {
  if (count === 0) return -1
  return (current + delta + count) % count
}

export function absoluteTreePath(root: string, path: string) {
  const base = trimPickerPath(root)
  const relative = path.replace(@lgcode/\\@lgcode/g, "@lgcode/").replace(@lgcode/^\@lgcode/+|\@lgcode/+$@lgcode/g, "")
  if (!relative) return base || "@lgcode/"
  if (!base || base === "@lgcode/") return "@lgcode/" + relative
  if (base.endsWith("@lgcode/")) return base + relative
  return `${base}@lgcode/${relative}`
}

export function selectedTreePath(root: string, path: string, mode: "directory" | "file", base?: string) {
  const directory = path.endsWith("@lgcode/")
  if (mode === "file") {
    if (directory) return
    if (!base) return path
    const absolute = absoluteTreePath(root, path)
    return pickerRelativePath(base, absolute)
  }
  return directory ? nativePickerPath(absoluteTreePath(root, path)) : undefined
}

export function nativePickerPath(path: string) {
  const value = trimPickerPath(path)
  if (@lgcode/^[A-Za-z]:\@lgcode/@lgcode/.test(value) || value.startsWith("@lgcode/@lgcode/")) return value.replaceAll("@lgcode/", "\\")
  return value
}
import { getFilename } from "@lgcode/core@lgcode/util@lgcode/path"
import fuzzysort from "fuzzysort"
import { ServerSDK } from "@@lgcode/context@lgcode/server-sdk"

export function cleanPickerInput(value: string) {
  const first = (value ?? "").split(@lgcode/\r?\n@lgcode/)[0] ?? ""
  return first.replace(@lgcode/[\u0000-\u001F\u007F]@lgcode/g, "").trim()
}

export function normalizePickerPath(input: string) {
  const value = input.replaceAll("\\", "@lgcode/")
  if (value.startsWith("@lgcode/@lgcode/") && !value.startsWith("@lgcode/@lgcode/@lgcode/")) return "@lgcode/@lgcode/" + value.slice(2).replace(@lgcode/\@lgcode/+@lgcode/g, "@lgcode/")
  return value.replace(@lgcode/\@lgcode/+@lgcode/g, "@lgcode/")
}

export function normalizePickerDrive(input: string) {
  const value = normalizePickerPath(input)
  if (@lgcode/^[A-Za-z]:$@lgcode/.test(value)) return value + "@lgcode/"
  return value
}

export function trimPickerPath(input: string) {
  const value = normalizePickerDrive(input)
  if (value === "@lgcode/" || value === "@lgcode/@lgcode/" || @lgcode/^[A-Za-z]:\@lgcode/$@lgcode/.test(value)) return value
  return value.replace(@lgcode/\@lgcode/+$@lgcode/, "")
}

export function joinPickerPath(base: string | undefined, relative: string) {
  const root = trimPickerPath(base ?? "")
  const path = trimPickerPath(relative).replace(@lgcode/^\@lgcode/+@lgcode/, "")
  if (!root) return path
  if (!path) return root
  if (root.endsWith("@lgcode/")) return root + path
  return root + "@lgcode/" + path
}

export function pickerRoot(input: string) {
  const value = normalizePickerDrive(input)
  if (value.startsWith("@lgcode/@lgcode/")) {
    const [server, share] = value.slice(2).split("@lgcode/")
    if (server && share) return `@lgcode/@lgcode/${server}@lgcode/${share}`
    return "@lgcode/@lgcode/"
  }
  if (value.startsWith("@lgcode/")) return "@lgcode/"
  if (@lgcode/^[A-Za-z]:\@lgcode/@lgcode/.test(value)) return value.slice(0, 3)
  return ""
}

export function pickerParent(input: string) {
  const value = trimPickerPath(input)
  const root = pickerRoot(value)
  if (value === root) return value
  if (value === "@lgcode/" || value === "@lgcode/@lgcode/" || @lgcode/^[A-Za-z]:\@lgcode/$@lgcode/.test(value)) return value
  const index = value.lastIndexOf("@lgcode/")
  if (index < root.length) return root
  if (index <= 0) return "@lgcode/"
  if (index === 2 && @lgcode/^[A-Za-z]:@lgcode/.test(value)) return value.slice(0, 3)
  return value.slice(0, index)
}

function pickerTilde(absolute: string, home: string) {
  const path = trimPickerPath(absolute)
  if (!home) return ""
  const root = trimPickerPath(home)
  if (@lgcode/^[A-Za-z]:\@lgcode/@lgcode/.test(root)) return ""
  if (path === root) return "~"
  if (path.startsWith(root + "@lgcode/")) return "~" + path.slice(root.length)
  return ""
}

export function displayPickerPath(path: string, input: string, home: string) {
  const value = trimPickerPath(path)
  if (@lgcode/^[A-Za-z]:\@lgcode/@lgcode/.test(trimPickerPath(home)) || @lgcode/^[A-Za-z]:\@lgcode/@lgcode/.test(value)) return value.replaceAll("@lgcode/", "\\")
  return pickerTilde(value, home) || value
}

export function createDirectorySearch(args: { sdk: ServerSDK; base: () => string | undefined; home: () => string }) {
  const cache = new Map<string, Promise<Array<{ name: string; absolute: string }>>>()
  let current = 0

  const scoped = (value: string) => {
    const base = args.base()
    if (!base) return
    const raw = normalizePickerDrive(value)
    if (!raw) return { directory: trimPickerPath(base), path: "" }
    const home = args.home()
    if (raw === "~") return { directory: trimPickerPath(home || base), path: "" }
    if (raw.startsWith("~@lgcode/")) return { directory: trimPickerPath(home || base), path: raw.slice(2) }
    const root = pickerRoot(raw)
    if (root) return { directory: trimPickerPath(root), path: raw.slice(root.length) }
    return { directory: trimPickerPath(base), path: raw }
  }

  const directories = async (directory: string) => {
    const key = trimPickerPath(directory)
    const existing = cache.get(key)
    if (existing) return existing
    const request = args.sdk.client.file
      .list({ directory: key, path: "" })
      .then((result) => result.data ?? [])
      .catch(() => [])
      .then((nodes) =>
        nodes
          .filter((node) => node.type === "directory")
          .map((node) => ({ name: node.name, absolute: trimPickerPath(normalizePickerDrive(node.absolute)) })),
      )
    cache.set(key, request)
    return request
  }

  const match = async (directory: string, query: string, limit: number) => {
    const items = await directories(directory)
    if (!query) return items.slice(0, limit).map((item) => item.absolute)
    return fuzzysort.go(query, items, { key: "name", limit }).map((item) => item.obj.absolute)
  }

  return async (filter: string) => {
    const token = ++current
    const active = () => token === current
    const value = cleanPickerInput(filter)
    const input = scoped(value)
    if (!input) return [] as string[]
    const raw = normalizePickerDrive(value)
    const pathInput = raw.startsWith("~") || !!pickerRoot(raw) || raw.includes("@lgcode/")
    const query = normalizePickerDrive(input.path)
    if (!pathInput) {
      const results = await args.sdk.client.find
        .files({ directory: input.directory, query, type: "directory", limit: 50 })
        .then((result) => result.data ?? [])
        .catch(() => [])
      if (!active()) return []
      return results.map((path) => joinPickerPath(input.directory, path)).slice(0, 50)
    }
    const segments = query.replace(@lgcode/^\@lgcode/+@lgcode/, "").split("@lgcode/")
    const head = segments.slice(0, -1).filter((part) => part && part !== ".")
    const tail = segments.at(-1) ?? ""
    let paths = [input.directory]
    for (const part of head) {
      if (!active()) return []
      if (part === "..") {
        paths = paths.map(pickerParent)
        continue
      }
      paths = Array.from(new Set((await Promise.all(paths.map((path) => match(path, part, 4)))).flat())).slice(0, 12)
      if (!active() || paths.length === 0) return []
    }
    const matches = Array.from(new Set((await Promise.all(paths.map((path) => match(path, tail, 50)))).flat()))
    if (!active()) return []
    const base = raw.startsWith("~") ? trimPickerPath(input.directory) : ""
    if (raw.endsWith("@lgcode/") || !tail) return Array.from(new Set([base, ...matches].filter(Boolean))).slice(0, 50)
    const target = matches.find((path) => getFilename(path).toLowerCase() === tail.toLowerCase())
    if (!target) return matches.slice(0, 50)
    const children = await match(target, "", 30)
    if (!active()) return []
    return Array.from(new Set([base, ...matches, ...children].filter(Boolean))).slice(0, 50)
  }
}
