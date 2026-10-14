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
  nameZh?: string;
  nameJa?: string;
  nameKo?: string;
  /** Short second-person hook rendered above the flashcard (e.g. "Need a card that stands out?") — helps a customer self-select before reading the bullets. */
  tagline: string;
  taglineVi: string;
  taglineZh?: string;
  taglineJa?: string;
  taglineKo?: string;
  /** Bullet points describing the material's physical characteristics. */
  description: string[];
  descriptionVi: string[];
  descriptionZh?: string[];
  descriptionJa?: string[];
  descriptionKo?: string[];
  /** Trait key per `description` bullet (same index) — looked up in data/material-traits.ts for that bullet's icon. */
  descriptionTraits: MaterialTraitKey[];
  /** Bullet points describing the application contexts this option suits best. */
  bestFor: string[];
  bestForVi: string[];
  bestForZh?: string[];
  bestForJa?: string[];
  bestForKo?: string[];
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
  unitZh?: string;
  unitJa?: string;
  unitKo?: string;
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

import { MAIN_CATEGORIES } from "./subgroups-catalog";

export const productCategories: ProductCategory[] = MAIN_CATEGORIES as unknown as ProductCategory[];

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
    "danh-thiep",
    "flyer",
    "to-roi",
    "to-gap",
    "voucher",
    "vouchers",
    "envelope",
    "bao-thu",
    "letterhead",
    "giay-tieu-de",
    "decal",
    "nhan-dan",
    "li-xi",
    "bao-li-xi",
    "in-nhanh-danh-thiep",
    "in-nhanh-to-roi",
    "in-nhanh-voucher",
    "in-nhanh-tem-nhan",
  ].includes(id);
}

