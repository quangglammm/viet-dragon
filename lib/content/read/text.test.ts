import { describe, expect, it } from "vitest";
import { localize, overlay, pickText } from "./text";

describe("pickText", () => {
  const text = { vi: "Tờ rơi", en: "Flyers", ja: "チラシ" };

  it("takes the requested language", () => {
    expect(pickText("vi", text)).toBe("Tờ rơi");
    expect(pickText("ja", text)).toBe("チラシ");
  });

  it("falls back to English, then Vietnamese", () => {
    expect(pickText("zh", text)).toBe("Flyers");
    expect(pickText("zh", { vi: "Tờ rơi" })).toBe("Tờ rơi");
    expect(pickText("vi", { en: "Flyers" })).toBe("Flyers");
  });

  it("gives an empty text for nothing at all", () => {
    expect(pickText("en", {})).toBe("");
    expect(pickText("en", undefined)).toBe("");
  });
});

describe("localize", () => {
  it("reads one text per language from the document's rows and leaves out blank and missing ones", () => {
    const rows: Partial<Record<"vi" | "en" | "zh", { name?: string; note?: string }>> = { vi: { name: "A", note: "x" }, en: { name: "B", note: "  " }, zh: { note: "z" } };
    expect(localize(rows, (row) => row.name)).toEqual({ vi: "A", en: "B" });
    expect(localize(rows, (row) => row.note)).toEqual({ vi: "x", zh: "z" });
    expect(localize(undefined, () => "x")).toEqual({});
  });
});

describe("overlay", () => {
  it("lets the first layer that has a text for a language win, language by language", () => {
    expect(overlay({ vi: "Nhãn riêng" }, { vi: "Tên", en: "Name" }, { zh: "名" })).toEqual({ vi: "Nhãn riêng", en: "Name", zh: "名" });
  });

  it("treats a blank text as absent", () => {
    expect(overlay({ vi: " " }, { vi: "Tên" })).toEqual({ vi: "Tên" });
  });
});
