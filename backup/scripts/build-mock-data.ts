import fs from "node:fs";
import path from "node:path";
import { MAIN_CATEGORIES, SUBGROUPS_CATALOG, type SubgroupCategory, type ShapeItem } from "@/scripts/seed/legacy/subgroups-catalog";
import { showcaseImages } from "@/scripts/seed/legacy/showcase";
import { materialTraits } from "@/scripts/seed/legacy/material-traits";
import { MARKETING_SUBMENU_COLUMNS } from "@/scripts/seed/legacy/marketing-menu";
import { OFFICE_SUBMENU_COLUMNS } from "@/scripts/seed/legacy/office-menu";
import { PACKAGING_SUBMENU_COLUMNS } from "@/scripts/seed/legacy/packaging-menu";
import { TET_SUBMENU_COLUMNS } from "@/scripts/seed/legacy/tet-menu";
import { blogPosts, type BlogPost } from "@/scripts/seed/legacy/posts";
import * as translations from "@/scripts/seed/legacy/translations";
import { getProductSizes } from "@/scripts/seed/legacy/product-sizes";
import { PRINT_TECHNIQUES, getPostPressFinishing, getProductMaterials } from "@/scripts/seed/legacy/product-specs";
import { toSlug } from "@/scripts/seed/legacy/shape-aliases";
import { PRINT_PRODUCTS } from "@/scripts/seed/legacy/fast-print";
import type { Catalog, CategoryView, MenuView, ProductView, TraitView, MaterialView, SizeView, SpecView, OptionView, FeatureView } from "@/lib/content/read/types";
import type { FastPrint, ShowcaseItemView } from "@/lib/content/read/merchandising";
import type { Blog, PostView } from "@/lib/content/read/posts";

const LOCALES = ["vi", "en", "zh", "ja", "ko"] as const;
type Locale = (typeof LOCALES)[number];

function localized(vi?: string | null, en?: string | null, zh?: string | null, ja?: string | null, ko?: string | null): Record<Locale, string> {
  const result: Partial<Record<Locale, string>> = {};
  if (vi) result.vi = vi;
  if (en) result.en = en;
  if (zh) result.zh = zh;
  if (ja) result.ja = ja;
  if (ko) result.ko = ko;
  return result as Record<Locale, string>;
}

function buildSlugs(viSlug: string, enName: string): Record<Locale, { slug: string; aliases: string[] }> {
  const enSlug = toSlug(enName) || viSlug;
  return {
    vi: { slug: viSlug, aliases: [] },
    en: { slug: enSlug, aliases: [] },
    zh: { slug: enSlug, aliases: [] },
    ja: { slug: enSlug, aliases: [] },
    ko: { slug: enSlug, aliases: [] },
  };
}

// 1. Showcase
function generateShowcase(): ShowcaseItemView[] {
  return showcaseImages.map((s) => {
    const zh = (translations.SHOWCASE_LABELS as any)[s.seed]?.zh;
    const ja = (translations.SHOWCASE_LABELS as any)[s.seed]?.ja;
    const ko = (translations.SHOWCASE_LABELS as any)[s.seed]?.ko;
    return {
      uid: s.seed,
      key: s.seed,
      src: s.src,
      aspect: s.aspect as any,
      label: localized(s.label, s.labelEn, zh, ja, ko),
    };
  });
}

