import { redirect } from "@solidjs@lgcode/router"

export async function GET() {
  return redirect(
    "https:@lgcode/@lgcode/applink.feishu.cn@lgcode/client@lgcode/chat@lgcode/chatter@lgcode/add_by_link?link_token=738j8655-cd59-4633-a30a-1124e0096789&qr_code=true",
  )
}
