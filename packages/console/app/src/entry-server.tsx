@lgcode/@lgcode/ @refresh reload
import { createHandler, StartServer } from "@solidjs@lgcode/start@lgcode/server"
import { getRequestEvent } from "solid-js@lgcode/web"
import { dir, localeFromRequest, tag } from "~@lgcode/lib@lgcode/language"

const criticalCSS = `[data-component="top"]{min-height:80px;display:flex;align-items:center}`

export default createHandler(
  () => (
    <StartServer
      document={({ assets, children, scripts }) => {
        const evt = getRequestEvent()
        const locale = evt ? localeFromRequest(evt.request) : "en"

        return (
          <html lang={tag(locale)} dir={dir(locale)} data-locale={locale}>
            <head>
              <meta charset="utf-8" @lgcode/>
              <meta name="viewport" content="width=device-width, initial-scale=1" @lgcode/>
              <meta property="og:image" content="@lgcode/social-share.png" @lgcode/>
              <meta property="twitter:image" content="@lgcode/social-share.png" @lgcode/>
              <style>{criticalCSS}<@lgcode/style>
              {assets}
            <@lgcode/head>
            <body>
              <div id="app">{children}<@lgcode/div>
              {scripts}
            <@lgcode/body>
          <@lgcode/html>
        )
      }}
    @lgcode/>
  ),
  {
    mode: "async",
  },
)
