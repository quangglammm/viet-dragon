import { describe, expect, it } from "vitest";
import type { FastPrintItemDocument, ShowcaseItemDocument, UnitDocument } from "../schemas";
import { buildFastPrint, buildShowcase, fastPrintCardsOf, showcaseCardsOf, showcaseSlotsOf } from "./merchandising";

const UNIT: UnitDocument = { schema: 2, key: "hop", i18n: { vi: { label: "Hộp" }, en: { label: "Box" }, zh: { label: "盒" } } };

function item(key: string, position: number, overrides: Partial<FastPrintItemDocument> = {}): FastPrintItemDocument {
  return {
    schema: 2,
    uid: `00000000-0000-4000-8000-0000000000${position.toString().padStart(2, "0")}`,
    key,
    image: `images/product/${key}.jpeg`,
    icon: "CreditCard",
    turnaroundHours: 2,
    fromPrice: 120000,
    unit: "hop",
    position,
    status: "published",
    i18n: { vi: { name: `Tên ${key}`, tag: "In nhanh 2h", description: "Mô tả" }, en: { name: `Name ${key}`, tag: "Ready in 2h" } },
    ...overrides,
  };
}

describe("buildFastPrint and fastPrintCardsOf", () => {
  const fastPrint = () => buildFastPrint({ items: [item("b", 2), item("a", 1), item("hidden", 0, { status: "archived" })], units: [UNIT] });

  it("lists the published items in position order", () => {
    expect(fastPrint().items.map((entry) => entry.key)).toEqual(["a", "b"]);
  });

  it("words a card in the page's language, falling back text by text, and gives the image its public path", () => {
    const [card] = fastPrintCardsOf(fastPrint(), "en");
    expect(card).toMatchObject({ key: "a", name: "Name a", tag: "Ready in 2h", description: "Mô tả", image: "/images/product/a.jpeg", icon: "CreditCard" }); // no English description: Vietnamese
    expect(fastPrintCardsOf(fastPrint(), "ja")[0].name).toBe("Name a"); // ja → English
  });

  it("quotes the price as an amount and the unit's name in the page's language", () => {
    expect(fastPrintCardsOf(fastPrint(), "vi")[0].price).toEqual({ amount: 120000, unit: "Hộp" });
    expect(fastPrintCardsOf(fastPrint(), "zh")[0].price).toEqual({ amount: 120000, unit: "盒" });
    expect(fastPrintCardsOf(fastPrint(), "ko")[0].price).toEqual({ amount: 120000, unit: "Box" }); // no Korean name: English
  });

  it("shows no price line for an item without a price or without a unit", () => {
    const bare = buildFastPrint({ items: [item("a", 1, { fromPrice: null }), item("b", 2, { unit: null }), item("c", 3, { unit: "missing" })], units: [UNIT] });
    expect(fastPrintCardsOf(bare, "vi").map((card) => card.price)).toEqual([null, null, null]);
  });

  it("does not touch the documents it was given", () => {
    const items = [item("b", 2), item("a", 1)];
    const before = structuredClone(items);
    buildFastPrint({ items, units: [UNIT] });
    expect(items).toEqual(before);
  });
});

function shot(key: string, position: number, aspect: ShowcaseItemDocument["aspect"]): ShowcaseItemDocument {
  return { schema: 2, uid: `10000000-0000-4000-8000-0000000000${position.toString().padStart(2, "0")}`, key, media: `images/product/${key}.jpeg`, aspect, position, i18n: { vi: { label: `Nhãn ${key}` }, en: { label: `Label ${key}` } } };
}

describe("the showcase", () => {
  const items = [shot("w2", 5, "wide"), shot("t1", 3, "tall"), shot("s1", 1, "square"), shot("s2", 2, "square"), shot("w1", 4, "wide")];

  it("lists the pictures in position order, served from the site root, labelled in the page's language", () => {
    const cards = showcaseCardsOf(buildShowcase(items), "en");
    expect(cards.map((card) => card.src)).toEqual(["/images/product/s1.jpeg", "/images/product/s2.jpeg", "/images/product/t1.jpeg", "/images/product/w1.jpeg", "/images/product/w2.jpeg"]);
    expect(cards[0].label).toBe("Label s1");
    expect(showcaseCardsOf(buildShowcase(items), "zh")[0].label).toBe("Label s1");
  });

  it("slots the desktop layout by aspect, not by position", () => {
    const slots = showcaseSlotsOf(showcaseCardsOf(buildShowcase(items), "vi"));
    expect(slots.tall?.src).toBe("/images/product/t1.jpeg");
    expect(slots.squares.map((card) => card.label)).toEqual(["Nhãn s1", "Nhãn s2"]);
    expect(slots.wides.map((card) => card.label)).toEqual(["Nhãn w1", "Nhãn w2"]);
  });

  it("takes at most one tall, two squares and two wides, and copes with a slot nobody fills", () => {
    const many = [shot("t1", 1, "tall"), shot("t2", 2, "tall"), shot("s1", 3, "square"), shot("s2", 4, "square"), shot("s3", 5, "square")];
    const slots = showcaseSlotsOf(showcaseCardsOf(buildShowcase(many), "vi"));
    expect(slots.tall?.label).toBe("Nhãn t1");
    expect(slots.squares).toHaveLength(2);
    expect(slots.wides).toEqual([]);
    expect(showcaseSlotsOf([])).toEqual({ tall: null, squares: [], wides: [] });
  });
});
