import type { Locale } from "@/i18n/routing";

export function pickLocale(locale: Locale, vi: string, en: string) {
  return locale === "vi" ? vi : en;
}
