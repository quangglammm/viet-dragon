// data/categories.ts
// Product category data for the Products/Catalogue section.
// Map over `productCategories` for the parent grid, and `.items` for each
// category's sub-item tag list (pairs well with shadcn `card` + `badge`).

import type { MaterialTraitKey } from "./material-traits";

/**
 * A selectable variant of the product (e.g. a paper stock), rendered as a
 * flashcard on the product detail page. Not paper-specific — reusable for any
 * future per-product option grouping (finish types, size options, etc.).
 */
export interface ProductOption {
  /** lucide-react icon name for the flashcard header. Falls back to a generic layers icon. */
  icon?: string;
  name: string;
  nameVi: string;
  /** Short second-person hook rendered above the flashcard (e.g. "Need a card that stands out?") — helps a customer self-select before reading the bullets. */
  tagline: string;
  taglineVi: string;
  /** Bullet points describing the material's physical characteristics. */
  description: string[];
  descriptionVi: string[];
  /** Trait key per `description` bullet (same index) — looked up in data/material-traits.ts for that bullet's icon. */
  descriptionTraits: MaterialTraitKey[];
  /** Bullet points describing the application contexts this option suits best. */
  bestFor: string[];
  bestForVi: string[];
  /**
   * Optional photo for the flashcard's flip-to-reveal back face (e.g. a shot of
   * this specific paper stock). Falls back to the parent product's `image` when
   * omitted — no distinct per-material photography exists yet.
   */
  image?: string;
  /**
   * Optional array of photos for the flashcard's flip-to-reveal back face.
   * If provided, will be displayed as a grid on desktop.
   */
  images?: string[];
  /**
   * Photo of the same stock with no foil accent — shown on the back face when
   * the "Ép kim" (foil stamping) checkbox is unchecked. The foil/double-sided
   * checkboxes are offered on every flashcard regardless of this field; when
   * omitted, checking foil has no back-face image swap and `image` is shown as-is.
   */
  pureImage?: string;
  /**
   * Array of photos for the pure stock (no foil).
   */
  pureImages?: string[];
  /** If true, overrides the product-level hideFoilCheckbox setting */
  hideFoilCheckbox?: boolean;
  /** If true, overrides the product-level hideDoubleSidedCheckbox setting */
  hideDoubleSidedCheckbox?: boolean;
  /** Base unit price in VND */
  basePrice?: number;
  /** Additional cost for double-sided printing in VND */
  doubleSidedPrice?: number;
  /** Additional cost for 1-side foil stamping in VND */
  foilPrice?: number;
  /** Additional cost for 2-side foil stamping in VND */
  foil2SidesPrice?: number;
  /** Display unit label in Vietnamese (e.g. "Hộp", "Cuốn", "Tờ", "Cái") */
  unitVi?: string;
  /** Display unit label in English (e.g. "Boxes", "Books", "Pieces") */
  unitEn?: string;
}

/** A row of option flashcards (e.g. the paper-stock choices for a product). */
export interface ProductOptionGroup {
  options: ProductOption[];
}

export interface ProductItem {
  id: string;
  nameEn: string;
  nameVi: string;
  /** English description */
  description: string;
  descriptionVi: string;
  image: string;
  images?: string[];
  pureImage?: string;
  pureImages?: string[];
  /** If true, the "Foil Stamping" (Ép kim) checkbox is hidden for all materials of this product */
  hideFoilCheckbox?: boolean;
  /** If true, the "Double Sided" (In 2 mặt) checkbox is hidden for all materials of this product */
  hideDoubleSidedCheckbox?: boolean;
  basePrice?: number;
  doubleSidedPrice?: number;
  foilPrice?: number;
  foil2SidesPrice?: number;
  unitVi?: string;
  unitEn?: string;
  optionGroups?: ProductOptionGroup[];
}

export interface ProductCategory {
  id: string;
  nameEn: string;
  nameVi: string;
  /** English description */
  description: string;
  descriptionVi: string;
  /** lucide-react icon name, for use with shadcn components */
  icon: string;
  /** Hero / cover image for the category page */
  coverImage: string;
  items: ProductItem[];
}

import storedProducts from "./content/products.json";

export const productCategories: ProductCategory[] = storedProducts as unknown as ProductCategory[];

