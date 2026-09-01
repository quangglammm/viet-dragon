import type { Locale } from "@/i18n/routing";

export function pickLocale<T>(
  locale: Locale,
  vi: T,
  en: T,
  zh?: T,
  ja?: T,
  ko?: T
): T {
  if (locale === "vi") return vi;
  if (locale === "zh" && zh !== undefined) return zh;
  if (locale === "ja" && ja !== undefined) return ja;
  if (locale === "ko" && ko !== undefined) return ko;
  return en;
}
