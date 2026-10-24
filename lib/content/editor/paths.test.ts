import { describe, expect, it } from "vitest";
import { formatPath, getIn, parsePath, removeIn, setIn, setText, updateIn } from "./paths";

describe("parsePath / formatPath", () => {
  it("splits properties and list indexes, and joins them back", () => {
    expect(parsePath("options[2].prices.base")).toEqual(["options", 2, "prices", "base"]);
    expect(parsePath("i18n.vi.title")).toEqual(["i18n", "vi", "title"]);
    expect(parsePath("a[0][1]")).toEqual(["a", 0, 1]);
    expect(formatPath(["options", 2, "prices", "base"])).toBe("options[2].prices.base");
    expect(formatPath(parsePath("columns[1].groups[0].items[3].image"))).toBe("columns[1].groups[0].items[3].image");
  });
});

describe("getIn", () => {
  const doc = { a: { list: [{ x: 1 }, { x: 2 }] }, n: null };
  it("reads through objects and lists, and gives undefined for anything missing", () => {
    expect(getIn(doc, "a.list[1].x")).toBe(2);
    expect(getIn(doc, "a.nope.deeper")).toBeUndefined();
    expect(getIn(doc, "n.x")).toBeUndefined();
    expect(getIn(doc, "a.list[9].x")).toBeUndefined();
  });
});

describe("setIn", () => {
  it("returns a new document and leaves the old one alone", () => {
    const doc = { a: { b: 1, c: 2 }, list: [1, 2, 3] };
    const next = setIn(doc, "a.b", 5);
    expect(next).toEqual({ a: { b: 5, c: 2 }, list: [1, 2, 3] });
    expect(doc.a.b).toBe(1);
    expect(next.list).toBe(doc.list); // untouched branches are shared, not copied
  });

  it("replaces one list element without touching its neighbours", () => {
    const doc = { items: [{ v: 1 }, { v: 2 }] };
    const next = setIn(doc, "items[1].v", 9);
    expect(next.items[0]).toBe(doc.items[0]);
    expect(next).toEqual({ items: [{ v: 1 }, { v: 9 }] });
  });

  it("creates the objects and lists on the way", () => {
    expect(setIn({}, "i18n.zh.title", "x")).toEqual({ i18n: { zh: { title: "x" } } });
    expect(setIn({}, "rows[1].v", 1)).toEqual({ rows: [undefined, { v: 1 }] });
  });
});

describe("removeIn", () => {
  it("removes a key or a list element", () => {
    expect(removeIn({ a: 1, b: 2 }, "a")).toEqual({ b: 2 });
    expect(removeIn({ list: [1, 2, 3] }, "list[1]")).toEqual({ list: [1, 3] });
    expect(removeIn({ a: { b: 1, c: 2 } }, "a.b")).toEqual({ a: { c: 2 } });
  });
  it("leaves the document alone when the path is not there", () => {
    const doc = { a: 1 };
    expect(removeIn(doc, "x.y")).toBe(doc);
  });
});

describe("updateIn", () => {
  it("derives the new value from the current one", () => {
    expect(updateIn({ list: [1] }, "list", (current: number[] | undefined) => [...(current ?? []), 2])).toEqual({ list: [1, 2] });
  });
});

describe("setText", () => {
  it("stores text as typed", () => {
    expect(setText({ i18n: { vi: { title: "a" } } }, "i18n.vi.title", "b")).toEqual({ i18n: { vi: { title: "b" } } });
  });

  it("treats blank as 'not provided': the key goes, never an empty string", () => {
    expect(setText({ i18n: { vi: { title: "a", description: "d" } } }, "i18n.vi.description", "   ")).toEqual({ i18n: { vi: { title: "a" } } });
    expect(setText({ note: "x" }, "note", "")).toEqual({});
  });

  it("removes a language row that is left with nothing, so the language falls back to English", () => {
    const doc = { i18n: { vi: { title: "a" }, zh: { title: "z" } } };
    expect(setText(doc, "i18n.zh.title", "")).toEqual({ i18n: { vi: { title: "a" } } });
  });

  it("does the same for a language whose value is the text itself (bullets, size notes)", () => {
    expect(setText({ bullets: [{ i18n: { vi: "a", zh: "z" } }] }, "bullets[0].i18n.zh", "")).toEqual({ bullets: [{ i18n: { vi: "a" } }] });
  });

  it("keeps a row that still has other texts, and structure that is not a language row", () => {
    const doc = { i18n: { zh: { title: "z", description: "d" } }, prices: { base: 1 } };
    expect(setText(doc, "i18n.zh.title", "")).toEqual({ i18n: { zh: { description: "d" } }, prices: { base: 1 } });
    expect(setText({ prices: { only: "x" } }, "prices.only", "")).toEqual({ prices: {} });
  });
});
