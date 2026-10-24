import { describe, expect, it } from "vitest";
import { catalogInput } from "@/tests/fixtures/catalog";
import { UID } from "@/tests/fixtures/documents";
import { buildCatalog } from "./catalog";
import { cardOf, sizeOf, TIER_LABELS } from "./card";
import type { SizeView } from "./types";

const catalog = () => buildCatalog(catalogInput());
const product = () => catalog().products[0];
const size = (overrides: Partial<SizeView> = {}): SizeView => ({ shape: null, tier: "large", w: 210, h: 297, d: null, text: null, note: {}, ...overrides });

describe("sizeOf", () => {
  it("writes a measure in centimetres, width then height, and the depth when there is one", () => {
    expect(sizeOf(size(), "vi").dims).toBe("21 x 29.7 cm");
    expect(sizeOf(size({ w: 90, h: 55 }), "vi").dims).toBe("9 x 5.5 cm");
    expect(sizeOf(size({ w: 300, h: 200, d: 150 }), "vi").dims).toBe("30 x 20 x 15 cm");
  });

  it("shows a size that is not a measure as written", () => {
    expect(sizeOf(size({ w: null, h: null, text: "Size L - XL" }), "vi").dims).toBe("Size L - XL");
  });

  it("names the tier in the page's language, with the note in brackets when the language has one", () => {
    expect(sizeOf(size({ tier: "medium" }), "vi")).toMatchObject({ id: "medium", label: "Vừa" });
    expect(sizeOf(size({ tier: "small" }), "en").label).toBe("Small");
    expect(sizeOf(size({ tier: "large", note: { vi: "A4", en: "A4 sheet" } }), "en").label).toBe("Large (A4 sheet)");
    expect(sizeOf(size({ tier: "large", note: { vi: "A4" } }), "ko").label).toBe("대"); // a note exists in Vietnamese only: not guessed in Korean
  });

  it("has a tier name for every language and tier", () => {
    for (const labels of Object.values(TIER_LABELS)) expect(labels.every((label) => label.trim() !== "")).toBe(true);
    expect(Object.keys(TIER_LABELS).sort()).toEqual(["en", "ja", "ko", "vi", "zh"]);
  });
});

describe("cardOf", () => {
  const option = (uid: string) => product().options.find((candidate) => candidate.uid === uid)!;

  it("draws the option's heading, tagline, icon and anchor in the page's language", () => {
    const card = cardOf(catalog(), "vi", product(), option(UID.option), null, "Tờ rơi - Giấy loại C");
    expect(card).toMatchObject({ uid: UID.option, icon: "Layers", heading: "Giấy loại C", tagline: "Bóng đẹp", consultName: "Tờ rơi - Giấy loại C" });
    expect(card.anchor).toEqual({ id: "giay-loai-c", aliases: ["type-c-paper"] });
    expect(cardOf(catalog(), "en", product(), option(UID.option), null, "x")).toMatchObject({ heading: "Type C", anchor: { id: "type-c-paper", aliases: ["giay-loai-c"] } });
  });

  it("takes the icon of each feature from its trait, and none for a bullet without one", () => {
    const card = cardOf(catalog(), "vi", product(), option(UID.option), null, "x");
    expect(card.features).toEqual([{ icon: "Sparkles", text: "Bóng" }]);
    expect(card.bestFor).toEqual(["Sự kiện"]);
    const noTrait = { ...option(UID.option), features: [{ trait: null, text: { vi: "Giá tốt" } }, { trait: "unknown-trait", text: { vi: "Lạ" } }] };
    expect(cardOf(catalog(), "vi", product(), noTrait, null, "x").features).toEqual([{ icon: null, text: "Giá tốt" }, { icon: null, text: "Lạ" }]);
  });

  it("shows the plain-stock photos when the option has them, the others otherwise", () => {
    expect(cardOf(catalog(), "vi", product(), option(UID.option), null, "x").images).toEqual(["/images/product/c.webp"]);
    const pure = { ...option(UID.option), pureImages: ["/images/product/pure.webp"] };
    expect(cardOf(catalog(), "vi", product(), pure, null, "x").images).toEqual(["/images/product/pure.webp"]);
  });

  it("uses the product's sizes and spec lists, or the shape's where it has its own", () => {
    const product_ = product();
    const wide = cardOf(catalog(), "vi", product_, option(UID.option), null, "x");
    expect(wide.sizes).toEqual([expect.objectContaining({ id: "large", dims: "21 x 29.7 cm" })]);
    expect(wide.techniques).toEqual(["In offset"]);
    expect(wide.finishing).toEqual([]);
    expect(wide.materials).toEqual([]);
    const a5 = cardOf(catalog(), "en", product_, option(UID.optionForShape), UID.shapeA5, "x");
    expect(a5.sizes).toEqual([{ id: "large", label: "Large", dims: "Size L - XL" }]);
    expect(a5.techniques).toEqual(["Offset printing"]); // the shape has no technique rows: the product's
    expect(a5.finishing).toEqual(["Matte lamination"]);
  });

  it("falls back to the option's name for a heading no language supplies", () => {
    const untitled = { ...option(UID.option), title: {} };
    expect(cardOf(catalog(), "vi", product(), untitled, null, "x").heading).toBe("Giấy loại C");
  });
});
