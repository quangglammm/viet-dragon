import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOCALES } from "../schemas";
import { completeLike, groupLines, groupOf, isLongText, leafPaths, lineLabel, setMessageText, textOf, type MessageData } from "./message-tree";
import { SITE_MESSAGE_LABELS, siteMessageLabel } from "./site-message-labels";

const messages = (locale: string) => JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")) as Record<string, unknown>;

describe("leafPaths", () => {
  it("lists the texts of a namespace in the order of the Vietnamese tree, lists included", () => {
    const data: MessageData = { vi: { title: "T", items: [{ q: "q1", a: "a1" }, { q: "q2", a: "a2" }], checklist: ["x", "y"] } };
    expect(leafPaths(data)).toEqual(["title", "items[0].q", "items[0].a", "items[1].q", "items[1].a", "checklist[0]", "checklist[1]"]);
  });

  it("adds the lines only another language has, after the Vietnamese ones, once each", () => {
    expect(leafPaths({ vi: { a: "1" }, en: { a: "1", b: "2" }, zh: { b: "2", c: "3" } })).toEqual(["a", "b", "c"]);
  });

  it("finds exactly the 358 texts of the real Vietnamese file (and the same ones in the faq of every language)", () => {
    const real = (locale: string) => ({ [locale]: messages(locale).faq });
    for (const locale of LOCALES) expect(leafPaths(real(locale) as MessageData)).toEqual(leafPaths({ vi: messages("vi").faq } as MessageData));
    const total = Object.values(messages("vi")).reduce<number>((sum, namespace) => sum + leafPaths({ vi: namespace }).length, 0);
    expect(total).toBe(358);
  });
});

describe("groupOf and textOf", () => {
  it("groups a line under the list or object it sits in; a top-level line has no group", () => {
    expect(groupOf("title")).toBe("");
    expect(groupOf("items[2].a")).toBe("items");
    expect(groupOf("checklist[0]")).toBe("checklist");
    expect(groupOf("cta.label")).toBe("cta");
  });

  it("reads a text, or an empty one for a language that lacks it", () => {
    const data: MessageData = { vi: { items: [{ a: "x" }] }, en: {} };
    expect(textOf(data, "vi", "items[0].a")).toBe("x");
    expect(textOf(data, "en", "items[0].a")).toBe("");
    expect(textOf(data, "zh", "items[0].a")).toBe("");
  });
});

describe("groupLines and lineLabel", () => {
  it("draws the top-level lines first, then each list or object in the order it appears", () => {
    expect(groupLines(["items[0].q", "title", "items[0].a", "checklist[0]", "subtitle"])).toEqual([
      { group: "", paths: ["title", "subtitle"] },
      { group: "items", paths: ["items[0].q", "items[0].a"] },
      { group: "checklist", paths: ["checklist[0]"] },
    ]);
  });

  it("says where a line is, counting positions from 1", () => {
    expect(lineLabel("title")).toBe("title");
    expect(lineLabel("items[2].a")).toBe("items › 3 › a");
    expect(lineLabel("checklist[0]")).toBe("checklist › 1");
  });
});

describe("setMessageText", () => {
  const document = { data: { vi: { title: "Tiêu đề", list: ["a", "b", "c"] }, en: { title: "Title", list: ["a", "b", "c"] } } };

  it("changes one text and leaves the others and the document alone", () => {
    const next = setMessageText(document, "en", "title", "New");
    expect(next.data.en).toEqual({ title: "New", list: ["a", "b", "c"] });
    expect(next.data.vi).toBe(document.data.vi);
    expect(document.data.en.title).toBe("Title");
  });

  it("stores a blank as an empty text, never removing the key: a list position must not shift", () => {
    const next = setMessageText(document, "en", "list[1]", "") as typeof document;
    expect(next.data.en.list).toEqual(["a", "", "c"]);
  });

  it("starts a language the document lacks from the Vietnamese structure, so a list never gets holes", () => {
    const next = setMessageText(document, "zh", "list[2]", "丙") as { data: Record<string, { title: string; list: string[] }> };
    expect(next.data.zh).toEqual({ title: "", list: ["", "", "丙"] });
  });

  it("completes a language whose tree is shorter than the reference", () => {
    const short = { data: { ...document.data, ko: { title: "제목", list: ["가"] } } };
    const next = setMessageText(short, "ko", "list[2]", "다") as { data: Record<string, { list: string[] }> };
    expect(next.data.ko.list).toEqual(["가", "", "다"]);
  });
});

describe("completeLike", () => {
  it("fills in what the reference has and keeps what the tree has", () => {
    expect(completeLike({ a: "x" }, { a: "1", b: { c: "2" }, d: ["3", "4"] })).toEqual({ a: "x", b: { c: "" }, d: ["", ""] });
  });
});

describe("the namespace labels", () => {
  it("name every namespace of the site's texts, and nothing else", () => {
    expect(Object.keys(SITE_MESSAGE_LABELS).sort()).toEqual(Object.keys(messages("vi")).sort());
  });

  it("falls back to the key for a namespace it does not know", () => {
    expect(siteMessageLabel("hero")).toBe("Trang chủ — Banner đầu trang");
    expect(siteMessageLabel("somethingNew")).toBe("somethingNew");
  });
});

describe("isLongText", () => {
  it("gives a paragraph a tall box and a label a single line", () => {
    expect(isLongText("Mua ngay")).toBe(false);
    expect(isLongText("x".repeat(81))).toBe(true);
    expect(isLongText("a\nb")).toBe(true);
  });
});
