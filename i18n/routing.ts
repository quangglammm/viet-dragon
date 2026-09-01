import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en", "zh", "ja", "ko"],
  defaultLocale: "vi",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