export function getStartingPrice(id: string, locale: string): string {
  const prices: Record<string, { vi: string; en: string; zh: string; ja: string; ko: string }> = {
    // Legacy product keys
    card: { vi: "Chỉ từ 200.000đ/Hộp", en: "From 200,000đ/Box", zh: "起价 200,000đ/盒", ja: "200,000đ〜/箱", ko: "200,000đ부터/박스" },
    folder: { vi: "Chỉ từ 8.000đ/Cái", en: "From 8,000đ/Pcs", zh: "起价 8,000đ/个", ja: "8,000đ〜/個", ko: "8,000đ부터/개" },
    catalogue: { vi: "Chỉ từ 25.000đ/Cuốn", en: "From 25,000đ/Book", zh: "起价 25,000đ/本", ja: "25,000đ〜/冊", ko: "25,000đ부터/권" },
    letterhead: { vi: "Chỉ từ 180.000đ/Ram", en: "From 180,000đ/Ream", zh: "起价 180,000đ/令", ja: "180,000đ〜/連", ko: "180,000đ부터/련" },
    envelope: { vi: "Chỉ từ 150.000đ/Hộp", en: "From 150,000đ/Box", zh: "起价 150,000đ/盒", ja: "150,000đ〜/箱", ko: "150,000đ부터/박스" },
    "paper-bag": { vi: "Chỉ từ 12.000đ/Túi", en: "From 12,000đ/Bag", zh: "起价 12,000đ/袋", ja: "12,000đ〜/袋", ko: "12,000đ부터/백" },
    box: { vi: "Chỉ từ 15.000đ/Hộp", en: "From 15,000đ/Box", zh: "起价 15,000đ/盒", ja: "15,000đ〜/箱", ko: "15,000đ부터/박스" },
    "paper-box": { vi: "Chỉ từ 15.000đ/Hộp", en: "From 15,000đ/Box", zh: "起价 15,000đ/盒", ja: "15,000đ〜/箱", ko: "15,000đ부터/박스" },
    decal: { vi: "Chỉ từ 500đ/Tem", en: "From 500đ/Stamp", zh: "起价 500đ/贴", ja: "500đ〜/枚", ko: "500đ부터/매" },
    "li-xi": { vi: "Chỉ từ 1.500đ/Cái", en: "From 1,500đ/Pcs", zh: "起价 1,500đ/个", ja: "1,500đ〜/個", ko: "1,500đ부터/개" },
    photobook: { vi: "Chỉ từ 280.000đ/Cuốn", en: "From 280,000đ/Book", zh: "起价 280,000đ/本", ja: "280,000đ〜/冊", ko: "280,000đ부터/권" },
    "thiep-ca-nhan": { vi: "Chỉ từ 5.000đ/Bộ", en: "From 5,000đ/Set", zh: "起价 5,000đ/套", ja: "5,000đ〜/セット", ko: "5,000đ부터/세트" },
    "tranh-canvas": { vi: "Chỉ từ 150.000đ/Bức", en: "From 150,000đ/Pcs", zh: "起价 150,000đ/幅", ja: "150,000đ〜/点", ko: "150,000đ부터/점" },
    "ky-yeu": { vi: "Chỉ từ 120.000đ/Cuốn", en: "From 120,000đ/Book", zh: "起价 120,000đ/本", ja: "120,000đ〜/冊", ko: "120,000đ부터/권" },
    "in-nhanh-danh-thiep": { vi: "Chỉ từ 120.000đ/Hộp", en: "From 120,000đ/Box", zh: "起价 120,000đ/盒", ja: "120,000đ〜/箱", ko: "120,000đ부터/박스" },
    "in-nhanh-to-roi": { vi: "Chỉ từ 850đ/Tờ", en: "From 850đ/Sheet", zh: "起价 850đ/张", ja: "850đ〜/枚", ko: "850đ부터/매" },
    "in-nhanh-voucher": { vi: "Chỉ từ 1.100đ/Tờ", en: "From 1,100đ/Sheet", zh: "起价 1,100đ/张", ja: "1,100đ〜/枚", ko: "1,100đ부터/매" },
    "in-nhanh-tem-nhan": { vi: "Chỉ từ 400đ/Tem", en: "From 400đ/Stamp", zh: "起价 400đ/贴", ja: "400đ〜/枚", ko: "400đ부터/매" },

    // Subgroup catalog keys
    "danh-thiep": { vi: "Chỉ từ 200.000đ/Hộp", en: "From 200,000đ/Box", zh: "起价 200,000đ/盒", ja: "200,000đ〜/箱", ko: "200,000đ부터/박스" },
    "poster-bangron-standee": { vi: "Chỉ từ 65.000đ/M2", en: "From 65,000đ/m²", zh: "起价 65,000đ/平方米", ja: "65,000đ〜/m²", ko: "65,000đ부터/m²" },
    "to-roi": { vi: "Chỉ từ 850đ/Tờ", en: "From 850đ/Sheet", zh: "起价 850đ/张", ja: "850đ〜/枚", ko: "850đ부터/매" },
    "to-gap": { vi: "Chỉ từ 1.200đ/Tờ", en: "From 1,200đ/Sheet", zh: "起价 1,200đ/张", ja: "1,200đ〜/枚", ko: "1,200đ부터/매" },
    "bao-thu": { vi: "Chỉ từ 150.000đ/Hộp", en: "From 150,000đ/Box", zh: "起价 150,000đ/盒", ja: "150,000đ〜/箱", ko: "150,000đ부터/박스" },
    "giay-tieu-de": { vi: "Chỉ từ 180.000đ/Ram", en: "From 180,000đ/Ream", zh: "起价 180,000đ/令", ja: "180,000đ〜/連", ko: "180,000đ부터/련" },
    "nhan-dan": { vi: "Chỉ từ 500đ/Tem", en: "From 500đ/Stamp", zh: "起价 500đ/贴", ja: "500đ〜/枚", ko: "500đ부터/매" },
    "tui-giay": { vi: "Chỉ từ 12.000đ/Túi", en: "From 12,000đ/Bag", zh: "起价 12,000đ/袋", ja: "12,000đ〜/袋", ko: "12,000đ부터/백" },
    "hop-giay": { vi: "Chỉ từ 15.000đ/Hộp", en: "From 15,000đ/Box", zh: "起价 15,000đ/盒", ja: "15,000đ〜/箱", ko: "15,000đ부터/박스" },
    "mac-san-pham": { vi: "Chỉ từ 350đ/Cái", en: "From 350đ/Pcs", zh: "起价 350đ/个", ja: "350đ〜/個", ko: "350đ부터/개" },
    "lich-tet": { vi: "Chỉ từ 45.000đ/Cuốn", en: "From 45,000đ/Book", zh: "起价 45,000đ/本", ja: "45,000đ〜/冊", ko: "45,000đ부터/권" },
    "bao-li-xi": { vi: "Chỉ từ 1.500đ/Cái", en: "From 1,500đ/Pcs", zh: "起价 1,500đ/个", ja: "1,500đ〜/個", ko: "1,500đ부터/개" },
    "thiep-tet": { vi: "Chỉ từ 5.000đ/Bộ", en: "From 5,000đ/Set", zh: "起价 5,000đ/套", ja: "5,000đ〜/セット", ko: "5,000đ부터/세트" },
    catalogues: { vi: "Chỉ từ 25.000đ/Cuốn", en: "From 25,000đ/Book", zh: "起价 25,000đ/本", ja: "25,000đ〜/冊", ko: "25,000đ부터/권" },
    "bia-dung-ho-so": { vi: "Chỉ từ 8.000đ/Cái", en: "From 8,000đ/Pcs", zh: "起价 8,000đ/个", ja: "8,000đ〜/個", ko: "8,000đ부터/개" },
    "giay-ghi-chu": { vi: "Chỉ từ 15.000đ/Cuốn", en: "From 15,000đ/Book", zh: "起价 15,000đ/本", ja: "15,000đ〜/冊", ko: "15,000đ부터/권" },
    "ve-tickets": { vi: "Chỉ từ 400đ/Vé", en: "From 400đ/Ticket", zh: "起价 400đ/张", ja: "400đ〜/枚", ko: "400đ부터/매" },
    vouchers: { vi: "Chỉ từ 600đ/Phiếu", en: "From 600đ/Voucher", zh: "起价 600đ/张", ja: "600đ〜/枚", ko: "600đ부터/매" },
    "ao-thun": { vi: "Chỉ từ 85.000đ/Áo", en: "From 85,000đ/Shirt", zh: "起价 85,000đ/件", ja: "85,000đ〜/枚", ko: "85,000đ부터/티셔츠" },
  };
  const match = prices[id];
  if (match) {
    if (locale === "vi") return match.vi;
    if (locale === "zh") return match.zh;
    if (locale === "ja") return match.ja;
    if (locale === "ko") return match.ko;
    return match.en;
  }
  if (locale === "vi") return "Nhận báo giá trong 30 phút";
  if (locale === "zh") return "30分钟内获取报价";
  if (locale === "ja") return "30分以内にお見積もり";
  if (locale === "ko") return "30분 내 견적 받기";
  return "Get a quote in 30 mins";
}
