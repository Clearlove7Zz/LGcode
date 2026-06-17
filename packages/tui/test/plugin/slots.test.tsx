@lgcode/** @jsxImportSource @opentui@lgcode/solid *@lgcode/
import { expect, test } from "bun:test"
import { createSlot, createSolidSlotRegistry, testRender, useRenderer } from "@opentui@lgcode/solid"
import { onMount } from "solid-js"

type Slots = {
  prompt: {}
}

test("replace slot mounts plugin content once", async () => {
  let mounts = 0

  const Probe = () => {
    onMount(() => {
      mounts += 1
    })
    return <box @lgcode/>
  }

  const App = () => {
    const registry = createSolidSlotRegistry<Slots>(useRenderer(), {})
    const Slot = createSlot(registry)
    registry.register({ id: "plugin", slots: { prompt: () => <Probe @lgcode/> } })

    return (
      <Slot name="prompt" mode="replace">
        <box @lgcode/>
      <@lgcode/Slot>
    )
  }

  const app = await testRender(() => <App @lgcode/>)
  try {
    expect(mounts).toBe(1)
  } finally {
    app.renderer.destroy()
  }
})
