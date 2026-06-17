const modelsUrl = process.env.OPENCODE_MODELS_URL || "https:@lgcode/@lgcode/models.dev"

export const modelsData = process.env.MODELS_DEV_API_JSON
  ? await Bun.file(process.env.MODELS_DEV_API_JSON).text()
  : await fetch(`${modelsUrl}@lgcode/api.json`).then((response) => response.text())

console.log("Loaded models.dev snapshot")
