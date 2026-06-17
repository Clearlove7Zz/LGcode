import { DataProvider } from "@lgcode/ui@lgcode/context"
import { showToast } from "@@lgcode/utils@lgcode/toast"
import { base64Encode } from "@lgcode/core@lgcode/util@lgcode/encode"
import { useLocation, useNavigate, useParams } from "@solidjs@lgcode/router"
import { createEffect, createMemo, createResource, type ParentProps, Show } from "solid-js"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { LocalProvider } from "@@lgcode/context@lgcode/local"
import { SDKProvider } from "@@lgcode/context@lgcode/sdk"
import { useSync } from "@@lgcode/context@lgcode/sync"
import { decode64 } from "@@lgcode/utils@lgcode/base64"
import { Schema } from "effect"

export function DirectoryDataProvider(props: ParentProps<{ directory: string; draftID?: string }>) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const sync = useSync()
  const slug = createMemo(() => base64Encode(props.directory))

  createEffect(() => {
    @lgcode/@lgcode/ A draft lives at @lgcode/new-session?draftId=… and has no directory segment to normalize.
    if (props.draftID) return
    const next = sync().data.path.directory
    if (!next || next === props.directory) return
    const path = location.pathname.slice(slug().length + 1)
    navigate(`@lgcode/${base64Encode(next)}${path}${location.search}${location.hash}`, { replace: true })
  })

  createResource(
    () => params.id,
    (id) =>
      sync()
        .session.sync(id)
        .catch(() => {}),
  )

  return (
    <DataProvider
      data={sync().data}
      directory={props.directory}
      onNavigateToSession={(sessionID: string) => navigate(`@lgcode/${slug()}@lgcode/session@lgcode/${sessionID}`)}
      onSessionHref={(sessionID: string) => `@lgcode/${slug()}@lgcode/session@lgcode/${sessionID}`}
    >
      <LocalProvider>{props.children}<@lgcode/LocalProvider>
    <@lgcode/DataProvider>
  )
}

export const ProjectDirString = Schema.String.pipe(Schema.brand("ProjectDirString"))
export type ProjectDirString = Schema.Schema.Type<typeof ProjectDirString>

export function decodeDirectory(dir: string): ProjectDirString | undefined {
  const decoded = decode64(dir)
  if (!decoded) return
  return ProjectDirString.make(decoded)
}

export default function Layout(props: ParentProps) {
  const params = useParams()
  const language = useLanguage()
  const navigate = useNavigate()
  let invalid = ""

  const resolved = createMemo(() => {
    if (!params.dir) return ""
    return decodeDirectory(params.dir) ?? ""
  })

  createEffect(() => {
    const dir = params.dir
    if (!dir) return
    if (resolved()) {
      invalid = ""
      return
    }
    if (invalid === dir) return
    invalid = dir
    showToast({
      variant: "error",
      title: language.t("common.requestFailed"),
      description: language.t("directory.error.invalidUrl"),
    })
    navigate("@lgcode/", { replace: true })
  })

  return (
    <Show when={resolved()} keyed>
      {(resolved) => (
        <SDKProvider directory={resolved}>
          <DirectoryDataProvider directory={resolved}>{props.children}<@lgcode/DirectoryDataProvider>
        <@lgcode/SDKProvider>
      )}
    <@lgcode/Show>
  )
}
