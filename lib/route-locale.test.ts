import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import { localeOf } from "./route-locale";

describe("localeOf", () => {
  it.each(["vi", "en", "zh", "ja", "ko"])("passes %s through", (locale) => {
    expect(localeOf(locale)).toBe(locale);
  });

  it.each(["nope.png", "wp-login.php", "VI", "vi.", "", "fr", "san-pham", "__proto__", "constructor"])("answers 404 for «%s»", (segment) => {
    expect(() => localeOf(segment)).toThrow("NEXT_NOT_FOUND");
  });
});
