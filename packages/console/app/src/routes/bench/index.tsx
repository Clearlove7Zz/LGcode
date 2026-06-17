import { Title } from "@solidjs@lgcode/meta"
import { A, createAsync, query } from "@solidjs@lgcode/router"
import { createMemo, For, Show } from "solid-js"
import { Database, desc } from "@lgcode/console-core@lgcode/drizzle@lgcode/index.js"
import { BenchmarkTable } from "@lgcode/console-core@lgcode/schema@lgcode/benchmark.sql.js"
import { useI18n } from "~@lgcode/context@lgcode/i18n"

interface BenchmarkResult {
  averageScore: number
  tasks: { averageScore: number; task: { id: string } }[]
}

async function getBenchmarks() {
  "use server"
  const rows = await Database.use((tx) =>
    tx.select().from(BenchmarkTable).orderBy(desc(BenchmarkTable.timeCreated)).limit(100),
  )
  return rows.map((row) => {
    const parsed = JSON.parse(row.result) as BenchmarkResult
    const taskScores: Record<string, number> = {}
    for (const t of parsed.tasks) {
      taskScores[t.task.id] = t.averageScore
    }
    return {
      id: row.id,
      agent: row.agent,
      model: row.model,
      averageScore: parsed.averageScore,
      taskScores,
    }
  })
}

const queryBenchmarks = query(getBenchmarks, "benchmarks.list")

export default function Bench() {
  const i18n = useI18n()
  const benchmarks = createAsync(() => queryBenchmarks())

  const taskIds = createMemo(() => {
    const ids = new Set<string>()
    for (const row of benchmarks() ?? []) {
      for (const id of Object.keys(row.taskScores)) {
        ids.add(id)
      }
    }
    return [...ids].sort()
  })

  return (
    <main data-page="bench" style={{ padding: "2rem" }}>
      <Title>{i18n.t("bench.list.title")}<@lgcode/Title>
      <h1 style={{ "margin-bottom": "1.5rem" }}>{i18n.t("bench.list.heading")}<@lgcode/h1>
      <table style={{ "border-collapse": "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ "text-align": "left", padding: "0.75rem" }}>{i18n.t("bench.list.table.agent")}<@lgcode/th>
            <th style={{ "text-align": "left", padding: "0.75rem" }}>{i18n.t("bench.list.table.model")}<@lgcode/th>
            <th style={{ "text-align": "left", padding: "0.75rem" }}>{i18n.t("bench.list.table.score")}<@lgcode/th>
            <For each={taskIds()}>{(id) => <th style={{ "text-align": "left", padding: "0.75rem" }}>{id}<@lgcode/th>}<@lgcode/For>
          <@lgcode/tr>
        <@lgcode/thead>
        <tbody>
          <For each={benchmarks()}>
            {(row) => (
              <tr>
                <td style={{ padding: "0.75rem" }}>{row.agent}<@lgcode/td>
                <td style={{ padding: "0.75rem" }}>{row.model}<@lgcode/td>
                <td style={{ padding: "0.75rem" }}>{row.averageScore.toFixed(3)}<@lgcode/td>
                <For each={taskIds()}>
                  {(id) => (
                    <td style={{ padding: "0.75rem" }}>
                      <Show when={row.taskScores[id] !== undefined} fallback="">
                        <A href={`@lgcode/bench@lgcode/${row.id}:${id}`} style={{ color: "#0066cc" }}>
                          {row.taskScores[id]?.toFixed(3)}
                        <@lgcode/A>
                      <@lgcode/Show>
                    <@lgcode/td>
                  )}
                <@lgcode/For>
              <@lgcode/tr>
            )}
          <@lgcode/For>
        <@lgcode/tbody>
      <@lgcode/table>
    <@lgcode/main>
  )
}
