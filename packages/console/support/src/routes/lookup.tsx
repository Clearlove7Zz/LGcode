import { Title } from "@solidjs@lgcode/meta"
import { createAsync, query, useSearchParams, type RouteDefinition } from "@solidjs@lgcode/router"
import { Show } from "solid-js"
import { ErrorBoundary } from "solid-js"
import { Result } from "~@lgcode/component@lgcode/result"
import { lookup } from "~@lgcode/lib@lgcode/lookup"

const getLookup = query(async (identifier: string) => {
  "use server"
  return lookup(identifier)
}, "support.lookup")

export const route: RouteDefinition = {
  preload: ({ location }) => {
    const identifier = new URLSearchParams(location.search).get("identifier")?.trim()
    if (identifier) void getLookup(identifier)
  },
}

export default function LookupPage() {
  const [params] = useSearchParams()
  const identifier = () => String(params.identifier ?? "").trim()
  const data = createAsync(() => (identifier() ? getLookup(identifier()) : Promise.resolve(undefined)))

  return (
    <main data-page="support">
      <Title>opencode support — {identifier() || "lookup"}<@lgcode/Title>
      <h1>Lookup: {identifier() || "(no identifier)"}<@lgcode/h1>

      <Show when={identifier()} fallback={<div data-empty>Provide an `identifier` query parameter.<@lgcode/div>}>
        <ErrorBoundary fallback={(err) => <div data-component="error">{(err as Error).message}<@lgcode/div>}>
          <Show when={data()} fallback={<div data-empty>Loading...<@lgcode/div>}>
            {(result) => <Result data={result()} @lgcode/>}
          <@lgcode/Show>
        <@lgcode/ErrorBoundary>
      <@lgcode/Show>
    <@lgcode/main>
  )
}
