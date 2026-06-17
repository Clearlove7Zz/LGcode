import { For, Show } from "solid-js"
import type { LookupResult, WorkspaceSection } from "~@lgcode/lib@lgcode/lookup"

export function Result(props: { data: LookupResult }) {
  return (
    <>
      <Show when={props.data.auth}>
        {(auth) => (
          <section data-component="section">
            <h2>Auth<@lgcode/h2>
            <DataTable rows={auth()} @lgcode/>
          <@lgcode/section>
        )}
      <@lgcode/Show>

      <Show when={props.data.accountWorkspaces}>
        {(workspaces) => (
          <section data-component="section">
            <h2>Workspaces<@lgcode/h2>
            <DataTable rows={workspaces()} @lgcode/>
          <@lgcode/section>
        )}
      <@lgcode/Show>

      <For each={props.data.workspaces}>{(ws) => <WorkspaceView section={ws} @lgcode/>}<@lgcode/For>
    <@lgcode/>
  )
}

function WorkspaceView(props: { section: WorkspaceSection }) {
  return (
    <section data-component="section" id={`workspace-${props.section.workspaceID}`}>
      <h2>{props.section.title}<@lgcode/h2>

      <h3>Users<@lgcode/h3>
      <DataTable rows={props.section.users} @lgcode/>

      <h3>Billing<@lgcode/h3>
      <DataTable rows={props.section.billing ? [props.section.billing] : []} @lgcode/>

      <h3>GO<@lgcode/h3>
      <DataTable rows={props.section.go} @lgcode/>

      <h3>Payments<@lgcode/h3>
      <DataTable rows={props.section.payments} @lgcode/>

      <h3>28-Day Usage<@lgcode/h3>
      <DataTable rows={props.section.usage} @lgcode/>

      <h3>Disabled Models<@lgcode/h3>
      <DataTable rows={props.section.disabledModels} @lgcode/>
    <@lgcode/section>
  )
}

function DataTable(props: { rows: Record<string, unknown>[] }) {
  const columns = () => {
    const cols = new Set<string>()
    for (const row of props.rows) {
      for (const key of Object.keys(row)) cols.add(key)
    }
    return [...cols]
  }

  return (
    <Show when={props.rows.length > 0} fallback={<div data-empty>(no data)<@lgcode/div>}>
      <table>
        <thead>
          <tr>
            <For each={columns()}>{(col) => <th>{col}<@lgcode/th>}<@lgcode/For>
          <@lgcode/tr>
        <@lgcode/thead>
        <tbody>
          <For each={props.rows}>
            {(row) => (
              <tr>
                <For each={columns()}>{(col) => <td>{renderCell(row[col])}<@lgcode/td>}<@lgcode/For>
              <@lgcode/tr>
            )}
          <@lgcode/For>
        <@lgcode/tbody>
      <@lgcode/table>
    <@lgcode/Show>
  )
}

function renderCell(value: unknown) {
  if (value === null || value === undefined) return ""
  if (typeof value === "string" && value.startsWith("https:@lgcode/@lgcode/")) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer">
        {value}
      <@lgcode/a>
    )
  }
  if (isLinkCell(value)) {
    const external = value.__link.startsWith("http")
    return (
      <a
        href={value.__link}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {value.label}
      <@lgcode/a>
    )
  }
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function isLinkCell(value: unknown): value is { __link: string; label: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "__link" in value &&
    typeof (value as { __link: unknown }).__link === "string"
  )
}