export const showcaseImages = [
  {
    seed: "vd-show-1",
    src: "/images/product/vd-item-card.jpeg",
    label: "Danh thiếp cao cấp",
    labelEn: "Premium Business Cards",
    aspect: "tall",
  },
  {
    seed: "vd-show-2",
    src: "/images/product/vd-item-box.jpg",
    label: "Hộp giấy sang trọng",
    labelEn: "Luxury Packaging",
    aspect: "square",
  },
  {
    seed: "vd-show-3",
    src: "/images/product/vd-item-catalogue.jpeg",
    label: "Catalogue chuyên nghiệp",
    labelEn: "Professional Catalogue",
    aspect: "square",
  },
  {
    seed: "vd-show-4",
    src: "/images/product/vd-item-label.jpeg",
    label: "Nhãn mác tinh tế",
    labelEn: "Premium Labels",
    aspect: "wide",
  },
  {
    seed: "vd-show-5",
    src: "/images/product/vd-item-lixi.jpeg",
    label: "Bao lì xì Tết",
    labelEn: "Tet Lucky Envelopes",
    aspect: "wide",
  },
] as const;

export function isFastPrint(id: string): boolean {
  return [
    "card",
    "flyer",
    "voucher",
    "envelope",
    "letterhead",
    "decal",
    "li-xi",
    "in-nhanh-danh-thiep",
    "in-nhanh-to-roi",
    "in-nhanh-voucher",
    "in-nhanh-tem-nhan",
    "standee",
    "poster",
    "tem-bao-hanh",
  ].includes(id);
}

export function getStartingPrice(id: string, locale: string): string {
  const isVi = locale === "vi";
  const prices: Record<string, { vi: string; en: string }> = {
    card: { vi: "Chỉ từ 200.000đ/Hộp", en: "From 200,000đ/Box" },
    folder: { vi: "Chỉ từ 8.000đ/Cái", en: "From 8,000đ/Pcs" },
    catalogue: { vi: "Chỉ từ 25.000đ/Cuốn", en: "From 25,000đ/Book" },
    letterhead: { vi: "Chỉ từ 180.000đ/Ram", en: "From 180,000đ/Ream" },
    envelope: { vi: "Chỉ từ 150.000đ/Hộp", en: "From 150,000đ/Box" },
    "paper-bag": { vi: "Chỉ từ 12.000đ/Túi", en: "From 12,000đ/Bag" },
    box: { vi: "Chỉ từ 15.000đ/Hộp", en: "From 15,000đ/Box" },
    "paper-box": { vi: "Chỉ từ 15.000đ/Hộp", en: "From 15,000đ/Box" },
    decal: { vi: "Chỉ từ 500đ/Tem", en: "From 500đ/Stamp" },
    "li-xi": { vi: "Chỉ từ 1.500đ/Cái", en: "From 1,500đ/Pcs" },
    photobook: { vi: "Chỉ từ 280.000đ/Cuốn", en: "From 280,000đ/Book" },
    "thiep-ca-nhan": { vi: "Chỉ từ 5.000đ/Bộ", en: "From 5,000đ/Set" },
    "tranh-canvas": { vi: "Chỉ từ 150.000đ/Bức", en: "From 150,000đ/Pcs" },
    "ky-yeu": { vi: "Chỉ từ 120.000đ/Cuốn", en: "From 120,000đ/Book" },
    "so-tay-qua-tang": { vi: "Chỉ từ 85.000đ/Cuốn", en: "From 85,000đ/Book" },
    "binh-giu-nhiet": { vi: "Chỉ từ 160.000đ/Bình", en: "From 160,000đ/Bottle" },
    "ao-dong-phuc": { vi: "Chỉ từ 65.000đ/Cái", en: "From 65,000đ/Pcs" },
    "moc-khoa": { vi: "Chỉ từ 12.000đ/Cái", en: "From 12,000đ/Pcs" },
    standee: { vi: "Chỉ từ 180.000đ/Bộ", en: "From 180,000đ/Set" },
    poster: { vi: "Chỉ từ 35.000đ/Tờ", en: "From 35,000đ/Sheet" },
    "the-nhua": { vi: "Chỉ từ 18.000đ/Thẻ", en: "From 18,000đ/Card" },
    "tem-bao-hanh": { vi: "Chỉ từ 300đ/Tem", en: "From 300đ/Stamp" },
    "in-nhanh-danh-thiep": { vi: "Chỉ từ 120.000đ/Hộp", en: "From 120,000đ/Box" },
    "in-nhanh-to-roi": { vi: "Chỉ từ 850đ/Tờ", en: "From 850đ/Sheet" },
    "in-nhanh-voucher": { vi: "Chỉ từ 1.100đ/Tờ", en: "From 1,100đ/Sheet" },
    "in-nhanh-tem-nhan": { vi: "Chỉ từ 400đ/Tem", en: "From 400đ/Stamp" },
  };
  const match = prices[id];
  if (match) return isVi ? match.vi : match.en;
  return isVi ? "Nhận báo giá trong 30 phút" : "Get a quote in 30 mins";
}
