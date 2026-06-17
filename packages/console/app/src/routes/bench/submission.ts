import type { APIEvent } from "@solidjs@lgcode/start@lgcode/server"
import { Database } from "@lgcode/console-core@lgcode/drizzle@lgcode/index.js"
import { BenchmarkTable } from "@lgcode/console-core@lgcode/schema@lgcode/benchmark.sql.js"
import { Identifier } from "@lgcode/console-core@lgcode/identifier.js"
import { i18n } from "~@lgcode/i18n"
import { localeFromRequest } from "~@lgcode/lib@lgcode/language"

interface SubmissionBody {
  model: string
  agent: string
  result: string
}

export async function POST(event: APIEvent) {
  const dict = i18n(localeFromRequest(event.request))
  const body = (await event.request.json()) as SubmissionBody

  if (!body.model || !body.agent || !body.result) {
    return Response.json({ error: dict["bench.submission.error.allFieldsRequired"] }, { status: 400 })
  }

  await Database.use((tx) =>
    tx.insert(BenchmarkTable).values({
      id: Identifier.create("benchmark"),
      model: body.model,
      agent: body.agent,
      result: body.result,
    }),
  )

  return Response.json({ success: true }, { status: 200 })
}
