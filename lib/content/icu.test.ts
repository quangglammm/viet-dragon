import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { icuArguments } from "./icu";
import { LOCALES } from "./schemas/common";
import { messageLeaves } from "./schemas/message-leaves";

const names = (text: string) => {
  const found = icuArguments(text);
  return found === null ? null : [...found].sort();
};

describe("icuArguments", () => {
  it("finds the simple arguments", () => {
    expect(names("{count} sản phẩm")).toEqual(["count"]);
    expect(names("© {year} Viet Dragon. {rights}")).toEqual(["rights", "year"]);
    expect(names("Không có biến nào.")).toEqual([]);
  });

  it("reads typed arguments and plural / select branches, whose text may hold arguments of their own", () => {
    expect(names("{n, number}")).toEqual(["n"]);
    expect(names("{count, plural, one {# sản phẩm} other {# sản phẩm}}")).toEqual(["count"]);
    expect(names("{n, plural, =0 {Không có} other {{name} có # mục}}")).toEqual(["n", "name"]);
    expect(names("{kind, select, a {Một} other {Khác}} {who}")).toEqual(["kind", "who"]);
  });

  it("treats apostrophe-quoted braces and apostrophes in running text as plain text", () => {
    expect(names("Chữ '{' và '}' nguyên văn")).toEqual([]);
    expect(names("L''été {year}")).toEqual(["year"]);
    expect(names("Don't panic {count}")).toEqual(["count"]);
  });

  it("refuses what next-intl would throw on: unbalanced braces and `{` without a name", () => {
    expect(names("{count")).toBeNull();
    expect(names("count}")).toBeNull();
    expect(names("{ }")).toBeNull();
    expect(names("{{count}}")).toBeNull();
    expect(names("{count, plural, one {# x} other {# y}")).toBeNull();
  });
});

describe("the site's real texts", () => {
  it("every text of every language is well formed, and uses only the variables of the Vietnamese one", () => {
    const files = Object.fromEntries(LOCALES.map((locale) => [locale, JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")) as unknown]));
    const vietnamese = new Map(messageLeaves(files.vi).map((leaf) => [leaf.segments.join("."), leaf.text]));
    const problems: string[] = [];
    for (const locale of LOCALES) {
      for (const leaf of messageLeaves(files[locale])) {
        const key = leaf.segments.join(".");
        const used = icuArguments(leaf.text);
        const allowed = icuArguments(vietnamese.get(key) ?? "");
        if (used === null) problems.push(`${locale} ${key}: braces`);
        else if (allowed !== null && [...used].some((name) => !allowed.has(name))) problems.push(`${locale} ${key}: variable`);
      }
    }
    expect(problems).toEqual([]);
  });
});
