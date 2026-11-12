import { describe, expect, it } from "vitest";
import { mergeMessages } from "./messages";

const defaults = { hero: { title: "Tiêu đề", slides: [{ a: "Một", b: "Bê" }, { a: "Hai", b: "Bi" }] }, nav: { home: "Trang chủ" } };

describe("mergeMessages", () => {
  it("lays published texts over the defaults, text by text, lists by position", () => {
    const merged = mergeMessages(defaults, { hero: { title: "Mới", slides: [{ a: "Một mới" }, {}] } });
    expect(merged).toEqual({ hero: { title: "Mới", slides: [{ a: "Một mới", b: "Bê" }, { a: "Hai", b: "Bi" }] }, nav: { home: "Trang chủ" } });
  });

  it("treats an empty or blank text as not translated: the default stands", () => {
    expect(mergeMessages(defaults, { nav: { home: "" } }).nav).toEqual({ home: "Trang chủ" });
    expect(mergeMessages(defaults, { nav: { home: "   " } }).nav).toEqual({ home: "Trang chủ" });
  });

  it("owns no structure: a namespace, key or list item the defaults do not have is ignored", () => {
    const merged = mergeMessages(defaults, { stray: { x: "y" }, nav: { home: "Nhà", extra: "z" }, hero: { slides: [{}, {}, { a: "Ba" }] } });
    expect(Object.keys(merged)).toEqual(["hero", "nav"]);
    expect(merged.nav).toEqual({ home: "Nhà" });
    expect((merged.hero as { slides: unknown[] }).slides).toHaveLength(2);
  });

  it("ignores a published value of the wrong kind", () => {
    expect(mergeMessages(defaults, { nav: "oops", hero: { title: 5 } })).toEqual(defaults);
  });

  it("does not touch what it was given", () => {
    const before = structuredClone(defaults);
    mergeMessages(defaults, { nav: { home: "x" } });
    expect(defaults).toEqual(before);
  });
});
