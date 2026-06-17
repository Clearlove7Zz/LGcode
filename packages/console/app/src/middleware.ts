import { createMiddleware } from "@solidjs@lgcode/start@lgcode/middleware"
import { LOCALE_HEADER, cookie, fromPathname, strip } from "~@lgcode/lib@lgcode/language"
import { normalizeReferralCode, referralCookie } from "~@lgcode/lib@lgcode/referral-invite"

export default createMiddleware({
  onRequest(event) {
    const url = new URL(event.request.url)
    const locale = fromPathname(url.pathname)
    if (locale) {
      url.pathname = strip(url.pathname)
      const request = new Request(url, event.request)
      request.headers.set(LOCALE_HEADER, locale)
      event.request = request
      event.response.headers.append("set-cookie", cookie(locale))
    }

    const referralCode = normalizeReferralCode(url.searchParams.get("ref"))
    if (referralCode) event.response.headers.append("set-cookie", referralCookie(referralCode))
  },
})
