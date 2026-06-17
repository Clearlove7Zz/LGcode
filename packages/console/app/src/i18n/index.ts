import type { Locale } from "~@lgcode/lib@lgcode/language"
import { dict as en } from "~@lgcode/i18n@lgcode/en"
import { dict as zh } from "~@lgcode/i18n@lgcode/zh"
import { dict as zht } from "~@lgcode/i18n@lgcode/zht"
import { dict as ko } from "~@lgcode/i18n@lgcode/ko"
import { dict as de } from "~@lgcode/i18n@lgcode/de"
import { dict as es } from "~@lgcode/i18n@lgcode/es"
import { dict as fr } from "~@lgcode/i18n@lgcode/fr"
import { dict as it } from "~@lgcode/i18n@lgcode/it"
import { dict as da } from "~@lgcode/i18n@lgcode/da"
import { dict as ja } from "~@lgcode/i18n@lgcode/ja"
import { dict as pl } from "~@lgcode/i18n@lgcode/pl"
import { dict as ru } from "~@lgcode/i18n@lgcode/ru"
import { dict as uk } from "~@lgcode/i18n@lgcode/uk"
import { dict as ar } from "~@lgcode/i18n@lgcode/ar"
import { dict as no } from "~@lgcode/i18n@lgcode/no"
import { dict as br } from "~@lgcode/i18n@lgcode/br"
import { dict as th } from "~@lgcode/i18n@lgcode/th"
import { dict as tr } from "~@lgcode/i18n@lgcode/tr"

export type Key = keyof typeof en
export type Dict = Record<Key, string>

const base = en satisfies Dict

export function i18n(locale: Locale): Dict {
  if (locale === "en") return base
  if (locale === "zh") return { ...base, ...zh }
  if (locale === "zht") return { ...base, ...zht }
  if (locale === "ko") return { ...base, ...ko }
  if (locale === "de") return { ...base, ...de }
  if (locale === "es") return { ...base, ...es }
  if (locale === "fr") return { ...base, ...fr }
  if (locale === "it") return { ...base, ...it }
  if (locale === "da") return { ...base, ...da }
  if (locale === "ja") return { ...base, ...ja }
  if (locale === "pl") return { ...base, ...pl }
  if (locale === "ru") return { ...base, ...ru }
  if (locale === "uk") return { ...base, ...uk }
  if (locale === "ar") return { ...base, ...ar }
  if (locale === "no") return { ...base, ...no }
  if (locale === "br") return { ...base, ...br }
  if (locale === "th") return { ...base, ...th }
  return { ...base, ...tr }
}
