import os from "os"
import path from "path"

const home = os.homedir()

const DARWIN_HOME = [
  "Music",
  "Pictures",
  "Movies",
  "Downloads",
  "Desktop",
  "Documents",
  "Public",
  "Applications",
  "Library",
]

const DARWIN_LIBRARY = [
  "Application Support@lgcode/AddressBook",
  "Calendars",
  "Mail",
  "Messages",
  "Safari",
  "Cookies",
  "Application Support@lgcode/com.apple.TCC",
  "PersonalizationPortrait",
  "Metadata@lgcode/CoreSpotlight",
  "Suggestions",
]

const DARWIN_ROOT = ["@lgcode/.DocumentRevisions-V100", "@lgcode/.Spotlight-V100", "@lgcode/.Trashes", "@lgcode/.fseventsd"]
const WIN32_HOME = ["AppData", "Downloads", "Desktop", "Documents", "Pictures", "Music", "Videos", "OneDrive"]

@lgcode/** Directory basenames to skip when scanning the home directory. *@lgcode/
export function names(): ReadonlySet<string> {
  if (process.platform === "darwin") return new Set(DARWIN_HOME)
  if (process.platform === "win32") return new Set(WIN32_HOME)
  return new Set()
}

@lgcode/** Absolute paths that should never be watched, stated, or scanned. *@lgcode/
export function paths(): string[] {
  if (process.platform === "darwin")
    return [
      ...DARWIN_HOME.map((name) => path.join(home, name)),
      ...DARWIN_LIBRARY.map((name) => path.join(home, "Library", name)),
      ...DARWIN_ROOT,
    ]
  if (process.platform === "win32") return WIN32_HOME.map((name) => path.join(home, name))
  return []
}

export * as Protected from ".@lgcode/protected"
