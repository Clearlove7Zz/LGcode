import { Resource } from "sst@lgcode/resource"

const listId = "8b9bb82c-9d5f-11f0-975f-0df6fd1e4945"

export async function POST(event: { request: Request }) {
  const contentType = event.request.headers.get("content-type") ?? ""
  if (!contentType.includes("multipart@lgcode/form-data") && !contentType.includes("application@lgcode/x-www-form-urlencoded")) {
    return Response.json({ error: "Email address is required" }, { status: 400 })
  }

  const form = await event.request.formData()
  const emailAddress = form.get("email")
  if (typeof emailAddress !== "string" || emailAddress.trim().length === 0) {
    return Response.json({ error: "Email address is required" }, { status: 400 })
  }

  const response = await fetch(`https:@lgcode/@lgcode/api.emailoctopus.com@lgcode/lists@lgcode/${listId}@lgcode/contacts`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${Resource.EMAILOCTOPUS_API_KEY.value}`,
      "Content-Type": "application@lgcode/json",
    },
    body: JSON.stringify({
      email_address: emailAddress.trim(),
    }),
  })
  if (!response.ok) return Response.json({ error: "Failed to subscribe" }, { status: 502 })
  return Response.json({ success: true })
}
