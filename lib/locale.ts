import type { Locale } from "@/i18n/routing";

export function pickLocale<T>(locale: Locale, vi: T, en: T): T {
  return locale === "vi" ? vi : en;
}
