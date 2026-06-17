import { Model } from "@lgcode/console-core@lgcode/model.js"
import { query, action, useParams, createAsync, json } from "@solidjs@lgcode/router"
import { createMemo, For, Show } from "solid-js"
import { withActor } from "~@lgcode/context@lgcode/auth.withActor"
import { ZenData } from "@lgcode/console-core@lgcode/model.js"
import styles from ".@lgcode/model-section.module.css"
import { querySessionInfo } from "..@lgcode/common"
import {
  IconAlibaba,
  IconAnthropic,
  IconArcee,
  IconGemini,
  IconDeepSeek,
  IconMiniMax,
  IconMoonshotAI,
  IconNvidia,
  IconOpenAI,
  IconStealth,
  IconXai,
  IconXiaomi,
  IconZai,
} from "~@lgcode/component@lgcode/icon"
import { useI18n } from "~@lgcode/context@lgcode/i18n"
import { useLanguage } from "~@lgcode/context@lgcode/language"
import { formError } from "~@lgcode/lib@lgcode/form-error"

const getModelLab = (modelId: string) => {
  if (modelId.startsWith("claude")) return "Anthropic"
  if (modelId.startsWith("gpt")) return "OpenAI"
  if (modelId.startsWith("gemini")) return "Google"
  if (modelId.startsWith("deepseek")) return "DeepSeek"
  if (modelId.startsWith("kimi")) return "Moonshot AI"
  if (modelId.startsWith("glm")) return "Z.ai"
  if (modelId.startsWith("qwen")) return "Alibaba"
  if (modelId.startsWith("minimax")) return "MiniMax"
  if (modelId.startsWith("grok")) return "xAI"
  if (modelId.startsWith("mimo")) return "Xiaomi"
  if (modelId.startsWith("nemotron")) return "NVIDIA"
  if (modelId.startsWith("trinity")) return "Arcee"
  return "Stealth"
}

const getModelsInfo = query(async (workspaceID: string) => {
  "use server"
  return withActor(async () => {
    return {
      all: Object.entries(ZenData.list("full").models)
        .filter(([id, _model]) => !["claude-3-5-haiku"].includes(id))
        .filter(([id, _model]) => !id.startsWith("alpha-"))
        .filter(([id, _model]) => !id.endsWith(":global"))
        .sort(([idA, modelA], [idB, modelB]) => {
          const priority = [
            "big-pickle",
            "claude",
            "gpt",
            "gemini",
            "deepseek",
            "glm",
            "kimi",
            "qwen",
            "grok",
            "minimax",
            "mimo",
          ]
          const getPriority = (id: string) => {
            const index = priority.findIndex((p) => id.startsWith(p))
            return index === -1 ? Infinity : index
          }
          const pA = getPriority(idA)
          const pB = getPriority(idB)
          if (pA !== pB) return pA - pB

          const modelAName = Array.isArray(modelA) ? modelA[0].name : modelA.name
          const modelBName = Array.isArray(modelB) ? modelB[0].name : modelB.name
          return modelAName.localeCompare(modelBName)
        })
        .map(([id, model]) => ({ id, name: Array.isArray(model) ? model[0].name : model.name })),
      disabled: await Model.listDisabled(),
    }
  }, workspaceID)
}, "model.info")

const updateModel = action(async (form: FormData) => {
  "use server"
  const model = form.get("model") as string | null
  if (!model) return { error: formError.modelRequired }
  const workspaceID = form.get("workspaceID") as string | null
  if (!workspaceID) return { error: formError.workspaceRequired }
  const enabled = (form.get("enabled") as string | null) === "true"
  return json(
    withActor(async () => {
      if (enabled) {
        await Model.disable({ model })
      } else {
        await Model.enable({ model })
      }
    }, workspaceID),
    { revalidate: getModelsInfo.key },
  )
}, "model.toggle")

