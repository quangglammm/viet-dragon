import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en", "zh", "ja", "ko"],
  defaultLocale: "vi",
  localePrefix: "as-needed",
  localeDetection: false,
  // The `Link: rel="alternate"` headers next-intl adds point at the SAME path in the other languages; with a slug per language those
  // are not the other languages' URLs. The routing milestone emits the right `hreflang` set from the content database instead.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
