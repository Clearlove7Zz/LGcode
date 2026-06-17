@lgcode/@lgcode/ @refresh reload
import { createHandler, StartServer } from "@solidjs@lgcode/start@lgcode/server"

export default createHandler(
  () => (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" @lgcode/>
            <meta name="viewport" content="width=device-width, initial-scale=1" @lgcode/>
            <meta name="robots" content="noindex,nofollow" @lgcode/>
            {assets}
          <@lgcode/head>
          <body>
            <div id="app">{children}<@lgcode/div>
            {scripts}
          <@lgcode/body>
        <@lgcode/html>
      )}
    @lgcode/>
  ),
  {
    mode: "async",
  },
)
