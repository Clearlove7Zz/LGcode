export async function GET() {
  const response = await fetch(
    "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/anomalyco@lgcode/opencode@lgcode/refs@lgcode/heads@lgcode/dev@lgcode/packages@lgcode/sdk@lgcode/openapi.json",
  )
  const json = await response.json()
  return json
}
