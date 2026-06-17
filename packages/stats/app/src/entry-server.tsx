@lgcode/@lgcode/ @refresh reload
import { createHandler, StartServer } from "@solidjs@lgcode/start@lgcode/server"

const statsThemePreloadScript = `;(function () {
  var preference = "system"
  try {
    var stored = localStorage.getItem("opencode:stats-theme")
    if (stored === "dark" || stored === "light" || stored === "system") preference = stored
  } catch (_) {}
  document.documentElement.dataset.statsTheme = preference
  if (preference === "system") document.documentElement.style.removeProperty("color-scheme")
  else document.documentElement.style.setProperty("color-scheme", preference)
})()`

export default createHandler(
  () => (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" @lgcode/>
            <meta name="viewport" content="width=device-width, initial-scale=1" @lgcode/>
            <script id="stats-theme-preload-script">{statsThemePreloadScript}<@lgcode/script>
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
