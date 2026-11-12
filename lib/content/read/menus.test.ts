import { describe, expect, it } from "vitest";
import { catalogInput } from "@/tests/fixtures/catalog";
import { menuDocument, productDocument, UID } from "@/tests/fixtures/documents";
import type { MenuDocument } from "../schemas";
import { buildCatalog } from "./catalog";
import { buildMenu, buildMenus } from "./menus";

const catalog = () => buildCatalog(catalogInput());
const group = () => buildMenu(catalog(), menuDocument()).columns[0].groups[0];

describe("buildMenu", () => {
  it("shows a group's own label and the product's description where the group has none", () => {
    expect(group().title).toEqual({ vi: "Tờ rơi", en: "Flyers" }); // vi: the group's override; en: the product's title
    expect(group().description).toEqual({ vi: "In tờ rơi nhanh" }); // the product's
    expect(group().image).toBe("/images/product/to-roi.webp"); // the product's cover
  });

  it("shows a shape link with the shape's name and image, and an option link with the option's name and the product's cover", () => {
    const [shape, option] = group().items;
    expect(shape).toMatchObject({ kind: "shape", target: { shape: UID.shapeA5 }, label: { vi: "A5", en: "A5 flyer" }, isFast: true, image: "/images/product/to-roi.webp" });
    expect(option).toMatchObject({ kind: "material", target: { option: UID.option }, isFast: false, image: "/images/menu/c.webp" });
    expect(option.label).toEqual({ vi: "Giấy C", en: "Type C paper" }); // vi: the override; en: the option's own name
  });

  it("leaves out a group whose product is not published, a link whose target is gone, and a column that ends up empty", () => {
    const menu: MenuDocument = menuDocument();
    menu.columns[0].groups[0].items.push({ target: { shape: "00000000-0000-4000-8000-000000000000" }, isFast: false, image: null, i18n: {} });
    menu.columns.push({ column: 2, groups: [{ product: "99999999-9999-4999-8999-999999999999", image: null, i18n: { vi: { label: "Ẩn" } }, items: [] }] });
    const built = buildMenu(catalog(), menu);
    expect(built.columns).toHaveLength(1);
    expect(built.columns[0].groups[0].items).toHaveLength(2);
  });

  it("drops a group of a product that was archived", () => {
    const archived = buildCatalog({ ...catalogInput(), products: [{ ...productDocument(), status: "archived" }] });
    expect(buildMenu(archived, menuDocument()).columns).toEqual([]);
  });

  it("keys the menus by category", () => {
    expect(Object.keys(buildMenus(catalog(), [menuDocument()]))).toEqual(["marketing"]);
  });
});
