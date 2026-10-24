import type { MenuDocument, PostDocument, ProductDocument } from "@/lib/content/schemas";

// Small, valid documents for the schema tests. Builders return fresh objects, so a test may mutate its copy.

export const UID = {
  product: "11111111-1111-4111-8111-111111111111",
  shapeA5: "22222222-2222-4222-8222-222222222222",
  shapeA4: "33333333-3333-4333-8333-333333333333",
  option: "44444444-4444-4444-8444-444444444444",
  optionForShape: "55555555-5555-4555-8555-555555555555",
  post: "66666666-6666-4666-8666-666666666666",
} as const;

export function productDocument(): ProductDocument {
  return {
    schema: 2,
    uid: UID.product,
    category: "marketing",
    slug: "to-roi",
    aliases: [{ category: "marketing", slug: "flyer" }],
    status: "published",
    position: 0,
    cover: "images/product/to-roi.webp",
    ogImage: null,
    i18n: {
      vi: { title: "Tờ rơi", description: "In tờ rơi nhanh", seoTitle: "In tờ rơi giá rẻ" },
      en: { title: "Flyers" },
    },
    shapes: [
      {
        uid: UID.shapeA5,
        slug: "a5",
        aliases: [],
        position: 0,
        image: null,
        ogImage: null,
        i18n: { vi: { name: "A5", badge: "Mới" }, en: { name: "A5 flyer" } },
      },
      {
        uid: UID.shapeA4,
        slug: "a4",
        aliases: ["kho-a4"],
        position: 1,
        image: null,
        ogImage: null,
        i18n: { vi: { name: "A4" } },
      },
    ],
    options: [
      {
        uid: UID.option,
        slug: "giay-loai-c",
        aliases: [],
        shape: null,
        material: "giay-loai-c",
        position: 0,
        icon: "Layers",
        hideFoil: false,
        hideDoubleSided: false,
        prices: { base: null, doubleSided: null, foil: null, foil2: null },
        unit: "box",
        ogImage: null,
        i18n: { vi: { name: "Giấy loại C", tagline: "Bóng đẹp" }, en: { name: "Type C paper", cardTitle: "Type C" } },
        bullets: [
          { kind: "feature", position: 0, trait: "glossy-coat", i18n: { vi: "Bóng", en: "Glossy" } },
          { kind: "best_for", position: 0, trait: null, i18n: { vi: "Sự kiện" } },
        ],
        images: { default: ["images/product/c.webp"], pure: [] },
      },
      {
        uid: UID.optionForShape,
        slug: "giay-loai-c-a5",
        aliases: [],
        shape: UID.shapeA5,
        material: "giay-loai-c",
        position: 1,
        icon: null,
        hideFoil: false,
        hideDoubleSided: false,
        prices: { base: 1000, doubleSided: null, foil: null, foil2: null },
        unit: null,
        ogImage: null,
        i18n: { vi: { name: "Giấy loại C khổ A5" } },
        bullets: [],
        images: { default: [], pure: [] },
      },
    ],
    sizes: [
      { shape: null, tier: "large", w: 210, h: 297, d: null, text: null, i18n: { vi: "Lớn" } },
      { shape: UID.shapeA5, tier: "large", w: null, h: null, d: null, text: "Size L - XL", i18n: {} },
    ],
    specs: [
      { shape: null, kind: "technique", item: "offset", position: 0 },
      { shape: UID.shapeA5, kind: "finishing", item: "matte-lamination", position: 0 },
    ],
  };
}

export function menuDocument(): MenuDocument {
  return {
    schema: 2,
    key: "marketing",
    category: "marketing",
    columns: [
      {
        column: 1,
        groups: [
          {
            product: UID.product,
            image: null,
            i18n: { vi: { label: "Tờ rơi" } },
            items: [
              { target: { shape: UID.shapeA5 }, isFast: true, image: null, i18n: {} },
              { target: { option: UID.option }, isFast: false, image: "images/menu/c.webp", i18n: { vi: "Giấy C" } },
            ],
          },
        ],
      },
    ],
  };
}

export function postDocument(): PostDocument {
  return {
    schema: 2,
    uid: UID.post,
    slug: "huong-dan-in-an",
    aliases: ["in-an-co-ban"],
    category: "tips",
    publishedOn: "2026-01-15",
    readTimeMin: 4,
    cover: null,
    ogImage: null,
    contentFormat: "plain",
    status: "published",
    i18n: { vi: { title: "Hướng dẫn in ấn", content: "Nội dung bài viết." }, en: { title: "Printing guide", excerpt: "Short", content: "Body." } },
  };
}
