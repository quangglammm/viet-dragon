import { describe, expect, it } from "vitest";
import { materialTraits } from "@/data/material-traits";
import { BULLET_SUGGESTIONS, SUGGESTED_LOCALES, SUGGESTION_TEXT_COUNTS, TRAIT_SUGGESTIONS, type SuggestedLocale } from "./suggested-translations";

// These translations are machine-suggested and not reviewed by a native reader. The tests can only catch mechanical
// mistakes: a missing trait, an empty text, English left in place, or text in the wrong script.

const SCRIPT: Record<SuggestedLocale, RegExp> = {
  zh: /\p{Script=Han}/u,
  ja: /[\p{Script=Hiragana}\p{Script=Katakana}]/u,
  ko: /\p{Script=Hangul}/u,
};

const allTexts = (): { where: string; locale: SuggestedLocale; text: string }[] => [
  ...Object.entries(TRAIT_SUGGESTIONS).flatMap(([key, byLocale]) =>
    SUGGESTED_LOCALES.flatMap((locale) => [
      { where: `${key}.label`, locale, text: byLocale[locale].label },
      { where: `${key}.description`, locale, text: byLocale[locale].description },
    ]),
  ),
  ...BULLET_SUGGESTIONS.flatMap((b, i) => SUGGESTED_LOCALES.flatMap((locale) => b.bestFor[locale].map((text, n) => ({ where: `bullet ${i}.${n}`, locale, text })))),
];

describe("suggested zh/ja/ko translations", () => {
  it("cover every trait of the glossary", () => {
    expect(Object.keys(TRAIT_SUGGESTIONS).sort()).toEqual(Object.keys(materialTraits).sort());
  });

  it("add up to 72 trait texts and 27 bullets", () => {
    expect(SUGGESTION_TEXT_COUNTS).toEqual({ traits: 72, bullets: 27 });
    expect(allTexts()).toHaveLength(72 + 27);
  });

  it.each(SUGGESTED_LOCALES)("are non-blank and written in the %s script", (locale) => {
    const wrong = allTexts().filter((t) => t.locale === locale && (t.text.trim() === "" || !SCRIPT[locale].test(t.text)));
    expect(wrong).toEqual([]);
  });

  it("never leave a text identical to another language's", () => {
    const seen = new Map<string, SuggestedLocale>();
    const clashes: string[] = [];
    for (const { where, locale, text } of allTexts()) {
      const key = `${where}|${text}`;
      const other = seen.get(key);
      if (other && other !== locale) clashes.push(`${where}: ${other} = ${locale}`);
      seen.set(key, locale);
    }
    expect(clashes).toEqual([]);
  });

  it("target three options with three bullets in each language", () => {
    expect(BULLET_SUGGESTIONS).toHaveLength(3);
    for (const suggestion of BULLET_SUGGESTIONS) for (const locale of SUGGESTED_LOCALES) expect(suggestion.bestFor[locale]).toHaveLength(3);
  });
});