// 2. Fast Print
function generateFastPrint(): FastPrint {
  const units: Record<string, Record<Locale, string>> = {
    hop: { vi: "Hộp", en: "Box", zh: "盒", ja: "箱", ko: "상자" },
    to: { vi: "Tờ", en: "Sheet", zh: "张", ja: "枚", ko: "장" },
    cai: { vi: "Cái", en: "Pcs", zh: "个", ja: "個", ko: "개" },
    tem: { vi: "Tem", en: "Stamp", zh: "贴", ja: "枚", ko: "매" },
    m2: { vi: "M2", en: "m²", zh: "平方米", ja: "m²", ko: "m²" },
    cuon: { vi: "Cuốn", en: "Book", zh: "本", ja: "冊", ko: "권" },
    ram: { vi: "Ram", en: "Ream", zh: "令", ja: "連", ko: "련" },
    tui: { vi: "Túi", en: "Bag", zh: "袋", ja: "袋", ko: "백" },
    bo: { vi: "Bộ", en: "Set", zh: "套", ja: "セット", ko: "세트" },
    buc: { vi: "Bức", en: "Pcs", zh: "幅", ja: "点", ko: "점" },
    phieu: { vi: "Phiếu", en: "Voucher", zh: "张", ja: "枚", ko: "매" },
    ve: { vi: "Vé", en: "Ticket", zh: "张", ja: "枚", ko: "매" },
    ao: { vi: "Áo", en: "Shirt", zh: "件", ja: "枚", ko: "티셔츠" },
  };

  const parsePrice = (priceStr: string): { amount: number; unitKey: string } | null => {
    const match = priceStr.match(/(\d+(?:\.\d+)?)\s*đ\/([^\s]+)/i);
    if (!match) return null;
    const amount = parseInt(match[1].replace(/\./g, ""), 10);
    const rawUnit = match[2].toLowerCase();
    const unitKey = toSlug(rawUnit);
    return { amount, unitKey };
  };

  const items = PRINT_PRODUCTS.map((p) => {
    const parsed = parsePrice(p.priceVi);
    return {
      uid: p.id,
      key: p.id,
      image: p.image,
      icon: p.icon,
      fromPrice: parsed ? parsed.amount : null,
      unit: parsed ? parsed.unitKey : null,
      name: localized(p.nameVi, p.nameEn, p.nameZh, p.nameJa, p.nameKo),
      tag: localized(p.tagVi, p.tagEn, p.tagZh, p.tagJa, p.tagKo),
      description: localized(p.descVi, p.descEn, p.descZh, p.descJa, p.descKo),
    };
  });

  return { items, units };
}

// 3. Blog
function generateBlog(): Blog {
  const categories: Record<string, Record<Locale, string>> = {
    tips: { vi: "Mẹo in ấn", en: "Printing Tips", zh: "印刷技巧", ja: "印刷のヒント", ko: "인쇄 팁" },
    "case-study": { vi: "Dự án thực tế", en: "Case Studies", zh: "实际案例", ja: "事例紹介", ko: "사례 연구" },
    news: { vi: "Tin tức", en: "News", zh: "新闻", ja: "ニュース", ko: "뉴스" },
  };

  const posts: PostView[] = blogPosts.map((p) => {
    const viSlug = toSlug(p.slug);
    const enSlug = toSlug(p.titleEn) || viSlug;
    return {
      uid: p.slug,
      slugs: {
        vi: { slug: viSlug, aliases: [] },
        en: { slug: enSlug, aliases: [] },
        zh: { slug: enSlug, aliases: [] },
        ja: { slug: enSlug, aliases: [] },
        ko: { slug: enSlug, aliases: [] },
      },
      category: p.category,
      publishedOn: p.date,
      readTimeMin: p.readTime,
      cover: p.coverImage,
      ogImage: p.coverImage,
      contentFormat: "markdown",
      title: localized(p.title, p.titleEn, p.titleZh, p.titleJa, p.titleKo),
      excerpt: localized(p.excerpt, p.excerptEn, p.excerptZh, p.excerptJa, p.excerptKo),
      content: localized(p.content, p.contentEn, p.contentZh, p.contentJa, p.contentKo),
      seo: {
        title: localized(p.title, p.titleEn, p.titleZh, p.titleJa, p.titleKo),
        description: localized(p.excerpt, p.excerptEn, p.excerptZh, p.excerptJa, p.excerptKo),
      },
    };
  });

  return { posts, categories };
}

