import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { icuArguments } from "@/lib/content/icu";
import { messageLeaves } from "@/lib/content/schemas/message-leaves";
import { SITE_MESSAGE_LABELS } from "@/lib/content/editor/site-message-labels";
import { LOCALES, type LocaleCode } from "@/lib/content/schemas";

// The site's UI copy files: a missing key throws at render time and a variable the code does not pass breaks the page, so the five
// languages must have exactly the same texts and (at most) the variables of the Vietnamese one — the rule the editor enforces on a publish.

const read = (locale: LocaleCode): Record<string, unknown> => JSON.parse(readFileSync(`messages/${locale}.json`, "utf8"));
const trees = Object.fromEntries(LOCALES.map((locale) => [locale, read(locale)])) as Record<LocaleCode, Record<string, unknown>>;
const key = (segments: readonly (string | number)[]): string => segments.join(".");
const leavesOf = (locale: LocaleCode) => new Map(messageLeaves(trees[locale]).map((leaf) => [key(leaf.segments), leaf.text]));

describe("messages/*.json", () => {
  it.each(LOCALES.filter((locale) => locale !== "vi"))("%s has exactly the texts of the Vietnamese file", (locale) => {
    const vi = [...leavesOf("vi").keys()];
    const other = [...leavesOf(locale).keys()];
    expect(other.filter((path) => !vi.includes(path))).toEqual([]);
    expect(vi.filter((path) => !other.includes(path))).toEqual([]);
  });

  it.each(LOCALES)("%s has no empty text, no well-formed-ness problem, and only variables the Vietnamese text has", (locale) => {
    const vi = leavesOf("vi");
    const problems: string[] = [];
    for (const [path, text] of leavesOf(locale)) {
      if (text.trim() === "") problems.push(`${path}: empty`);
      const used = icuArguments(text);
      if (used === null) {
        problems.push(`${path}: braces`);
        continue;
      }
      const allowed = icuArguments(vi.get(path) ?? "") ?? new Set<string>();
      for (const name of used) if (!allowed.has(name)) problems.push(`${path}: {${name}} is not in the Vietnamese text`);
    }
    expect(problems).toEqual([]);
  });

  it("names every namespace in the editor's words", () => {
    expect(Object.keys(trees.vi).filter((namespace) => !(namespace in SITE_MESSAGE_LABELS))).toEqual([]);
  });
});
