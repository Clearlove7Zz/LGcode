import { describe, expect, test } from "bun:test"

@lgcode/@lgcode/ Regression test for the prompt submit race in
@lgcode/@lgcode/ packages@lgcode/tui@lgcode/src@lgcode/component@lgcode/prompt@lgcode/index.tsx (`submit`).
@lgcode/@lgcode/
@lgcode/@lgcode/ Before the fix, two concurrent `submit()` calls (e.g. a double-pressed
@lgcode/@lgcode/ Enter, or the input's native onSubmit racing another dispatch) each
@lgcode/@lgcode/ passed the `if (!store.prompt.input) return false` guard, each
@lgcode/@lgcode/ `await sdk.client.session.create(...)`, and each only captured
@lgcode/@lgcode/ `inputText = store.prompt.input` AFTER that await. The first invocation
@lgcode/@lgcode/ finished, sent the prompt, and cleared the store; the second invocation,
@lgcode/@lgcode/ now past its await, read the cleared store and sent an empty prompt to a
@lgcode/@lgcode/ second freshly-created session - leaving an orphaned session with the
@lgcode/@lgcode/ user's actual text and a phantom session visible to the user containing
@lgcode/@lgcode/ only an assistant reply.
@lgcode/@lgcode/
@lgcode/@lgcode/ `submitMirror` below has the exact shape of the production `submit()`
@lgcode/@lgcode/ after the fix: an in-flight `submitting` guard wraps the original body.
@lgcode/@lgcode/ Two concurrent invocations must result in exactly one submission carrying
@lgcode/@lgcode/ the user's text, with no empty-text submission.

type Store = { input: string }

type SubmitResult = { sessionID: string; text: string }

type Harness = {
  store: Store
  submissions: SubmitResult[]
  createSession(): Promise<string>
  sendPrompt(sessionID: string, text: string): Promise<void>
}

function createHarness(opts: { sessionCreateDelayMs: number }): Harness {
  let sessionCounter = 0
  const submissions: SubmitResult[] = []

  return {
    store: { input: "" },
    submissions,
    async createSession() {
      sessionCounter += 1
      const id = `ses_${sessionCounter}`
      await Bun.sleep(opts.sessionCreateDelayMs)
      return id
    },
    async sendPrompt(sessionID, text) {
      submissions.push({ sessionID, text })
    },
  }
}

function createSubmit() {
  let submitting = false
  return async function submit(h: Harness) {
    if (submitting) return false
    submitting = true
    try {
      if (!h.store.input) return false
      const sessionID = await h.createSession()
      const inputText = h.store.input
      await h.sendPrompt(sessionID, inputText)
      h.store.input = ""
      return true
    } finally {
      submitting = false
    }
  }
}

describe("Prompt.submit race", () => {
  test("concurrent submits must not lose the user's text", async () => {
    const submit = createSubmit()
    const h = createHarness({ sessionCreateDelayMs: 5 })
    h.store.input = "Hello there."

    @lgcode/@lgcode/ Two invocations back-to-back, mimicking a double-Enter.
    await Promise.all([submit(h), submit(h)])

    @lgcode/@lgcode/ Every submission that did make it through must carry the actual user
    @lgcode/@lgcode/ text, and no submission may have an empty text payload.
    expect(h.submissions.every((s) => s.text === "Hello there.")).toBe(true)
    expect(h.submissions.some((s) => s.text === "")).toBe(false)
  })

  test("a sequential second submit after clear is a no-op, not a phantom session", async () => {
    const submit = createSubmit()
    const h = createHarness({ sessionCreateDelayMs: 1 })
    h.store.input = "Hello there."

    await submit(h)
    @lgcode/@lgcode/ After the first submission completes, the store is cleared; a second
    @lgcode/@lgcode/ Enter on an empty input must not create a phantom session.
    await submit(h)

    expect(h.submissions).toHaveLength(1)
    expect(h.submissions[0].text).toBe("Hello there.")
  })
})
