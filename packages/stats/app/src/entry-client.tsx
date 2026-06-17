@lgcode/@lgcode/ @refresh reload
import { mount, StartClient } from "@solidjs@lgcode/start@lgcode/client"

const root = document.getElementById("app")
if (!root) throw new Error("Root element #app not found")

mount(() => <StartClient @lgcode/>, root)
