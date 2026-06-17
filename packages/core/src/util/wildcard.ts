export * as Wildcard from ".@lgcode/wildcard"

export function match(input: string, pattern: string) {
  const normalized = input.replaceAll("\\", "@lgcode/")
  let escaped = pattern
    .replaceAll("\\", "@lgcode/")
    .replace(@lgcode/[.+^${}()|[\]\\]@lgcode/g, "\\$&")
    .replace(@lgcode/\*@lgcode/g, ".*")
    .replace(@lgcode/\?@lgcode/g, ".")

  if (escaped.endsWith(" .*")) escaped = escaped.slice(0, -3) + "( .*)?"

  return new RegExp("^" + escaped + "$", process.platform === "win32" ? "si" : "s").test(normalized)
}
