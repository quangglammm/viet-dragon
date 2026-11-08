import type { CategoryDocument, MaterialDocument, SpecItemDocument, TraitDocument } from "@/lib/content/schemas";
import type { CatalogInput } from "@/lib/content/read/catalog";
import { productDocument, slugsOf } from "./documents";

// The library records and categories the fixture product refers to, so the read layer can be tested on documents alone.

export function categoryDocument(key = "marketing", overrides: Partial<CategoryDocument> = {}): CategoryDocument {
  return {
    schema: 2,
    key,
    slugs: slugsOf("tiep-thi", "marketing", { vi: ["marketing"] }),
    icon: "Briefcase",
    cover: "images/category/mkt.jpg",
    ogImage: null,
    position: 0,
    i18n: { vi: { name: "Tiếp thị", description: "Ấn phẩm quảng bá" }, en: { name: "Marketing", description: "Promotional prints" } },
    ...overrides,
  };
}

export const MATERIAL_C: MaterialDocument = { schema: 2, key: "giay-loai-c", icon: "Layers", i18n: { vi: { name: "Giấy loại C" }, en: { name: "Type C Paper" }, zh: { name: "C类纸" } } };
export const TRAIT_GLOSSY: TraitDocument = { schema: 2, key: "glossy-coat", icon: "Sparkles", i18n: { vi: { label: "Bóng", description: "Mặt bóng" }, en: { label: "Glossy" } } };
export const SPEC_OFFSET: SpecItemDocument = { schema: 2, key: "technique/offset", isDefault: true, i18n: { vi: { label: "In offset" }, en: { label: "Offset printing" } } };
export const SPEC_MATTE: SpecItemDocument = { schema: 2, key: "finishing/matte-lamination", isDefault: false, i18n: { vi: { label: "Cán màng mờ" }, en: { label: "Matte lamination" } } };

export function catalogInput(): CatalogInput {
  return { categories: [categoryDocument()], products: [productDocument()], materials: [MATERIAL_C], traits: [TRAIT_GLOSSY], specItems: [SPEC_OFFSET, SPEC_MATTE] };
}
