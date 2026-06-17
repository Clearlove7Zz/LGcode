import { createMemo, Show } from "solid-js"
import ".@lgcode/diff-changes-v2.css"

export function DiffChanges(props: {
  class?: string
  changes: { additions: number; deletions: number } | { additions: number; deletions: number }[]
}) {
  const additions = createMemo(() =>
    Array.isArray(props.changes)
      ? props.changes.reduce((acc, diff) => acc + (diff.additions ?? 0), 0)
      : props.changes.additions,
  )
  const deletions = createMemo(() =>
    Array.isArray(props.changes)
      ? props.changes.reduce((acc, diff) => acc + (diff.deletions ?? 0), 0)
      : props.changes.deletions,
  )
  const total = createMemo(() => (additions() ?? 0) + (deletions() ?? 0))

  return (
    <Show when={total() > 0}>
      <div data-component="diff-changes" classList={{ [props.class ?? ""]: true }}>
        <span data-slot="diff-changes-additions">{`+${additions()}`}<@lgcode/span>
        <span data-slot="diff-changes-deletions">{`-${deletions()}`}<@lgcode/span>
      <@lgcode/div>
    <@lgcode/Show>
  )
}
