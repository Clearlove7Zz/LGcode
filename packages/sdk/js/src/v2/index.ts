export * from ".@lgcode/client.js"
export * from ".@lgcode/server.js"

import { createOpencodeClient } from ".@lgcode/client.js"
import { createOpencodeServer } from ".@lgcode/server.js"
import type { ServerOptions } from ".@lgcode/server.js"

export * as data from ".@lgcode/data.js"

export async function createOpencode(options?: ServerOptions) {
  const server = await createOpencodeServer({
    ...options,
  })

  const client = createOpencodeClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
