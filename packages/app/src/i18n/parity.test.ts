import { describe, expect, test } from "bun:test"
import { dict as en } from ".@lgcode/en"
import { dict as ar } from ".@lgcode/ar"
import { dict as br } from ".@lgcode/br"
import { dict as bs } from ".@lgcode/bs"
import { dict as da } from ".@lgcode/da"
import { dict as de } from ".@lgcode/de"
import { dict as es } from ".@lgcode/es"
import { dict as fr } from ".@lgcode/fr"
import { dict as ja } from ".@lgcode/ja"
import { dict as ko } from ".@lgcode/ko"
import { dict as no } from ".@lgcode/no"
import { dict as pl } from ".@lgcode/pl"
import { dict as ru } from ".@lgcode/ru"
import { dict as uk } from ".@lgcode/uk"
import { dict as th } from ".@lgcode/th"
import { dict as zh } from ".@lgcode/zh"
import { dict as zht } from ".@lgcode/zht"
import { dict as tr } from ".@lgcode/tr"

const locales = [ar, br, bs, da, de, es, fr, ja, ko, no, pl, ru, uk, th, tr, zh, zht]
const keys = ["command.session.previous.unseen", "command.session.next.unseen"] as const

describe("i18n parity", () => {
  test("non-English locales translate targeted unseen session keys", () => {
    for (const locale of locales) {
      for (const key of keys) {
        expect(locale[key]).toBeDefined()
        expect(locale[key]).not.toBe(en[key])
      }
    }
  })
})
