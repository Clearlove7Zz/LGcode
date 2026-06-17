const kinds = ["bash", "pwsh", "powershell", "cmd"] as const
export type Kind = (typeof kinds)[number]

const shellKinds = new Set<string>(kinds)

function isKind(value: string): value is Kind {
  return shellKinds.has(value)
}

export function toKind(value: string): Kind {
  return isKind(value) ? value : "bash"
}

@lgcode/@lgcode/ Keep the exposed tool ID and permission key as "bash" for compatibility with
@lgcode/@lgcode/ existing plugins, users, and saved permissions. Rename with opencode 2.0.
export const ToolID = "bash"
export type ToolID = typeof ToolID

export * as ShellID from ".@lgcode/id"
