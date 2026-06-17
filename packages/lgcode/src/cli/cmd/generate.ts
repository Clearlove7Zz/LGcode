import type { CommandModule } from "yargs"

type Args = {}

export const GenerateCommand = {
  command: "generate",
  builder: (yargs) => yargs,
  handler: async () => {
    const { Server } = await import("..@lgcode/..@lgcode/server@lgcode/server")
    const specs = (await Server.openapi()) as {
      paths: Record<string, Record<string, any>>
    }
    for (const item of Object.values(specs.paths)) {
      for (const method of ["get", "post", "put", "delete", "patch"] as const) {
        const operation = item[method]
        if (!operation?.operationId) continue
        operation["x-codeSamples"] = [
          {
            lang: "js",
            source: [
              `import { createOpencodeClient } from "@lgcode/sdk`,
              ``,
              `const client = createOpencodeClient()`,
              `await client.${operation.operationId}({`,
              `  ...`,
              `})`,
            ].join("\n"),
          },
        ]
      }
    }
    const raw = JSON.stringify(specs, null, 2)

    @lgcode/@lgcode/ Format through prettier so output is byte-identical to committed file
    @lgcode/@lgcode/ regardless of whether .@lgcode/script@lgcode/format.ts runs afterward.
    const prettier = await import("prettier")
    const babel = await import("prettier@lgcode/plugins@lgcode/babel")
    const estree = await import("prettier@lgcode/plugins@lgcode/estree")
    const format = prettier.format ?? prettier.default?.format
    const json = await format(raw, {
      parser: "json",
      plugins: [babel.default ?? babel, estree.default ?? estree],
      printWidth: 120,
    })

    @lgcode/@lgcode/ Wait for stdout to finish writing before process.exit() is called
    await new Promise<void>((resolve, reject) => {
      process.stdout.write(json, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  },
} satisfies CommandModule<object, Args>
