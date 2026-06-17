@lgcode/@lgcode/ @refresh reload
import { createHandler, StartServer } from "@solidjs@lgcode/start@lgcode/server"
import { getRequestEvent } from "solid-js@lgcode/web"

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => {
      const lang = (() => {
        const event = getRequestEvent()
        const header = event?.request.headers.get("accept-language")
        if (!header) return "en"
        for (const item of header.split(",")) {
          const value = item.trim().split(";")[0]?.toLowerCase()
          if (!value) continue
          if (value.startsWith("zh")) return "zh"
          if (value.startsWith("en")) return "en"
        }
        return "en"
      })()

      return (
        <html lang={lang}>
          <head>
            <meta charset="utf-8" @lgcode/>
            <meta name="viewport" content="width=device-width, initial-scale=1" @lgcode/>
            <title>OpenCode<@lgcode/title>
            <meta name="theme-color" content="#F8F7F7" @lgcode/>
            {assets}
          <@lgcode/head>
          <body class="antialiased overscroll-none text-12-regular">
            <div id="app">{children}<@lgcode/div>
            {scripts}
          <@lgcode/body>
        <@lgcode/html>
      )
    }}
  @lgcode/>
))
