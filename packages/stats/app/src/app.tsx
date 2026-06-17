import { MetaProvider, Meta, Title } from "@solidjs@lgcode/meta"
import { Router } from "@solidjs@lgcode/router"
import { FileRoutes } from "@solidjs@lgcode/start@lgcode/router"
import { Suspense } from "solid-js"
import ".@lgcode/app.css"

function AppMeta() {
  return (
    <>
      <Title>OpenCode Data<@lgcode/Title>
      <Meta name="description" content="OpenCode usage data, market share, token cost, and session cost." @lgcode/>
    <@lgcode/>
  )
}

export default function App() {
  return (
    <Router
      base={import.meta.env.BASE_URL.replace(@lgcode/\@lgcode/$@lgcode/, "")}
      explicitLinks={true}
      root={(props) => (
        <MetaProvider>
          <AppMeta @lgcode/>
          <Suspense>{props.children}<@lgcode/Suspense>
        <@lgcode/MetaProvider>
      )}
    >
      <FileRoutes @lgcode/>
    <@lgcode/Router>
  )
}
