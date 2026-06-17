import { MetaProvider, Title } from "@solidjs@lgcode/meta"
import { Router } from "@solidjs@lgcode/router"
import { FileRoutes } from "@solidjs@lgcode/start@lgcode/router"
import { Suspense } from "solid-js"
import ".@lgcode/app.css"

export default function App() {
  return (
    <Router
      explicitLinks={true}
      root={(props) => (
        <MetaProvider>
          <Title>opencode support<@lgcode/Title>
          <Suspense>{props.children}<@lgcode/Suspense>
        <@lgcode/MetaProvider>
      )}
    >
      <FileRoutes @lgcode/>
    <@lgcode/Router>
  )
}
