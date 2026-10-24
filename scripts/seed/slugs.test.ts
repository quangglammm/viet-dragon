import { describe, expect, it } from "vitest";
import { clipSlug, claimSlugs, emptyTaken } from "./slugs";

describe("claimSlugs", () => {
  it("keeps Vietnamese, generates English, and copies English into zh/ja/ko", () => {
    const taken = emptyTaken();
    expect(claimSlugs(taken, "to-roi", "flyers")).toEqual({ vi: "to-roi", en: "flyers", zh: "flyers", ja: "flyers", ko: "flyers" });
  });
  it("makes each language unique on its own", () => {
    const taken = emptyTaken();
    claimSlugs(taken, "a5", "a5");
    const second = claimSlugs(taken, "a5", "a5-flyer");
    expect(second).toMatchObject({ vi: "a5-2", en: "a5-flyer", zh: "a5-flyer" });
    expect(claimSlugs(taken, "khac", "a5").en).toBe("a5-2");
  });
  it("reserves the English slug in zh/ja/ko so later claims cannot take it", () => {
    const taken = emptyTaken();
    claimSlugs(taken, "x", "same");
    expect(taken.zh.has("same") && taken.ja.has("same") && taken.ko.has("same")).toBe(true);
  });
});

describe("clipSlug", () => {
  it("leaves short slugs alone and cuts long ones at a dash", () => {
    expect(clipSlug("short-slug")).toBe("short-slug");
    const long = "viet-dragon-opens-new-facility-in-binh-duong-with-a-longer-tail-here";
    expect(clipSlug(long)).toBe("viet-dragon-opens-new-facility-in-binh-duong-with-a-longer");
    expect(clipSlug(long).length).toBeLessThanOrEqual(60);
    expect(clipSlug("x".repeat(80))).toBe("x".repeat(60));
  });
});
