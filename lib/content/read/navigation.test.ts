import { describe, expect, it } from "vitest";
import { catalogInput, categoryDocument } from "@/tests/fixtures/catalog";
import { menuDocument, productDocument } from "@/tests/fixtures/documents";
import type { MenuDocument } from "../schemas";
import { mockCatalog, mockMenus } from "@/lib/mock-data";
import { buildCatalog } from "./catalog";
import { buildMenus } from "./menus";
import { cardsOf, menuOf, navigationOf, referenceImageOf } from "./navigation";

const catalog = () => buildCatalog(catalogInput());
const menus = (document: MenuDocument = menuDocument()) => buildMenus(catalog(), [document]);
const marketing = (locale: "vi" | "en" | "zh") => navigationOf(catalog(), menus(), locale).categories[0];

describe("navigationOf", () => {
  it("names a category, links it in the page's language and carries its icon and cover", () => {
    expect(marketing("vi")).toMatchObject({ id: "marketing", name: "Tiếp thị", description: "Ấn phẩm quảng bá", icon: "Briefcase", cover: "/images/category/mkt.jpg", href: "/products/tiep-thi" });
    expect(marketing("en")).toMatchObject({ name: "Marketing", href: "/products/marketing" });
  });

  it("falls back text by text, English first: a language without a name reads the English one", () => {
    expect(marketing("zh")).toMatchObject({ name: "Marketing", description: "Promotional prints", href: "/products/marketing" }); // zh slugs are copies of English
  });

  it("lists the menu as columns of groups, each linking its product, with shapes as anchors and materials as pages", () => {
    const [column] = marketing("vi").menu.columns;
    const [group] = column.groups;
    expect(column.id).toBe("column-1");
    expect(group).toMatchObject({ title: "Tờ rơi", href: "/products/tiep-thi/to-roi", image: "/images/product/to-roi.webp" });
    expect(group.items.map((item) => [item.label, item.href, item.isFast])).toEqual([
      ["A5", "/products/tiep-thi/to-roi#a5", true],
      ["Giấy C", "/products/tiep-thi/to-roi/giay-loai-c", false],
    ]);
  });

  it("builds the same menu in another language from that language's slugs and names", () => {
    const [group] = marketing("en").menu.columns[0].groups;
    expect(group.title).toBe("Flyers"); // the group's override is Vietnamese-only
    expect(group.href).toBe("/products/marketing/flyers");
    expect(group.items.map((item) => [item.label, item.href])).toEqual([
      ["A5 flyer", "/products/marketing/flyers#a5-flyer"],
      ["Type C paper", "/products/marketing/flyers/type-c-paper"],
    ]);
  });

  it("shows the first group's picture behind the desktop menu until a link is hovered", () => {
    expect(marketing("vi").menu.defaultImage).toBe("/images/product/to-roi.webp");
    const withPicture = menuDocument();
    withPicture.columns[0].groups[0].image = "images/menu/first.webp";
    expect(navigationOf(catalog(), menus(withPicture), "vi").categories[0].menu.defaultImage).toBe("/images/menu/first.webp");
  });

  it("has an empty menu for a category without one", () => {
    expect(navigationOf(catalog(), {}, "vi").categories[0].menu).toEqual({ defaultImage: null, columns: [] });
    expect(menuOf(catalog(), "vi", undefined)).toEqual({ defaultImage: null, columns: [] });
  });

  it("scopes product lookup to categoryId when multiple categories share a product uid", () => {
    const p1 = { ...productDocument(), category: "marketing", uid: "shared-uid", shapes: [{ ...productDocument().shapes[0], uid: "shape-mkt" }] };
    const p2 = {
      ...productDocument(),
      category: "tet",
      uid: "shared-uid",
      shapes: [{
        ...productDocument().shapes[0],
        uid: "shape-tet",
        name: { vi: "Hình Thức Tết" },
        slugs: {
          vi: { slug: "hinh-thuc-tet", aliases: [] },
          en: { slug: "tet-shape", aliases: [] },
          zh: { slug: "tet-shape", aliases: [] },
          ja: { slug: "tet-shape", aliases: [] },
          ko: { slug: "tet-shape", aliases: [] },
        },
      }],
    };
    const tetCategory = categoryDocument("tet", {
      slugs: {
        vi: { slug: "an-pham-tet", aliases: [] },
        en: { slug: "tet", aliases: [] },
        zh: { slug: "tet", aliases: [] },
        ja: { slug: "tet", aliases: [] },
        ko: { slug: "tet", aliases: [] },
      },
    });
    const built = buildCatalog({ ...catalogInput(), categories: [categoryDocument(), tetCategory], products: [p1, p2] });
    const tetMenu = {
      category: "tet",
      columns: [{
        column: 0,
        groups: [{
          product: "shared-uid",
          title: { vi: "Tết" },
          description: {},
          image: null,
          items: [{ target: { shape: "shape-tet" }, kind: "shape" as const, label: { vi: "Hình Thức Tết" }, image: null, isFast: false }],
        }],
      }],
    };
    const nav = navigationOf(built, { tet: tetMenu }, "vi");
    const tetCat = nav.categories.find((c) => c.id === "tet");
    expect(tetCat?.menu.columns[0].groups[0].items[0].href).toBe("/products/an-pham-tet/to-roi#hinh-thuc-tet");
  });

  it("resolves shape items in mock data menus to hrefs containing hash anchors", () => {
    const nav = navigationOf(mockCatalog, mockMenus, "vi");
    let shapeCount = 0;
    const missingHash: string[] = [];
    for (const [catId, menuObj] of Object.entries(mockMenus)) {
      const cat = nav.categories.find((c) => c.id === catId);
      for (const col of menuObj.columns || []) {
        for (const group of col.groups || []) {
          for (const item of group.items || []) {
            if (item.target && "shape" in item.target) {
              shapeCount++;
              const shapeUid = (item.target as { shape: string }).shape;
              const navItem = cat?.menu.columns
                .flatMap((c) => c.groups)
                .flatMap((g) => g.items)
                .find((i) => i.id === shapeUid);
              if (navItem && !navItem.href.includes("#")) {
                missingHash.push(`${catId} -> ${group.product} -> shape ${shapeUid}`);
              }
            }
          }
        }
      }
    }
    expect(shapeCount).toBeGreaterThan(0);
    expect(missingHash).toEqual([]);
  });

  it("resolves material items in mock data menus to option segment URLs instead of bare product URLs", () => {
    const nav = navigationOf(mockCatalog, mockMenus, "vi");
    let materialCount = 0;
    const bareProductHrefs: string[] = [];
    for (const [catId, menuObj] of Object.entries(mockMenus)) {
      const cat = nav.categories.find((c) => c.id === catId);
      for (const col of menuObj.columns || []) {
        for (const group of col.groups || []) {
          for (const item of group.items || []) {
            if (item.target && "option" in item.target) {
              materialCount++;
              const optUid = (item.target as { option: string }).option;
              const navItem = cat?.menu.columns
                .flatMap((c) => c.groups)
                .flatMap((g) => g.items)
                .find((i) => i.id === optUid);
              const expectedPrefix = `/products/${catId}/${group.product}/`;
              if (!navItem || !navItem.href.startsWith(expectedPrefix)) {
                bareProductHrefs.push(`${catId} -> ${group.product} -> option ${optUid} (href: ${navItem?.href})`);
              }
            }
          }
        }
      }
    }
    expect(materialCount).toBeGreaterThan(0);
    expect(bareProductHrefs).toEqual([]);
  });
});