// 4. Menus
function generateMenus(): Record<string, MenuView> {
  const mapMenu = (catId: string, cols: any[]): MenuView => ({
    category: catId,
    columns: cols.map((c, colIndex) => ({
      column: colIndex,
      groups: c.groups.map((g: any) => {
        const pUid = g.href.match(/\/products\/[^/#]+\/([^/#]+)/)?.[1] || g.id;
        return {
          product: pUid,
          title: localized(g.titleVi, g.titleEn, g.titleZh, g.titleJa, g.titleKo),
          description: localized(g.titleVi, g.titleEn, g.titleZh, g.titleJa, g.titleKo),
          image: g.image,
          items: g.items.map((item: any) => {
            const segMatch = item.href?.match(/^\/products\/[^/#]+\/[^/#]+(?:\/([^/#]+))?(?:#(.+))?$/);
            const hash = segMatch?.[2];
            const pathSeg = segMatch?.[1];
            const target = hash ? { shape: hash } : item.kind === "shape" ? { shape: pathSeg || item.id } : { option: pathSeg || item.id };
            return {
              target,
              kind: item.kind ?? "shape",
              label: localized(item.nameVi, item.nameEn, item.nameZh, item.nameJa, item.nameKo),
              image: item.image,
              isFast: !!item.isFast,
            };
          }),
        };
      }),
    })),
  });

  return {
    marketing: mapMenu("marketing", MARKETING_SUBMENU_COLUMNS),
    office: mapMenu("office", OFFICE_SUBMENU_COLUMNS),
    packaging: mapMenu("packaging", PACKAGING_SUBMENU_COLUMNS),
    tet: mapMenu("tet", TET_SUBMENU_COLUMNS),
  };
}

// 5. Catalog (Categories, Products, Traits, Materials)
function generateCatalog(): Catalog {
  // Traits
  const traits: Record<string, TraitView> = {};
  for (const [key, t] of Object.entries(materialTraits)) {
    traits[key] = {
      key,
      icon: (t.icon as any)?.name ?? "Sparkles",
      label: localized(t.labelVi, t.label),
      description: localized(t.descriptionVi, t.description),
    };
  }

  // Categories
  const categories: CategoryView[] = MAIN_CATEGORIES.map((cat, index) => {
    const zh = (translations.CATEGORY_NAMES as any)[cat.id]?.zh;
    const ja = (translations.CATEGORY_NAMES as any)[cat.id]?.ja;
    const ko = (translations.CATEGORY_NAMES as any)[cat.id]?.ko;
    const zhDesc = (translations.CATEGORY_DESCS as any)[cat.id]?.zh;
    const jaDesc = (translations.CATEGORY_DESCS as any)[cat.id]?.ja;
    const koDesc = (translations.CATEGORY_DESCS as any)[cat.id]?.ko;

    return {
      id: cat.id,
      slugs: buildSlugs(cat.id, cat.nameEn),
      icon: cat.icon,
      cover: cat.coverImage,
      ogImage: cat.coverImage,
      position: index,
      name: localized(cat.nameVi, cat.nameEn, zh, ja, ko),
      description: localized(cat.descriptionVi, cat.description, zhDesc, jaDesc, koDesc),
      seo: {
        title: localized(cat.nameVi, cat.nameEn, zh, ja, ko),
        description: localized(cat.descriptionVi, cat.description, zhDesc, jaDesc, koDesc),
      },
    };
  });

  // Materials & Products
  const materials: Record<string, MaterialView> = {};

  const products: ProductView[] = SUBGROUPS_CATALOG.map((sub, prodIndex) => {
    const zhName = (translations.ITEM_NAMES as any)[sub.id]?.zh ?? sub.titleZh;
    const jaName = (translations.ITEM_NAMES as any)[sub.id]?.ja ?? sub.titleJa;
    const koName = (translations.ITEM_NAMES as any)[sub.id]?.ko ?? sub.titleKo;
    const zhDesc = (translations.ITEM_DESCS as any)[sub.id]?.zh ?? sub.descriptionZh;
    const jaDesc = (translations.ITEM_DESCS as any)[sub.id]?.ja ?? sub.descriptionJa;
    const koDesc = (translations.ITEM_DESCS as any)[sub.id]?.ko ?? sub.descriptionKo;

    // Shapes
    const shapes = (sub.shapes ?? []).map((sh, shapeIndex) => {
      const shZh = (translations.SHAPE_DESCS as any)[sh.id]?.zh ?? sh.descriptionZh;
      const shJa = (translations.SHAPE_DESCS as any)[sh.id]?.ja ?? sh.descriptionJa;
      const shKo = (translations.SHAPE_DESCS as any)[sh.id]?.ko ?? sh.descriptionKo;

      return {
        uid: sh.id,
        slugs: buildSlugs(sh.id, sh.nameEn),
        position: shapeIndex,
        image: sh.image,
        ogImage: sh.image,
        name: localized(sh.nameVi, sh.nameEn, sh.nameZh, sh.nameJa, sh.nameKo),
        description: localized(sh.descriptionVi, sh.descriptionEn, shZh, shJa, shKo),
        badge: localized(sh.badgeVi, sh.badgeEn, sh.badgeZh, sh.badgeJa, sh.badgeKo),
        seo: {
          title: localized(sh.nameVi, sh.nameEn, sh.nameZh, sh.nameJa, sh.nameKo),
          description: localized(sh.descriptionVi, sh.descriptionEn, shZh, shJa, shKo),
        },
      };
    });

    // Options (Materials from sub and shapes)
    const rawOptions = [
      ...(sub.materials ?? []).map((m) => ({ ...m, shape: null })),
      ...(sub.shapes ?? []).flatMap((sh) => (sh.materials ?? []).map((m) => ({ ...m, shape: sh.id }))),
    ];

    const options: OptionView[] = rawOptions.map((opt, optIndex) => {
      const matKey = toSlug(opt.name) || `mat-${optIndex}`;
      if (!materials[matKey]) {
        materials[matKey] = {
          key: matKey,
          icon: opt.icon ?? "Layers",
          name: localized(opt.nameVi, opt.name, opt.nameZh, opt.nameJa, opt.nameKo),
        };
      }

      const features: FeatureView[] = (opt.descriptionVi ?? []).map((descVi, i) => ({
        trait: opt.descriptionTraits?.[i] ?? null,
        text: localized(descVi, opt.description?.[i], opt.descriptionZh?.[i], opt.descriptionJa?.[i], opt.descriptionKo?.[i]),
      }));

      const bestFor = (opt.bestForVi ?? []).map((bVi, i) =>
        localized(bVi, opt.bestFor?.[i], opt.bestForZh?.[i], opt.bestForJa?.[i], opt.bestForKo?.[i])
      );

      const optSlug = toSlug(opt.nameVi) || matKey;

      const optImages = (opt as any).pureImages?.length
        ? (opt as any).pureImages
        : (opt as any).pureImage
        ? [(opt as any).pureImage]
        : opt.images?.length
        ? opt.images
        : (opt as any).image
        ? [(opt as any).image]
        : [];

      return {
        uid: `${sub.id}-${optSlug}-${optIndex}`,
        slugs: buildSlugs(optSlug, opt.name),
        shape: opt.shape,
        material: matKey,
        position: optIndex,
        icon: opt.icon ?? "Layers",
        hideFoil: false,
        hideDoubleSided: false,
        prices: { base: null, doubleSided: null, foil: null, foil2: null },
        ogImage: opt.image ?? (opt as any).pureImage ?? sub.coverImage,
        name: localized(opt.nameVi, opt.name, opt.nameZh, opt.nameJa, opt.nameKo),
        title: localized(opt.nameVi, opt.name, opt.nameZh, opt.nameJa, opt.nameKo),
        tagline: localized(opt.taglineVi, opt.tagline, opt.taglineZh, opt.taglineJa, opt.taglineKo),
        seo: {
          title: localized(opt.nameVi, opt.name, opt.nameZh, opt.nameJa, opt.nameKo),
          description: localized(opt.taglineVi, opt.tagline, opt.taglineZh, opt.taglineJa, opt.taglineKo),
        },
        features,
        bestFor,
        images: optImages,
        pureImages: optImages,
      };
    });

    // Sizes: generate both product-level and shape-level sizes with correct tier and note
    const sizes: SizeView[] = [];

    const generateSizesFor = (shapeId: string | null) => {
      const locSizes: Record<Locale, ReturnType<typeof getProductSizes>> = {
        vi: getProductSizes(sub.titleVi, "vi", sub.id, shapeId ?? undefined, sub.categoryId),
        en: getProductSizes(sub.titleVi, "en", sub.id, shapeId ?? undefined, sub.categoryId),
        zh: getProductSizes(sub.titleVi, "zh", sub.id, shapeId ?? undefined, sub.categoryId),
        ja: getProductSizes(sub.titleVi, "ja", sub.id, shapeId ?? undefined, sub.categoryId),
        ko: getProductSizes(sub.titleVi, "ko", sub.id, shapeId ?? undefined, sub.categoryId),
      };

      const viList = locSizes.vi;
      viList.forEach((s, idx) => {
        const getNote = (locale: Locale) => {
          const item = locSizes[locale][idx];
          if (!item) return "";
          const match = item.label.match(/\(([^)]+)\)/);
          return match ? match[1].trim() : "";
        };

        sizes.push({
          shape: shapeId,
          tier: s.id,
          w: null,
          h: null,
          d: null,
          text: s.dims,
          note: localized(getNote("vi"), getNote("en"), getNote("zh"), getNote("ja"), getNote("ko")),
        });
      });
    };

    // Product-level sizes
    generateSizesFor(null);

    // Shape-level sizes
    (sub.shapes ?? []).forEach((sh) => {
      generateSizesFor(sh.id);
    });

    // Specs
    const rawTechs = PRINT_TECHNIQUES?.vi ?? [];
    const rawFinishing = getPostPressFinishing(sub.titleVi, "", "vi", sub.id, undefined, sub.categoryId) ?? [];
    const rawMats = getProductMaterials(sub.titleVi, "", "vi", sub.id, undefined, sub.categoryId) ?? [];

    const specs: SpecView[] = [
      ...rawTechs.map((labelVi: string, i: number) => ({
        shape: null,
        kind: "technique" as const,
        item: toSlug(labelVi) || `tech-${i}`,
        position: i,
        label: localized(labelVi, PRINT_TECHNIQUES?.en?.[i], PRINT_TECHNIQUES?.zh?.[i], PRINT_TECHNIQUES?.ja?.[i], PRINT_TECHNIQUES?.ko?.[i]),
      })),
      ...rawFinishing.map((labelVi: string, i: number) => {
        const enLabel = getPostPressFinishing(sub.titleEn, "", "en", sub.id, undefined, sub.categoryId)?.[i] ?? labelVi;
        const zhLabel = getPostPressFinishing(zhName, "", "zh", sub.id, undefined, sub.categoryId)?.[i] ?? enLabel;
        const jaLabel = getPostPressFinishing(jaName, "", "ja", sub.id, undefined, sub.categoryId)?.[i] ?? enLabel;
        const koLabel = getPostPressFinishing(koName, "", "ko", sub.id, undefined, sub.categoryId)?.[i] ?? enLabel;
        return {
          shape: null,
          kind: "finishing" as const,
          item: toSlug(labelVi) || `finish-${i}`,
          position: i,
          label: localized(labelVi, enLabel, zhLabel, jaLabel, koLabel),
        };
      }),
      ...rawMats.map((labelVi: string, i: number) => {
        const enLabel = getProductMaterials(sub.titleEn, "", "en", sub.id, undefined, sub.categoryId)?.[i] ?? labelVi;
        const zhLabel = getProductMaterials(zhName, "", "zh", sub.id, undefined, sub.categoryId)?.[i] ?? enLabel;
        const jaLabel = getProductMaterials(jaName, "", "ja", sub.id, undefined, sub.categoryId)?.[i] ?? enLabel;
        const koLabel = getProductMaterials(koName, "", "ko", sub.id, undefined, sub.categoryId)?.[i] ?? enLabel;
        return {
          shape: null,
          kind: "material_hint" as const,
          item: toSlug(labelVi) || `mat-hint-${i}`,
          position: i,
          label: localized(labelVi, enLabel, zhLabel, jaLabel, koLabel),
        };
      }),
    ];

    const prodSlug = buildSlugs(sub.id, sub.titleEn);

    return {
      uid: sub.id,
      category: sub.categoryId,
      slugs: prodSlug as any,
      position: prodIndex,
      cover: sub.coverImage,
      ogImage: sub.coverImage,
      title: localized(sub.titleVi, sub.titleEn, zhName, jaName, koName),
      description: localized(sub.descriptionVi, sub.descriptionEn, zhDesc, jaDesc, koDesc),
      seo: {
        title: localized(sub.titleVi, sub.titleEn, zhName, jaName, koName),
        description: localized(sub.descriptionVi, sub.descriptionEn, zhDesc, jaDesc, koDesc),
      },
      shapes,
      options,
      sizes,
      specs,
    };
  });

  return { categories, products, traits, materials };
}

// 6. Revision Dates
function generateRevisionDates(catalog: Catalog, blog: Blog): Record<string, string> {
  const dates: Record<string, string> = {};
  const nowIso = "2026-10-24T00:00:00.000Z";
  for (const c of catalog.categories) {
    dates[`category:${c.id}`] = nowIso;
  }
  for (const p of catalog.products) {
    dates[`product:${p.uid}`] = nowIso;
  }
  for (const b of blog.posts) {
    dates[`post:${b.uid}`] = new Date(b.publishedOn).toISOString();
  }
  return dates;
}

async function main() {
  console.log("Generating mock data from legacy seed sources...");
  const showcase = generateShowcase();
  const fastPrint = generateFastPrint();
  const blog = generateBlog();
  const menus = generateMenus();
  const catalog = generateCatalog();
  const revisionDates = generateRevisionDates(catalog, blog);

  const outputDir = path.join(process.cwd(), "lib", "mock-data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, "showcase.json"), JSON.stringify(showcase, null, 2), "utf8");
  fs.writeFileSync(path.join(outputDir, "fast-print.json"), JSON.stringify(fastPrint, null, 2), "utf8");
  fs.writeFileSync(path.join(outputDir, "blog.json"), JSON.stringify(blog, null, 2), "utf8");
  fs.writeFileSync(path.join(outputDir, "menus.json"), JSON.stringify(menus, null, 2), "utf8");
  fs.writeFileSync(path.join(outputDir, "catalog.json"), JSON.stringify(catalog, null, 2), "utf8");
  fs.writeFileSync(path.join(outputDir, "revision-dates.json"), JSON.stringify(revisionDates, null, 2), "utf8");

  // Also write an index.ts to export them strongly typed!
  const indexTsContent = `// Static Mock Data for Viet Dragon
import type { Catalog, MenuView } from "@/lib/content/read/types";
import type { FastPrint, ShowcaseItemView } from "@/lib/content/read/merchandising";
import type { Blog } from "@/lib/content/read/posts";

import rawCatalog from "./catalog.json";
import rawMenus from "./menus.json";
import rawBlog from "./blog.json";
import rawFastPrint from "./fast-print.json";
import rawShowcase from "./showcase.json";
import rawRevisionDates from "./revision-dates.json";

export const mockCatalog = rawCatalog as unknown as Catalog;
export const mockMenus = rawMenus as unknown as Record<string, MenuView>;
export const mockBlog = rawBlog as unknown as Blog;
export const mockFastPrint = rawFastPrint as unknown as FastPrint;
export const mockShowcase = rawShowcase as unknown as ShowcaseItemView[];
export const mockRevisionDates = rawRevisionDates as unknown as Record<string, string>;
`;

  fs.writeFileSync(path.join(outputDir, "index.ts"), indexTsContent, "utf8");

  console.log("SUCCESS: Finished generating all mock data into lib/mock-data/:");
  console.log(`- Categories: ${catalog.categories.length}`);
  console.log(`- Products: ${catalog.products.length}`);
  console.log(`- Traits: ${Object.keys(catalog.traits).length}`);
  console.log(`- Materials: ${Object.keys(catalog.materials).length}`);
  console.log(`- Menus: ${Object.keys(menus).length}`);
  console.log(`- Blog Posts: ${blog.posts.length}`);
  console.log(`- Fast Print items: ${fastPrint.items.length}`);
  console.log(`- Showcase items: ${showcase.length}`);
  console.log(`- Revision Dates: ${Object.keys(revisionDates).length}`);
}

main().catch((err) => {
  console.error("Error generating mock data:", err);
  process.exit(1);
});
