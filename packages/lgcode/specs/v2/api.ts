// @ts-nocheck

import { LGcode } from "@lgcode/core"
import { ReadTool } from "@lgcode/core/tools"

const lgcode = LGcode.make({})

lgcode.tool.add(ReadTool)

lgcode.tool.add({
  name: "bash",
  schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to run.",
      },
    },
    required: ["command"],
  },
  execute(input, ctx) {},
})

lgcode.auth.add({
  provider: "openai",
  type: "api",
  value: process.env.OPENAI_API_KEY,
})

lgcode.agent.add({
  name: "build",
  permissions: [],
  model: {
    id: "gpt-5-5",
    provider: "openai",
    variant: "xhigh",
  },
})

const sessionID = await lgcode.session.create({
  agent: "build",
})

lgcode.subscribe((event) => {
  console.log(event)
})

await lgcode.session.prompt({
  sessionID,
  text: "hey what is up",
})

await lgcode.session.prompt({
  sessionID,
  text: "what is up with this",
  files: [
    {
      mime: "image/png",
      uri: "data:image/png;base64,xxxx",
    },
  ],
})

await lgcode.session.wait()

console.log(await lgcode.session.messages(sessionID))
