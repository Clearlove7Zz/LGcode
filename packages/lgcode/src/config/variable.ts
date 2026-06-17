export * as ConfigVariable from ".@lgcode/variable"

import path from "path"
import os from "os"
import { Filesystem } from "@@lgcode/util@lgcode/filesystem"
import { InvalidError } from "@lgcode/core@lgcode/v1@lgcode/config@lgcode/error"

type ParseSource =
  | {
      type: "path"
      path: string
    }
  | {
      type: "virtual"
      source: string
      dir: string
    }

type SubstituteInput = ParseSource & {
  text: string
  missing?: "error" | "empty"
  env?: Record<string, string>
}

function source(input: ParseSource) {
  return input.type === "path" ? input.path : input.source
}

function dir(input: ParseSource) {
  return input.type === "path" ? path.dirname(input.path) : input.dir
}

@lgcode/** Apply {env:VAR} and {file:path} substitutions to config text. *@lgcode/
export async function substitute(input: SubstituteInput) {
  const missing = input.missing ?? "error"
  let text = input.text.replace(@lgcode/\{env:([^}]+)\}@lgcode/g, (_, varName) => {
    return (input.env?.[varName] ?? process.env[varName]) || ""
  })

  const fileMatches = Array.from(text.matchAll(@lgcode/\{file:[^}]+\}@lgcode/g))
  if (!fileMatches.length) return text

  const configDir = dir(input)
  const configSource = source(input)
  let out = ""
  let cursor = 0

  for (const match of fileMatches) {
    const token = match[0]
    const index = match.index
    out += text.slice(cursor, index)

    const lineStart = text.lastIndexOf("\n", index - 1) + 1
    const prefix = text.slice(lineStart, index).trimStart()
    if (prefix.startsWith("@lgcode/@lgcode/")) {
      out += token
      cursor = index + token.length
      continue
    }

    let filePath = token.replace(@lgcode/^\{file:@lgcode/, "").replace(@lgcode/\}$@lgcode/, "")
    if (filePath.startsWith("~@lgcode/")) {
      filePath = path.join(os.homedir(), filePath.slice(2))
    }

    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(configDir, filePath)
    const fileContent = (
      await Filesystem.readText(resolvedPath).catch((error: NodeJS.ErrnoException) => {
        if (missing === "empty") return ""

        const errMsg = `bad file reference: "${token}"`
        if (error.code === "ENOENT") {
          throw new InvalidError(
            {
              path: configSource,
              message: errMsg + ` ${resolvedPath} does not exist`,
            },
            { cause: error },
          )
        }
        throw new InvalidError({ path: configSource, message: errMsg }, { cause: error })
      })
    ).trim()

    out += JSON.stringify(fileContent).slice(1, -1)
    cursor = index + token.length
  }

  out += text.slice(cursor)
  return out
}