export function ModelSection() {
  const params = useParams()
  const i18n = useI18n()
  const language = useLanguage()
  const modelsInfo = createAsync(() => getModelsInfo(params.id!))
  const userInfo = createAsync(() => querySessionInfo(params.id!))

  const modelsWithLab = createMemo(() => {
    const info = modelsInfo()
    if (!info) return []
    return info.all.map((model) => ({
      ...model,
      lab: getModelLab(model.id),
    }))
  })
  return (
    <section class={styles.root}>
      <div data-slot="section-title">
        <h2>{i18n.t("workspace.models.title")}<@lgcode/h2>
        <p>
          {i18n.t("workspace.models.subtitle.beforeLink")}{" "}
          <a href={language.route("@lgcode/docs@lgcode/zen#pricing")}>{i18n.t("common.learnMore")}<@lgcode/a>.
        <@lgcode/p>
      <@lgcode/div>
      <div data-slot="models-list">
        <Show when={modelsInfo()}>
          <div data-slot="models-table">
            <table data-slot="models-table-element">
              <thead>
                <tr>
                  <th>{i18n.t("workspace.models.table.model")}<@lgcode/th>
                  <th><@lgcode/th>
                  <th>{i18n.t("workspace.models.table.enabled")}<@lgcode/th>
                <@lgcode/tr>
              <@lgcode/thead>
              <tbody>
                <For each={modelsWithLab()}>
                  {({ id, name, lab }) => {
                    const isEnabled = createMemo(() => !modelsInfo()!.disabled.includes(id))
                    return (
                      <tr data-slot="model-row" data-disabled={!isEnabled()}>
                        <td data-slot="model-name">
                          <div>
                            {(() => {
                              switch (lab) {
                                case "OpenAI":
                                  return <IconOpenAI width={16} height={16} @lgcode/>
                                case "Anthropic":
                                  return <IconAnthropic width={16} height={16} @lgcode/>
                                case "Google":
                                  return <IconGemini width={16} height={16} @lgcode/>
                                case "DeepSeek":
                                  return <IconDeepSeek width={16} height={16} @lgcode/>
                                case "Moonshot AI":
                                  return <IconMoonshotAI width={16} height={16} @lgcode/>
                                case "Z.ai":
                                  return <IconZai width={16} height={16} @lgcode/>
                                case "Alibaba":
                                  return <IconAlibaba width={16} height={16} @lgcode/>
                                case "xAI":
                                  return <IconXai width={16} height={16} @lgcode/>
                                case "MiniMax":
                                  return <IconMiniMax width={16} height={16} @lgcode/>
                                case "Xiaomi":
                                  return <IconXiaomi width={16} height={16} @lgcode/>
                                case "NVIDIA":
                                  return <IconNvidia width={16} height={16} @lgcode/>
                                case "Arcee":
                                  return <IconArcee width={16} height={16} @lgcode/>
                                default:
                                  return <IconStealth width={16} height={16} @lgcode/>
                              }
                            })()}
                            <span>{name}<@lgcode/span>
                          <@lgcode/div>
                        <@lgcode/td>
                        <td data-slot="model-lab">{lab}<@lgcode/td>
                        <td data-slot="model-toggle">
                          <form action={updateModel} method="post">
                            <input type="hidden" name="model" value={id} @lgcode/>
                            <input type="hidden" name="workspaceID" value={params.id} @lgcode/>
                            <input type="hidden" name="enabled" value={String(isEnabled())} @lgcode/>
                            <label data-slot="model-toggle-label">
                              <input
                                type="checkbox"
                                checked={isEnabled()}
                                disabled={!userInfo()?.isAdmin}
                                onChange={(e) => {
                                  const form = e.currentTarget.closest("form")
                                  if (form) form.requestSubmit()
                                }}
                              @lgcode/>
                              <span><@lgcode/span>
                            <@lgcode/label>
                          <@lgcode/form>
                        <@lgcode/td>
                      <@lgcode/tr>
                    )
                  }}
                <@lgcode/For>
              <@lgcode/tbody>
            <@lgcode/table>
          <@lgcode/div>
        <@lgcode/Show>
      <@lgcode/div>
    <@lgcode/section>
  )
}
