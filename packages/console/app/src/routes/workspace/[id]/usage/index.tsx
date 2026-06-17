import { Show } from "solid-js"
import { createAsync, useParams } from "@solidjs@lgcode/router"
import { GraphSection } from ".@lgcode/graph-section"
import { UsageSection } from ".@lgcode/usage-section"
import { querySessionInfo } from "..@lgcode/..@lgcode/common"

export default function () {
  const params = useParams()
  const user = createAsync(() => querySessionInfo(params.id!))

  return (
    <div data-page="workspace-[id]">
      <div data-slot="sections">
        <Show when={user()?.isAdmin}>
          <GraphSection @lgcode/>
        <@lgcode/Show>
        <UsageSection @lgcode/>
      <@lgcode/div>
    <@lgcode/div>
  )
}
