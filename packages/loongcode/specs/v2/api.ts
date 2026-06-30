// @ts-nocheck

import { Loongcode } from "@loongcode/core"
import { ReadTool } from "@loongcode/core/tools"

const loongcode = Loongcode.make({})

loongcode.tool.add(ReadTool)

loongcode.tool.add({
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

loongcode.auth.add({
  provider: "openai",
  type: "api",
  value: process.env.OPENAI_API_KEY,
})

loongcode.agent.add({
  name: "build",
  permissions: [],
  model: {
    id: "gpt-5-5",
    provider: "openai",
    variant: "xhigh",
  },
})

const sessionID = await loongcode.session.create({
  agent: "build",
})

loongcode.subscribe((event) => {
  console.log(event)
})

await loongcode.session.prompt({
  sessionID,
  text: "hey what is up",
})

await loongcode.session.prompt({
  sessionID,
  text: "what is up with this",
  files: [
    {
      mime: "image/png",
      uri: "data:image/png;base64,xxxx",
    },
  ],
})

await loongcode.session.wait()

console.log(await loongcode.session.messages(sessionID))
