# Session LLM Runtime Boundaries

`../llm.ts` is the loongcode session LLM service. It owns loongcode concerns: auth, config, model/provider resolution, plugins, permissions, telemetry headers, and runtime selection. It is the only file in this area that should know about the full session request shape.

This folder contains adapters behind that service boundary:

- `ai-sdk.ts` converts AI SDK `fullStream` parts into `@loongcode-ai/llm` `LLMEvent`s. This is the default runtime path.
- `native-request.ts` converts loongcode's normalized session input into a native `@loongcode-ai/llm` `LLMRequest`. It does not execute requests.
- `native-runtime.ts` is the opt-in native runtime adapter. It decides whether a selected model is supported, builds the native request, bridges loongcode tools into native executable tools, and delegates transport to `LLMClient` / `RequestExecutor`.

## File Structure

```txt
src/session/
  llm.ts                    session-owned orchestration and runtime selection
  llm/
    AGENTS.md               boundary notes for the adapter layer
    ai-sdk.ts               AI SDK fullStream -> @loongcode-ai/llm LLMEvent adapter
    native-request.ts       loongcode/AI SDK-shaped input -> @loongcode-ai/llm LLMRequest
    native-runtime.ts       native runtime gate, tool bridge, and LLMClient handoff
```

Integration points:

- `../llm.ts` imports `LLMClient` from `@loongcode-ai/llm/route`; native execution is the only path that calls it directly.
- `../llm.ts` imports `LLMAISDK` from `./llm/ai-sdk`; the AI SDK path still calls `streamText(...)` locally, then adapts `result.fullStream` into shared `LLMEvent`s.
- `../llm.ts` imports `LLMNativeRuntime` from `./llm/native-runtime`; this is the runtime-selection seam. Unsupported native requests return a reason and fall back to AI SDK.
- `native-runtime.ts` imports `LLMNative` from `./native-request`; this keeps request lowering separate from transport and tool execution.
- `native-request.ts` is the only adapter file that should construct `LLM.request(...)`, `LLM.model(...)`, `Message.*`, `SystemPart`, `ToolCallPart`, `ToolResultPart`, or `ToolDefinition` values from `@loongcode-ai/llm`.
- `ai-sdk.ts` and `native-runtime.ts` both emit `@loongcode-ai/llm` `LLMEvent`s so downstream session processing does not care which runtime handled the request.

Keep new integration code on one of these seams. Avoid importing session services into `native-request.ts`; pass normalized data through `RequestInput` instead.

## Runtime selection

Both runtimes converge on the same `LLMEvent` stream consumed by the session processor. The gate is per-request: a single session can route some calls through native and fall back for others.

```txt
                             ╭───────────────────╮
╭───────────────────────────▶│ session processor │
│                            ╰─────────┬─────────╯
│                                      │
│                                      │
│                                      │
│                                      ▼
│                         ╭─────────────────────────╮
│                         │ LLM.Service (../llm.ts) │
│                         ╰────────────┬────────────╯
│                                      │
│                                      │
│                                      │
│                                      ▼
│                                ╭───────────╮
│                              ╭─╯           ╰─╮
│                              │  native gate  │
│                              ╰─╮           ╭─╯
│                                ╰─────┬─────╯
│                                      │
│                     ╭────── no ──────┴─────── yes ────────╮
│                     │                                     │
│                     ▼                                     ▼
│       ╭───────────────────────────╮             ╭───────────────────╮
│       │          AI SDK           │             │ native-runtime.ts │
│       │ streamText / generateText │             ╰────────┬──────────╯
│       ╰─────────────┬─────────────╯                      │
│                     │                                    │
│                 ╭───╯                                    │
│                 │                                        │
│                 ▼                                        ▼
│     ╭───────────────────────╮             ╭────────────────────────────╮
│     │       ai-sdk.ts       │             │     native-request.ts      │
│     │ fullStream → LLMEvent │             │ session input → LLMRequest │
│     ╰──────────┬────────────╯             ╰──────────────┬─────────────╯
│                │                                         │
│                │                                     ╭───╯
│                │                                     │
│                ▼                                     ▼
│       ╭─────────────────╮             ╭─────────────────────────────╮
╰───────┤ LLMEvent stream │◀────────────┤ LLMClient · RequestExecutor │
        ╰─────────────────╯             ╰─────────────────────────────╯
```

`native-runtime.ts` evaluates the gate and either bridges into `@loongcode-ai/llm` or returns control so `llm.ts` can take the AI SDK path. Tool execution stays loongcode-owned in both branches; only request lowering and transport differ.

Safety boundary:

- AI SDK remains the default.
- `LOONGCODE_EXPERIMENTAL_NATIVE_LLM=true` or the umbrella `LOONGCODE_EXPERIMENTAL=true` opts in. Native is not a global replacement.
- Native execution currently supports OpenAI, loongcode-managed OpenAI-compatible, and Anthropic API-key paths backed by `@ai-sdk/openai`, `@ai-sdk/openai-compatible`, or `@ai-sdk/anthropic` catalog entries.
- Unsupported providers, OpenAI OAuth, and missing API-key cases fall back to AI SDK.
