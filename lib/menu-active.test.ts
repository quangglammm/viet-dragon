import { describe, expect, it } from "vitest";
import { isSubmenuGroupActive, isSubmenuItemActive } from "./menu-active";

const SHAPE_LINK = "/products/tet/bao-li-xi#bao-li-xi-ep-kim";
const MATERIAL_LINK = "/products/office/danh-thiep/danh-thiep-chuan";

describe("isSubmenuItemActive: a shape link", () => {
  it("is active on the product page with its anchor, and not with another or none", () => {
    expect(isSubmenuItemActive(SHAPE_LINK, "/products/tet/bao-li-xi", "bao-li-xi-ep-kim")).toBe(true);
    expect(isSubmenuItemActive(SHAPE_LINK, "/products/tet/bao-li-xi", "bao-li-xi-2026")).toBe(false);
    expect(isSubmenuItemActive(SHAPE_LINK, "/products/tet/bao-li-xi", "")).toBe(false);
  });

  it("is active on the shape's own page, with no hash or its own", () => {
    expect(isSubmenuItemActive(SHAPE_LINK, "/products/tet/bao-li-xi/bao-li-xi-ep-kim")).toBe(true);
    expect(isSubmenuItemActive(SHAPE_LINK, "/products/tet/bao-li-xi/bao-li-xi-ep-kim", "bao-li-xi-ep-kim")).toBe(true);
    expect(isSubmenuItemActive(SHAPE_LINK, "/products/tet/bao-li-xi/bao-li-xi-ep-kim", "other")).toBe(false);
    expect(isSubmenuItemActive(SHAPE_LINK, "/products/tet/bao-li-xi/bao-li-xi-2026")).toBe(false);
  });

  it("ignores the locale prefix, a query and a trailing slash of the current page", () => {
    expect(isSubmenuItemActive(SHAPE_LINK, "/en/products/tet/bao-li-xi/", "bao-li-xi-ep-kim")).toBe(true);
    expect(isSubmenuItemActive(SHAPE_LINK, "/products/tet/bao-li-xi?x=1", "bao-li-xi-ep-kim")).toBe(true);
  });
});

describe("isSubmenuItemActive: a material link", () => {
  it("is active on the material's page", () => {
    expect(isSubmenuItemActive(MATERIAL_LINK, "/products/office/danh-thiep/danh-thiep-chuan")).toBe(true);
    expect(isSubmenuItemActive(MATERIAL_LINK, "/products/office/danh-thiep/danh-thiep-cao-cap")).toBe(false);
  });

  it("is active on the product page scrolled to the material, and not on the bare product page", () => {
    expect(isSubmenuItemActive(MATERIAL_LINK, "/products/office/danh-thiep", "danh-thiep-chuan")).toBe(true);
    expect(isSubmenuItemActive(MATERIAL_LINK, "/products/office/danh-thiep", "")).toBe(false);
    expect(isSubmenuItemActive(MATERIAL_LINK, "/products/office/danh-thiep", "other")).toBe(false);
  });

  it("is never active for a group link (the product page itself) or an empty link", () => {
    expect(isSubmenuItemActive("/products/office/danh-thiep", "/products/office/danh-thiep")).toBe(false);
    expect(isSubmenuItemActive("", "/products/office/danh-thiep")).toBe(false);
  });
});

describe("isSubmenuGroupActive", () => {
  it("is active on the product page and everything under it, not on a sibling product", () => {
    expect(isSubmenuGroupActive("/products/office/danh-thiep", "/products/office/danh-thiep")).toBe(true);
    expect(isSubmenuGroupActive("/products/office/danh-thiep", "/vi/products/office/danh-thiep/gap-doi")).toBe(true);
    expect(isSubmenuGroupActive("/products/office/danh-thiep", "/products/office/danh-thiep-cao-cap")).toBe(false);
    expect(isSubmenuGroupActive("", "/products")).toBe(false);
  });
});