describe("cardsOf", () => {
  const category = () => catalog().categories[0];

  it("shows each published product of the category with its title, description, picture and page", () => {
    expect(cardsOf(catalog(), "vi", category())).toEqual([
      { id: productDocument().uid, title: "Tờ rơi", description: "In tờ rơi nhanh", image: "/images/product/to-roi.webp", href: "/products/tiep-thi/to-roi", referenceImage: "/images/product/c.webp" }, // no shape pictures: the options' first photo
    ]);
  });

  it("words a card as the product, whatever the mega-menu calls it", () => {
    const document = menuDocument();
    document.columns[0].groups[0].i18n = { vi: { label: "Tờ rơi (menu)", description: "Mô tả menu" } };
    document.columns[0].groups[0].image = "images/menu/group.webp";
    expect(menus(document).marketing.columns[0].groups[0].title.vi).toBe("Tờ rơi (menu)"); // the menu has it...
    expect(cardsOf(catalog(), "vi", category())[0]).toMatchObject({ title: "Tờ rơi", description: "In tờ rơi nhanh", image: "/images/product/to-roi.webp" }); // ...the card does not
  });

  it("lists the products in position order, a product the menu leaves out included", () => {
    const other = { ...productDocument(), uid: "88888888-8888-4888-8888-888888888888", position: 1, slugs: { ...productDocument().slugs }, i18n: { vi: { title: "Danh thiếp" }, en: { title: "Cards" } } };
    const both = buildCatalog({ ...catalogInput(), products: [productDocument(), other] });
    expect(cardsOf(both, "vi", both.categories[0]).map((card) => card.title)).toEqual(["Tờ rơi", "Danh thiếp"]);
  });

  it("lists only the category's products", () => {
    const office = { ...productDocument(), category: "office" };
    const input = { ...catalogInput(), products: [office] };
    const built = buildCatalog(input);
    expect(cardsOf(built, "vi", built.categories[0])).toEqual([]);
  });
});

describe("referenceImageOf", () => {
  const product = () => catalog().products[0];
  const withShapeImages = (images: (string | null)[]) => ({ ...product(), shapes: product().shapes.map((shape, at) => ({ ...shape, image: images[at] ?? null })) });
  const withOptionImages = (images: string[]) => ({ ...product(), options: [{ ...product().options[0], images, pureImages: [] }] });

  it("is the first shape picture that is not the card's own", () => {
    expect(referenceImageOf(withShapeImages(["/a.webp", "/b.webp"]), "/a.webp")).toBe("/b.webp");
    expect(referenceImageOf(withShapeImages(["/b.webp", "/c.webp"]), "/a.webp")).toBe("/b.webp");
  });

  it("is the card's own when every shape picture is the same one", () => {
    expect(referenceImageOf(withShapeImages(["/a.webp", "/a.webp"]), "/a.webp")).toBe("/a.webp");
  });

  it("is the second photo of the options for a product without shape pictures, else the first, else the card's", () => {
    expect(referenceImageOf(withOptionImages(["/o1.webp", "/o2.webp", "/o3.webp"]), "/a.webp")).toBe("/o2.webp");
    expect(referenceImageOf(withOptionImages(["/o1.webp"]), "/a.webp")).toBe("/o1.webp");
    expect(referenceImageOf(withOptionImages([]), "/a.webp")).toBe("/a.webp");
    expect(referenceImageOf(withOptionImages(["/a.webp", "/o2.webp"]), "/a.webp")).toBe("/o2.webp"); // the card's own picture is skipped
  });

  it("is null when there is no picture at all", () => {
    expect(referenceImageOf(withOptionImages([]), null)).toBeNull();
  });
});
